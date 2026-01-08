package com.resumeagent.repository;

import com.resumeagent.entity.RefreshToken;
import com.resumeagent.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for RefreshToken entity
 * Manages refresh token lifecycle: creation, validation, rotation, and cleanup
 * SECURITY NOTE:
 * All tokens stored as hashed values (bcrypt)
 * Never query or return plaintext tokens
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    /**
     * Find refresh token by hashed value
     * Used for validation during token refresh
     * Token must be hashed before querying
     * SECURITY:
     * Raw token from cookie is hashed then matched against database
     * If attacker compromises database, hashed tokens are useless
     * 
     * @param tokenHash BCrypt hash of refresh token
     * @return Optional containing token if found
     */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /**
     * Find all active (non-revoked, non-expired) refresh tokens for a user
     * Used for:
     * - Session management (view active sessions)
     * - Security incident response (revoke all sessions)
     * 
     * @param user User entity
     * @return List of active refresh tokens
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user AND rt.revoked = false AND rt.expiresAt > :now")
    List<RefreshToken> findActiveTokensByUser(User user, Instant now);

    /**
     * Delete all refresh tokens for a user
     * Used for:
     * - Logout (optional: can also just delete single token)
     * - Account deletion
     * - Security breach response (force re-authentication)
     * 
     * @param user User entity
     */
    @Transactional
    @Modifying
    void deleteByUser(User user);

    /**
     * Delete expired refresh tokens (cleanup job)
     * Should be run periodically (e.g., daily scheduled task)
     * Prevents database bloat from old tokens
     * 
     * @param timestamp Current time (tokens expired before this are deleted)
     * @return Number of deleted tokens
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :timestamp")
    int deleteExpiredTokens(Instant timestamp);

    /**
     * Count active tokens for a user
     * Used for:
     * - Limiting concurrent sessions per user
     * - Monitoring unusual activity
     * 
     * @param user User entity
     * @param now  Current timestamp
     * @return Number of active tokens
     */
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.user = :user AND rt.revoked = false AND rt.expiresAt > :now")
    long countActiveTokensByUser(User user, Instant now);
}
