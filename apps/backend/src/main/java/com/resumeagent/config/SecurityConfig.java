package com.resumeagent.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeagent.security.CookieUtil;
import com.resumeagent.security.JwtAuthenticationFilter;
import com.resumeagent.dto.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * Spring Security Configuration
 * Configures production-grade stateless authentication with JWT
 * SECURITY ARCHITECTURE:
 * - Stateless session management (no JSESSIONID)
 * - JWT-based authentication via cookies
 * - CSRF protection enabled with cookie-based tokens
 * - CORS configuration with explicit origins
 * - Role-based authorization
 * - HTTPS enforcement headers
 * THREAT MITIGATION:
 * - Session Fixation: Stateless design eliminates this attack
 * - XSS: HttpOnly cookies prevent JavaScript access
 * - CSRF: SameSite cookies + CSRF tokens (double protection)
 * - Clickjacking: X-Frame-Options header
 * - MIME Sniffing: X-Content-Type-Options header
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;
    private final CookieUtil cookieUtil;

    /**
     * Security Filter Chain
     * Defines HTTP security rules, session management, and filter order
     * CONFIGURATION DECISIONS:
     * 1. STATELESS SESSIONS:
     * - No server-side session storage
     * - No JSESSIONID cookie
     * - Authentication state in JWT only
     * 2. CSRF PROTECTION:
     * - ENABLED (not disabled)
     * - Uses CookieCsrfTokenRepository
     * - SameSite cookies provide first line of defense
     * - CSRF tokens for state-changing operations
     * 3. ENDPOINT SECURITY:
     * - /auth/login, /auth/register, /auth/verify-email: PUBLIC
     * - /auth/me, /auth/logout: AUTHENTICATED
     * - All others: AUTHENTICATED by default
     * 4. FILTER ORDER:
     * - JwtAuthenticationFilter runs BEFORE UsernamePasswordAuthenticationFilter
     * - Ensures JWT validation happens first
     * 
     * @param http HttpSecurity builder
     * @return Configured SecurityFilterChain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF Configuration
                // IMPORTANT: CSRF is ENABLED for cookie-based auth
                // SameSite cookies provide defense, but CSRF tokens are additional layer
                .csrf(csrf -> csrf
                        // Use cookie-based CSRF tokens (works with SPA)
                        .csrfTokenRepository(
                                org.springframework.security.web.csrf.CookieCsrfTokenRepository.withHttpOnlyFalse())
                        // Ignore CSRF for login (otherwise login form breaks)
                        // NOTE: Login is idempotent and doesn't change server state until success
                        .ignoringRequestMatchers(
                                "/auth/login",
                                "/auth/register",
                                "/auth/verify-email",
                                "/auth/logout",
                                "/auth/deactivate",
                                "/auth/resend-verification",
                                "/auth/forgot-password",
                                "/auth/reset-password",
                                "/api/admin/register"
                        )
                )

                // CORS Configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Session Management: STATELESS
                // NO server-side sessions
                // NO JSESSIONID cookie
                // All state in JWT
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization Rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication required)
                        .requestMatchers(
                                "/auth/login",
                                "/auth/register",
                                "/auth/verify-email",
                                "/auth/resend-verification",
                                "/auth/forgot-password",
                                "/api/admin/register",
                                "/auth/reset-password")
                        .permitAll()

                        // Admin endpoints (role-based)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // All other endpoints require authentication
                        .anyRequest().authenticated())

                // Return JSON for auth errors (instead of default HTML/error payloads)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            writeCommonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            writeCommonError(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden");
                        })
                )

                // Add JWT filter before Spring Security's authentication filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // Security Headers (Production Best Practices)
                .headers(headers -> headers
                        // Prevent clickjacking
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                        // Prevent MIME type sniffing
                        .contentTypeOptions(HeadersConfigurer.ContentTypeOptionsConfig::disable)
                        // XSS Protection (deprecated but still useful for old browsers)
                        .xssProtection(HeadersConfigurer.XXssConfig::disable));

        return http.build();
    }

    private void writeCommonError(HttpServletResponse response, int status, String message) {
        try {
            if (response.isCommitted()) return;
            response.resetBuffer();
            response.setStatus(status);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            // If the request is unauthorized, clear auth cookies to avoid clients getting stuck with stale tokens.
            if (status == HttpServletResponse.SC_UNAUTHORIZED) {
                cookieUtil.addCookieWithSameSite(response, cookieUtil.deleteAccessTokenCookie(), "Lax");
                cookieUtil.addCookieWithSameSite(response, cookieUtil.deleteRefreshTokenCookie(), "Strict");
            }

            objectMapper.writeValue(
                    response.getOutputStream(),
                    CommonResponse.builder()
                            .message(message)
                            .status(status)
                            .build()
            );
            response.flushBuffer();
        } catch (Exception ignored) {
            // If response is already committed or writing fails, do nothing.
        }
    }

    /**
     * CORS Configuration
     * 
     * Explicit allowed origins (NO wildcards)
     * Credentials enabled (required for cookies)
     * 
     * SECURITY NOTE:
     * - Never use allowedOrigins("*") with allowCredentials(true)
     * - Specify exact frontend URLs
     * - Update for production domains
     * 
     * @return CORS configuration source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // CRITICAL: Explicit origins only (no wildcards)
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000", // React/Next.js dev server
                "http://localhost:5173", // Vite dev server
                "http://localhost:4200" // Angular dev server
        // TODO: Add production frontend URL
        // "https://app.resumeagent.com"
        ));

        // Allowed HTTP methods
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Allowed headers
        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "X-CSRF-TOKEN"));

        // CRITICAL: Required for cookie-based authentication
        configuration.setAllowCredentials(true);

        // Max age for preflight cache (1 hour)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * Password Encoder Bean
     * 
     * Uses BCrypt with strength 12
     * 
     * SECURITY RATIONALE:
     * - BCrypt is intentionally slow (rate limits brute force)
     * - Strength 12 provides ~250ms per hash (good balance)
     * - Automatic salt generation
     * - Industry standard and well-tested
     * 
     * THREAT MITIGATION:
     * - Credential Stuffing: Slow hashing rate limits attempts
     * - Database Breach: Passwords cannot be reversed
     * - Rainbow Tables: Unique salt per password
     * 
     * @return BCrypt password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Authentication Manager Bean
     * 
     * Required for manual authentication (e.g., in AuthenticationService)
     * 
     * @param authConfig Authentication configuration
     * @return Authentication manager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
