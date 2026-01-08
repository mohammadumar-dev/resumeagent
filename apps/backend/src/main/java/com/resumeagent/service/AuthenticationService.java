package com.resumeagent.service;

import com.resumeagent.dto.request.LoginRequest;
import com.resumeagent.dto.response.LoginResponse;
import com.resumeagent.dto.response.UserInfoResponse;
import com.resumeagent.entity.User;
import com.resumeagent.repository.UserRepository;
import com.resumeagent.security.CookieUtil;
import com.resumeagent.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication Service
 * Orchestrates authentication operations:
 * - Login (credential validation + token generation)
 * - Logout (token revocation)
 * - Get current user info
 * SECURITY PRINCIPLES:
 * - All authentication logic happens server-side
 * - Frontend is considered untrusted
 * - Generic error messages prevent account enumeration
 * - Account status checks enforce email verification
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final CookieUtil cookieUtil;

    /**
     * Authenticate user and issue tokens
     * LOGIN FLOW:
     * 1. Validate credentials (email + password)
     * 2. Check account status (email verified, not blocked)
     * 3. Generate access token (short-lived, 15 min)
     * 4. Generate refresh token (long-lived, 30 days)
     * 5. Hash and store refresh token in database
     * 6. Set tokens as HttpOnly Secure cookies
     * 7. Return success response
     * SECURITY ENFORCEMENT:
     * - Password compared using BCrypt (slow, rate-limited)
     * - Email must be verified (emailActive = true)
     * - Generic error messages (don't reveal if email exists)
     * - Failed attempts should be logged for rate limiting (future)
     * THREAT MITIGATION:
     * - Credential Stuffing: BCrypt slows brute force
     * - Account Enumeration: Same error for invalid email/password
     * - Unauthorized Access: Email verification required
     * 
     * @param request      Login credentials
     * @param httpRequest  HTTP request for context
     * @param httpResponse HTTP response for setting cookies
     * @return Login response with success message
     * @throws BadCredentialsException if credentials invalid or account not
     *                                 verified
     */
    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: user not found for email: {}", request.getEmail());
                    // SECURITY: Generic message doesn't reveal if email exists
                    return new BadCredentialsException("Invalid email or password");
                });

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Login failed: invalid password for email: {}", request.getEmail());
            // SECURITY: Same error message as user not found
            throw new BadCredentialsException("Invalid email or password");
        }

        // Check if email is verified
        if (!user.isEmailActive()) {
            log.warn("Login failed: email not verified for user: {}", request.getEmail());
            throw new BadCredentialsException("Email not verified. Please check your inbox.");
        }

        // TODO: Check if account is blocked (future enhancement)
        // if (user.isBlocked()) {
        // throw new BadCredentialsException("Account has been blocked. Contact
        // support.");
        // }

        // Create UserDetails for token generation
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getUserRole().name())
                .build();

        // Generate access token (short-lived)
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);

        // Generate refresh token (long-lived)
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        // Store hashed refresh token in database
        refreshTokenService.createRefreshToken(user, refreshToken, httpRequest);

        // Set tokens as HttpOnly Secure cookies
        Cookie accessCookie = cookieUtil.createAccessTokenCookie(accessToken);
        Cookie refreshCookie = cookieUtil.createRefreshTokenCookie(refreshToken);

        // Add cookies with SameSite attributes
        cookieUtil.addCookieWithSameSite(httpResponse, accessCookie, "Lax");
        cookieUtil.addCookieWithSameSite(httpResponse, refreshCookie, "Strict");

        log.info("Login successful for user: {}", user.getEmail());

        return LoginResponse.builder()
                .message("Login successful")
                .email(user.getEmail())
                .build();
    }

    /**
     * Logout user (revoke refresh token, clear cookies)
     * LOGOUT FLOW:
     * 1. Extract refresh token from cookie
     * 2. If exists, delete from database
     * 3. Clear both access and refresh cookies
     * 4. Access token expires naturally (no server-side revocation)
     * STATELESS DESIGN:
     * - No session invalidation (backend is stateless)
     * - Access tokens cannot be revoked (short expiry mitigates this)
     * - Refresh token deletion prevents obtaining new access tokens
     * 
     * @param request  HTTP request
     * @param response HTTP response
     */
    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        // Extract refresh token from cookie
        // Validate and find token in database
        cookieUtil.getRefreshToken(request).flatMap(refreshTokenService::validateRefreshToken).ifPresent(token -> {
            // Delete refresh token from database
            refreshTokenService.deleteToken(token);
            log.info("Logout: deleted refresh token for user: {}", token.getUser().getEmail());
        });

        // Clear cookies (works even if token not found)
        response.addCookie(cookieUtil.deleteAccessTokenCookie());
        response.addCookie(cookieUtil.deleteRefreshTokenCookie());

        log.debug("Logout: cookies cleared");
    }

    /**
     * Get current authenticated user information
     * Used by GET /auth/me endpoint
     * AUTHENTICATION REQUIRED:
     * This method assumes user is already authenticated
     * Spring Security has validated JWT and populated SecurityContext
     * 
     * @param authentication Spring Security Authentication object
     * @return User information DTO
     * @throws UsernameNotFoundException if user not found (should never happen)
     */
    @Transactional(readOnly = true)
    public UserInfoResponse getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return UserInfoResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getUserRole())
                .emailActive(user.isEmailActive())
                .plan(user.getPlan().name())
                .resumeGenerationLimit(user.getResumeGenerationLimit())
                .resumeGenerationUsed(user.getResumeGenerationUsed())
                .build();
    }
}
