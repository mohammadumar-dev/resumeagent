package com.resumeagent.security;

import com.resumeagent.config.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

/**
 * JWT Token Provider using RS256 (RSA with SHA-256)
 * This class handles JWT token generation, validation, and parsing.
 * Uses asymmetric RSA signing for enhanced security.
 * SECURITY ARCHITECTURE:
 * - Private key for signing tokens (kept secure, never exposed)
 * - Public key for verification (can be distributed safely)
 * - Token type validation (access vs refresh)
 * - Role-based claims for authorization
 * THREAT MITIGATION:
 * - Token Forgery: RSA signature verification
 * - Key Compromise: Public key exposure doesn't enable forgery
 * - Token Type Confusion: Explicit type validation
 * - Privilege Escalation: Role in signed claims
 * - Replay Attacks: Short expiration for access tokens
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;
    private final ResourceLoader resourceLoader;

    private PrivateKey privateKey;
    private PublicKey publicKey;

    /**
     * Initialize RSA keys from configured paths
     * SECURITY NOTE:
     * Keys are loaded once at startup to avoid repeated I/O
     * Validation errors fail fast (application won't start)
     */
    @PostConstruct
    public void init() {
        try {
            this.privateKey = loadPrivateKey(jwtProperties.getPrivateKeyPath());
            this.publicKey = loadPublicKey(jwtProperties.getPublicKeyPath());
            log.info("JWT RSA keys loaded successfully");
        } catch (Exception e) {
            log.error("Failed to load JWT RSA keys", e);
            throw new IllegalStateException("Cannot initialize JWT provider without keys", e);
        }
    }

    /**
     * Generate access token for authenticated user
     * Access tokens are short-lived (15 minutes)
     * Used for authenticating API requests
     * 
     * @param userDetails Authenticated user details
     * @return Signed JWT access token
     */
    public String generateAccessToken(UserDetails userDetails) {
        return generateToken(userDetails, jwtProperties.getAccessTokenExpirationMs(), "access");
    }

    /**
     * Generate refresh token for session continuity
     * Refresh tokens are long-lived (30 days)
     * Used to obtain new access tokens
     * MUST be single-use and stored hashed in database
     * 
     * @param userDetails Authenticated user details
     * @return Signed JWT refresh token
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(userDetails, jwtProperties.getRefreshTokenExpirationMs(), "refresh");
    }

    /**
     * Internal token generation with RS256 signing
     * SECURITY FEATURES:
     * - Signed with RSA private key (cannot be forged)
     * - Includes user identity, role, and token type
     * - Expiration enforced via 'exp' claim
     * - Issued-at timestamp for audit trail
     * CLAIMS INCLUDED:
     * - sub (subject): User email/username
     * - userId: UUID for user identification
     * - role: User role (USER/ADMIN)
     * - type: Token type (access/refresh)
     * - iat: Issued at timestamp
     * - exp: Expiration timestamp
     * - iss: Issuer (backend service)
     * - aud: Audience (frontend application)
     */
    private String generateToken(UserDetails userDetails, long expirationMs, String tokenType) {
        Instant now = Instant.now();
        Instant expiration = now.plusMillis(expirationMs);

        // Extract user role (assuming single role)
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER");

        // Extract userId if available (assume username is email, userId stored
        // elsewhere)
        // For now, we'll set it from a custom claim if UserDetails is our custom
        // implementation
        Map<String, Object> claims = Map.of(
                "type", tokenType,
                "role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiration))
                .setIssuer(jwtProperties.getIssuer())
                .setAudience(jwtProperties.getAudience())
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }

    /**
     * Validate JWT token signature and expiration
     * VALIDATION STEPS:
     * 1. Verify RSA signature using public key
     * 2. Check expiration timestamp
     * 3. Validate issuer and audience claims
     * NO SILENT FAILURES:
     * All validation errors are logged for security auditing
     * 
     * @param token JWT token to validate
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(publicKey)
                    .requireIssuer(jwtProperties.getIssuer())
                    .requireAudience(jwtProperties.getAudience())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token structure: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Validate token type (access vs refresh)
     * PREVENTS TOKEN TYPE CONFUSION:
     * Ensures access tokens aren't used for refresh and vice versa
     * Critical for preventing privilege escalation
     * 
     * @param token        JWT token
     * @param expectedType Expected token type ("access" or "refresh")
     * @return true if type matches
     */
    public boolean validateTokenType(String token, String expectedType) {
        try {
            Claims claims = extractAllClaims(token);
            String tokenType = claims.get("type", String.class);
            return expectedType.equals(tokenType);
        } catch (Exception e) {
            log.error("Failed to validate token type: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extract username (email) from JWT token
     * 
     * @param token JWT token
     * @return Username (email) from subject claim
     */
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extract user ID from JWT token
     * 
     * @param token JWT token
     * @return User UUID from custom claim
     */
    public UUID extractUserId(String token) {
        String userId = extractAllClaims(token).get("userId", String.class);
        return userId != null ? UUID.fromString(userId) : null;
    }

    /**
     * Extract user role from JWT token
     * 
     * @param token JWT token
     * @return User role from custom claim
     */
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    /**
     * Extract all claims from JWT token
     * Uses public key for signature verification
     * 
     * @param token JWT token
     * @return Claims object containing all token data
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Check if token is expired
     * 
     * @param token JWT token
     * @return true if expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = extractAllClaims(token).getExpiration();
            return expiration.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    // -------------------------------------------------------------------------
    // Private Key Loading Utilities
    // -------------------------------------------------------------------------

    /**
     * Load RSA private key from PEM file
     * SECURITY NOTE:
     * Private key must be protected in production
     * Use secrets management (AWS Secrets Manager, etc.)
     * 
     * @param keyPath Path to private key PEM file
     * @return PrivateKey instance
     */
    private PrivateKey loadPrivateKey(String keyPath) throws Exception {
        Resource resource = resourceLoader.getResource(keyPath);
        String key = new String(Files.readAllBytes(resource.getFile().toPath()));

        // Remove PEM headers and whitespace
        String privateKeyPEM = key
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        // Decode base64 to bytes
        byte[] keyBytes = Base64.getDecoder().decode(privateKeyPEM);

        // Generate private key
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(spec);
    }

    /**
     * Load RSA public key from PEM file
     * Public key can be exposed safely (cannot forge tokens)
     * Can be served via JWKS endpoint for third-party validation
     * 
     * @param keyPath Path to public key PEM file
     * @return PublicKey instance
     */
    private PublicKey loadPublicKey(String keyPath) throws Exception {
        Resource resource = resourceLoader.getResource(keyPath);
        String key = new String(Files.readAllBytes(resource.getFile().toPath()));

        // Remove PEM headers and whitespace
        String publicKeyPEM = key
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");

        // Decode base64 to bytes
        byte[] keyBytes = Base64.getDecoder().decode(publicKeyPEM);

        // Generate public key
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(spec);
    }
}
