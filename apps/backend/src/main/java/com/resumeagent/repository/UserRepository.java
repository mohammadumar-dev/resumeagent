package com.resumeagent.repository;

import com.resumeagent.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User entity
 * Provides data access methods for user authentication and management
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by email address
     * Used for authentication (login)
     * Email is unique constraint in database
     * 
     * @param email User email
     * @return Optional containing user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by email
     * Used for registration validation
     * Prevents duplicate accounts
     * 
     * @param email Email to check
     * @return true if email already registered
     */
    boolean existsByEmail(String email);
}
