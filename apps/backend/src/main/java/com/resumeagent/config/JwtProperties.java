package com.resumeagent.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * JWT Configuration Properties
 * 
 * Externalizes JWT-related configuration to support environment-specific settings.
 * Uses RS256 (RSA with SHA-256) for asymmetric token signing.
 * 
 * SECURITY RATIONALE:
 * - Private key signing prevents token forgery
 * - Public key distribution safe (cannot be used to create tokens)
 * - Environment-based key paths prevent hardcoded secrets
 * - Configuration validation ensures required properties are set
 * 
 * THREAT MITIGATION:
 * - Prevents accidental secret exposure in source code
 * - Enables secure key rotation without code changes
 * - Supports production secrets management (AWS Secrets Manager, etc.)
 */
@Configuration
@ConfigurationProperties(prefix = "jwt")
@Validated
@Getter
@Setter
public class JwtProperties {

    /**
     * Path to RSA private key (PEM format)
     * Used for signing JWTs
     * 
     * Development: classpath:keys/private_key.pem
     * Production: file:/run/secrets/jwt_private_key.pem
     */
    @NotBlank(message = "JWT private key path must be configured")
    private String privateKeyPath;

    /**
     * Path to RSA public key (PEM format)
     * Used for verifying JWT signatures
     * 
     * Development: classpath:keys/public_key.pem
     * Production: file:/run/secrets/jwt_public_key.pem
     */
    @NotBlank(message = "JWT public key path must be configured")
    private String publicKeyPath;

    /**
     * Access token expiration time in milliseconds
     * 
     * Recommended: 15 minutes (900000ms)
     * 
     * SHORT EXPIRATION RATIONALE:
     * - Limits blast radius if token is stolen
     * - Forces regular refresh (enables revocation via refresh token)
     * - Acceptable UX with automatic refresh mechanism
     */
    @Positive(message = "Access token expiration must be positive")
    private long accessTokenExpirationMs = 900000; // 15 minutes

    /**
     * Refresh token expiration time in milliseconds
     * 
     * Recommended: 30 days (2592000000ms)
     * 
     * LONG EXPIRATION RATIONALE:
     * - Better user experience (less frequent re-authentication)
     * - Still revocable via database lookup
     * - Single-use + rotation limits reuse attacks
     */
    @Positive(message = "Refresh token expiration must be positive")
    private long refreshTokenExpirationMs = 2592000000L; // 30 days

    /**
     * Issuer claim for JWT (usually domain or service name)
     * Used for token validation
     */
    private String issuer = "resumeagent-backend";

    /**
     * Audience claim for JWT
     * Specifies intended token recipients
     */
    private String audience = "resumeagent-frontend";

    // -------------------------------------------------------------------------
    // Cookie Configuration
    // -------------------------------------------------------------------------

    /**
     * Access token cookie name
     */
    private String accessTokenCookieName = "accessToken";

    /**
     * Refresh token cookie name
     */
    private String refreshTokenCookieName = "refreshToken";

    /**
     * HttpOnly flag for cookies
     * 
     * MUST be true in production
     * Prevents JavaScript access (XSS mitigation)
     */
    private boolean cookieHttpOnly = true;

    /**
     * Secure flag for cookies
     * 
     * MUST be true in production
     * Ensures cookies only sent over HTTPS
     */
    private boolean cookieSecure = true;

    /**
     * SameSite policy for cookies
     * 
     * Options: Strict, Lax, None
     * 
     * Recommended:
     * - Lax for access token (allows top-level navigation)
     * - Strict for refresh token (maximum CSRF protection)
     */
    private String cookieSameSite = "Lax";

    /**
     * Domain for cookies
     * 
     * Leave null for same-origin only
     * Set to ".yourdomain.com" for subdomain sharing
     */
    private String cookieDomain = null;
}
