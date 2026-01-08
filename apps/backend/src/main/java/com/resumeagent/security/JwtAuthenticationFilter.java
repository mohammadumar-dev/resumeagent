package com.resumeagent.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter
 * Intercepts ALL HTTP requests to validate JWT and populate SecurityContext
 * FILTER EXECUTION ORDER:
 * This filter runs BEFORE Spring Security's authorization filters
 * It extracts JWT from cookie, validates it, and sets authentication
 * SECURITY ARCHITECTURE:
 * - Access token extracted from HttpOnly cookie (not Authorization header)
 * - Token signature verified with RSA public key
 * - UserDetails loaded fresh from database (stateless, no caching)
 * - SecurityContext populated for downstream authorization
 * NO SILENT FAILURES:
 * All validation errors are logged explicitly
 * Invalid tokens result in unauthenticated request (not 403)
 * Allows public endpoints to work normally
 * THREAT MITIGATION:
 * - Token Tampering: RSA signature verification
 * - Expired Tokens: Expiry check before authentication
 * - User State Changes: Fresh UserDetails load on each request
 * - Token Type Confusion: Validates token type is "access"
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final CookieUtil cookieUtil;

    /**
     * Filter logic executed once per request
     * FLOW:
     * 1. Extract access token from cookie
     * 2. If token exists:
     * a. Validate signature and expiry
     * b. Validate token type is "access"
     * c. Extract username
     * d. Load UserDetails from database
     * e. Create Authentication object
     * f. Set SecurityContext
     * 3. If token missing/invalid:
     * - Continue filter chain without authentication
     * - Public endpoints work normally
     * - Protected endpoints will be blocked by Spring Security
     * STATELESS DESIGN:
     * SecurityContext is cleared after each request
     * No authentication state persists beyond single request
     * 
     * @param request     HTTP request
     * @param response    HTTP response
     * @param filterChain Filter chain to continue
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            // Extract access token from cookie
            String jwt = cookieUtil.getAccessToken(request).orElse(null);

            if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Validate token signature and expiry
                if (jwtTokenProvider.validateToken(jwt)) {

                    // Validate token type (must be "access", not "refresh")
                    if (!jwtTokenProvider.validateTokenType(jwt, "access")) {
                        log.warn("Token type validation failed: expected 'access'");
                        // SECURITY: Don't authenticate with refresh token
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Extract username from token
                    String username = jwtTokenProvider.extractUsername(jwt);

                    // Load user details from database
                    // FRESH LOAD: Ensures account status changes take effect immediately
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    // Set request details (IP, session, etc.)
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set SecurityContext for this request
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("JWT authentication successful for user: {}", username);
                }
            }

        } catch (Exception e) {
            // NO SILENT FAILURES
            log.error("JWT authentication error: {}", e.getMessage(), e);
            // Clear SecurityContext on error (fail closed)
            SecurityContextHolder.clearContext();
        }

        // Continue filter chain (authentication may or may not be set)
        filterChain.doFilter(request, response);
    }
}
