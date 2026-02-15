package com.resumeagent.controller;

import com.resumeagent.dto.request.LoginRequest;
import com.resumeagent.dto.request.RegisterAdminAndUserRequest; // [ADDED]
import com.resumeagent.dto.request.ResendVerificationRequest;
import com.resumeagent.dto.request.ForgotPasswordRequest;
import com.resumeagent.dto.request.ResetPasswordRequest;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.dto.response.LoginResponse;
import com.resumeagent.dto.response.UserInfoResponse;
import com.resumeagent.service.AuthenticationService;
import com.resumeagent.service.PasswordResetService;
import com.resumeagent.service.UserService; // [ADDED]
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus; // [ADDED]
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * Authentication Controller
 * Provides authentication endpoints:
 * - POST /auth/login - User login
 * - POST /auth/logout - User logout
 * - GET /auth/me - Get current user info
 * - POST /auth/forgot-password - Request password reset
 * - POST /auth/reset-password - Reset password using token
 * SECURITY NOTES:
 * - All tokens sent via HttpOnly Secure cookies
 * - No tokens in response bodies
 * - Generic error messages prevent account enumeration
 * - HTTPS required in production
 */
@RestController
@RequestMapping(value = "/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;

    // [ADDED] Service responsible for USER registration
    private final UserService userService;

    // [ADDED] Service handling password reset lifecycle
    private final PasswordResetService passwordResetService;

    /**
     * Login endpoint
     * PUBLIC ENDPOINT (no authentication required)
     * Request Body: "email": "user@example.com", "password": "..."
     * Response: { "message": "Login successful", "email": "user@example.com" }
     * Cookies Set: accessToken, refreshToken
     * HTTP STATUS CODES:
     * - 200 OK: Login successful
     * - 400 Bad Request: Validation error (missing fields)
     * - 401 Unauthorized: Invalid credentials or email not verified
     * - 500 Internal Server Error: Server error
     * SECURITY:
     * - Credentials transmitted in HTTPS POST body
     * - Tokens returned as HttpOnly cookies (not in response body)
     * - Failed attempts logged for rate limiting (future)
     *
     * @param request      Login credentials
     * @param httpRequest  HTTP request for context
     * @param httpResponse HTTP response for setting cookies
     * @return Login response
     */
    @PostMapping(value = "/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        LoginResponse response = authenticationService.login(request, httpRequest, httpResponse);
        return ResponseEntity.ok(response);
    }

    /**
     * Logout endpoint
     * REQUIRES AUTHENTICATION (access token in cookie)
     * Revokes refresh token and clears cookies
     * Access token expires naturally (cannot be server-revoked in stateless design)
     * HTTP STATUS CODES:
     * - 200 OK: Logout successful
     * - 401 Unauthorized: No valid access token (but logout still works)
     * SECURITY:
     * - Refresh token deleted from database
     * - Prevents obtaining new access tokens
     * - Works even if user not authenticated (idempotent)
     *
     * @param request  HTTP request
     * @param response HTTP response
     * @return Success message
     */
    @PostMapping(value = "/logout")
    public ResponseEntity<CommonResponse> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        authenticationService.logout(request, response);
        CommonResponse resp = CommonResponse.builder()
                .message("Logged out successfully")
                .build();
        return ResponseEntity.ok(resp);
    }

    /**
     * Get current user information
     * REQUIRES AUTHENTICATION (access token in cookie)
     * Returns details of currently authenticated user
     * HTTP STATUS CODES:
     * - 200 OK: User info returned
     * - 401 Unauthorized: No valid access token
     * - 403 Forbidden: Account blocked or email not verified
     * SECURITY:
     * - Only returns current user's info (no user ID parameter)
     * - Prevents unauthorized access to other users' data
     * - Account status enforced by Spring Security
     *
     * @param authentication Spring Security Authentication object (injected)
     * @return User information
     */
    @GetMapping(value = "/me")
    public ResponseEntity<UserInfoResponse> getCurrentUser(Authentication authentication) {
        UserInfoResponse userInfo = authenticationService.getCurrentUser(authentication);
        return ResponseEntity.ok(userInfo);
    }

    /**
     * Register a new standard USER account.
     * PUBLIC ENDPOINT (no authentication required)
     *
     * Flow:
     * - Validates request payload
     * - Creates USER account with emailActive = false
     * - Generates email verification token
     * - Sends verification email
     *
     * HTTP STATUS CODES:
     * - 201 CREATED: Registration successful
     * - 400 BAD REQUEST: Validation errors
     * - 409 CONFLICT: Email already exists
     *
     * SECURITY NOTES:
     * - Password is stored as BCrypt hash
     * - Email verification is required before login
     * - Generic errors prevent account enumeration
     *
     * @param request registration payload
     * @return registration success response
     */
    @PostMapping(value = "/register")
    public ResponseEntity<CommonResponse> registerUser(
            @Valid @RequestBody RegisterAdminAndUserRequest request) {

        CommonResponse response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Email verification endpoint.
     * This endpoint is called when a user clicks the verification link
     * sent to their email address.
     * Flow:
     * - Accepts a verification token as a request parameter
     * - Delegates validation and verification logic to the service layer
     * HTTP behavior:
     * - 200 OK when email is verified successfully
     * - 400 BAD REQUEST for invalid or expired tokens
     * - 404 NOT FOUND if token does not exist
     * SECURITY NOTES:
     * - Token is passed as a request parameter (safe for one-time verification)
     * - No authentication required (public endpoint)
     * - Token validity and usage checks are enforced server-side
     */
    @GetMapping(value = "/verify-email")
    public CommonResponse verifyEmail(@NotBlank @RequestParam("token") String token) {
        return authenticationService.verifyToken(token);
    }

    /**
     * Resend email verification link.
     * PUBLIC ENDPOINT (no authentication required)
     * 
     * Flow:
     * - Validates that email exists
     * - Checks if email is already verified
     * - Generates new verification token
     * - Sends verification email
     * 
     * HTTP STATUS CODES:
     * - 200 OK: Verification email sent (or generic success message)
     * - 400 BAD REQUEST: Email already verified
     * 
     * SECURITY NOTES:
     * - Returns generic message to prevent email enumeration
     * - Rate limiting should be implemented to prevent spam
     * 
     * @param request email address
     * @return success message
     */
    @PostMapping(value = "/resend-verification")
    public ResponseEntity<CommonResponse> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {

        CommonResponse response = authenticationService.resendVerificationEmail(request.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * Request a password reset link (public endpoint).
     * Behavior: Always returns 200 with a generic message to prevent enumeration.
     *
     * Request Body: { "email": "user@example.com" }
     */
    @PostMapping(value = "/forgot-password")
    public ResponseEntity<CommonResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {

        try {
            passwordResetService.createAndSendPasswordResetToken(request.getEmail(), httpRequest);
        } catch (IOException | MessagingException e) {
            // Log details server-side but return generic message to client
            log.error("Failed to send password reset email for {}: {}", request.getEmail(), e.getMessage());
        }

        CommonResponse resp = CommonResponse.builder()
                .message("If this email is registered, a password reset link has been sent.")
                .build();

        return ResponseEntity.ok(resp);
    }

    /**
     * Perform password reset using token.
     *
     * Request Body: { "token": "...", "newPassword": "NewPass123!" }
     */
    @PostMapping(value = "/reset-password")
    public ResponseEntity<CommonResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());

        CommonResponse resp = CommonResponse.builder()
                .message("Password has been reset successfully.")
                .build();

        return ResponseEntity.ok(resp);
    }
}
