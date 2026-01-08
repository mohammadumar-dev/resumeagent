package com.resumeagent.controller;

import com.resumeagent.dto.request.LoginRequest;
import com.resumeagent.dto.response.LoginResponse;
import com.resumeagent.dto.response.UserInfoResponse;
import com.resumeagent.service.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Provides authentication endpoints:
 * - POST /auth/login - User login
 * - POST /auth/logout - User logout
 * - GET /auth/me - Get current user info
 * SECURITY NOTES:
 * - All tokens sent via HttpOnly Secure cookies
 * - No tokens in response bodies
 * - Generic error messages prevent account enumeration
 * - HTTPS required in production
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;

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
    @PostMapping("/login")
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
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        authenticationService.logout(request, response);
        return ResponseEntity.ok("Logged out successfully");
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
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getCurrentUser(Authentication authentication) {
        UserInfoResponse userInfo = authenticationService.getCurrentUser(authentication);
        return ResponseEntity.ok(userInfo);
    }
}
