package com.resumeagent.controller;

import com.resumeagent.dto.request.LoginRequest;
import com.resumeagent.dto.request.RegisterAdminAndUserRequest; // [ADDED]
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.dto.response.LoginResponse;
import com.resumeagent.dto.response.UserInfoResponse;
import com.resumeagent.service.AuthenticationService;
import com.resumeagent.service.UserService; // [ADDED]
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
@RequestMapping(value = "/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;

    // [ADDED] Service responsible for USER registration
    private final UserService userService;

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
}
