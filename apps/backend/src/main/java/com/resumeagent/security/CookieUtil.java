package com.resumeagent.security;

import com.resumeagent.config.JwtProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

/**
 * Cookie Utility for managing JWT tokens in secure HTTP-only cookies
 * SECURITY ARCHITECTURE:
 * All authentication tokens are stored in cookies with strict security flags:
 * - HttpOnly: Prevents JavaScript access (XSS mitigation)
 * - Secure: HTTPS-only transmission (MITM mitigation)
 * - SameSite: CSRF protection
 * - Path scoping: Limits token exposure
 * THREAT MITIGATION:
 * - XSS Token Theft: HttpOnly flag prevents document. Cookie access
 * - CSRF: SameSite attribute blocks cross-site requests
 * - Man-in-the-Middle: Secure flag enforces encrypted transmission
 * - Token Leakage: Path scoping limits where cookies are sent
 */
@Component
@RequiredArgsConstructor
public class CookieUtil {

    private final JwtProperties jwtProperties;

    /**
     * Create access token cookie with security flags
     * Access Token Cookie Configuration:
     * - Path: / (sent with all requests)
     * - MaxAge: 15 minutes (short-lived)
     * - SameSite: Lax (allows top-level navigation)
     * SameSite=Lax chosen because:
     * - Allows normal user navigation (clicking links)
     * - Blocks CSRF from POST forms and AJAX
     * - Good balance between security and usability
     * 
     * @param token JWT access token
     * @return Configured Cookie object
     */
    public Cookie createAccessTokenCookie(String token) {
        Cookie cookie = new Cookie(jwtProperties.getAccessTokenCookieName(), token);
        cookie.setHttpOnly(jwtProperties.isCookieHttpOnly());
        cookie.setSecure(jwtProperties.isCookieSecure());
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtProperties.getAccessTokenExpirationMs() / 1000));

        // SameSite attribute (Lax for access token)
        // Note: SameSite must be set via response header in modern Spring Boot
        // The setAttribute method here is for documentation
        cookie.setAttribute("SameSite", "Lax");

        if (jwtProperties.getCookieDomain() != null) {
            cookie.setDomain(jwtProperties.getCookieDomain());
        }

        return cookie;
    }

    /**
     * Create refresh token cookie with STRICTER security flags
     * Refresh Token Cookie Configuration:
     * - Path: /auth/refresh (ONLY sent to refresh endpoint)
     * - MaxAge: 30 days (long-lived)
     * - SameSite: Strict (maximum CSRF protection)
     * PATH SCOPING RATIONALE:
     * Refresh token only needs to be sent to /auth/refresh endpoint
     * Limiting path reduces exposure if other endpoints are compromised
     * SameSite=Strict chosen because:
     * - Refresh is not user-initiated navigation
     * - No legitimate cross-site use case
     * - Maximum CSRF protection
     * 
     * @param token JWT refresh token
     * @return Configured Cookie object
     */
    public Cookie createRefreshTokenCookie(String token) {
        Cookie cookie = new Cookie(jwtProperties.getRefreshTokenCookieName(), token);
        cookie.setHttpOnly(jwtProperties.isCookieHttpOnly());
        cookie.setSecure(jwtProperties.isCookieSecure());
        cookie.setPath("/auth/refresh"); // SCOPED PATH
        cookie.setMaxAge((int) (jwtProperties.getRefreshTokenExpirationMs() / 1000));

        // SameSite=Strict for refresh token (maximum protection)
        cookie.setAttribute("SameSite", "Strict");

        if (jwtProperties.getCookieDomain() != null) {
            cookie.setDomain(jwtProperties.getCookieDomain());
        }

        return cookie;
    }

    /**
     * Create expired access token cookie for deletion
     * Cookie deletion is achieved by setting MaxAge to 0
     * Browser immediately discards the cookie
     * 
     * @return Expired cookie for deletion
     */
    public Cookie deleteAccessTokenCookie() {
        Cookie cookie = new Cookie(jwtProperties.getAccessTokenCookieName(), "");
        cookie.setHttpOnly(true);
        cookie.setSecure(jwtProperties.isCookieSecure());
        cookie.setPath("/");
        cookie.setMaxAge(0); // Immediate expiration

        if (jwtProperties.getCookieDomain() != null) {
            cookie.setDomain(jwtProperties.getCookieDomain());
        }

        return cookie;
    }

    /**
     * Create expired refresh token cookie for deletion
     * MUST match original path for deletion to work
     * 
     * @return Expired cookie for deletion
     */
    public Cookie deleteRefreshTokenCookie() {
        Cookie cookie = new Cookie(jwtProperties.getRefreshTokenCookieName(), "");
        cookie.setHttpOnly(true);
        cookie.setSecure(jwtProperties.isCookieSecure());
        cookie.setPath("/auth/refresh"); // MUST match creation path
        cookie.setMaxAge(0); // Immediate expiration

        if (jwtProperties.getCookieDomain() != null) {
            cookie.setDomain(jwtProperties.getCookieDomain());
        }

        return cookie;
    }

    /**
     * Extract token value from cookie by name
     * NULL-SAFE EXTRACTION:
     * Returns Optional to force explicit null handling
     * Prevents null pointer exceptions
     * 
     * @param request    HTTP request containing cookies
     * @param cookieName Name of cookie to extract
     * @return Optional containing token value if found
     */
    public Optional<String> extractTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.trim().isEmpty())
                .findFirst();
    }

    /**
     * Extract access token from request cookies
     * 
     * @param request HTTP request
     * @return Optional containing access token
     */
    public Optional<String> getAccessToken(HttpServletRequest request) {
        return extractTokenFromCookie(request, jwtProperties.getAccessTokenCookieName());
    }

    /**
     * Extract refresh token from request cookies
     * 
     * @param request HTTP request
     * @return Optional containing refresh token
     */
    public Optional<String> getRefreshToken(HttpServletRequest request) {
        return extractTokenFromCookie(request, jwtProperties.getRefreshTokenCookieName());
    }

    /**
     * Add SameSite attribute to response
     * Spring Boot doesn't directly support SameSite via Cookie API
     * Must be set via Set-Cookie header manipulation
     * This utility ensures SameSite is properly applied
     * 
     * @param response HTTP response
     * @param cookie   Cookie to modify
     * @param sameSite SameSite value (Strict, Lax, or None)
     */
    public void addCookieWithSameSite(HttpServletResponse response, Cookie cookie, String sameSite) {
        StringBuilder cookieHeader = new StringBuilder();
        cookieHeader.append(cookie.getName()).append("=").append(cookie.getValue());
        cookieHeader.append("; Path=").append(cookie.getPath());
        cookieHeader.append("; Max-Age=").append(cookie.getMaxAge());

        if (cookie.isHttpOnly()) {
            cookieHeader.append("; HttpOnly");
        }

        if (cookie.getSecure()) {
            cookieHeader.append("; Secure");
        }

        if (sameSite != null && !sameSite.isEmpty()) {
            cookieHeader.append("; SameSite=").append(sameSite);
        }

        if (cookie.getDomain() != null) {
            cookieHeader.append("; Domain=").append(cookie.getDomain());
        }

        response.addHeader("Set-Cookie", cookieHeader.toString());
    }
}
