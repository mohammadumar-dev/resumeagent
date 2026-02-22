package com.resumeagent.repository;

import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.UserPlan;
import com.resumeagent.entity.enums.UserRole;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;
import java.util.Collection;

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

    /**
     * Find user by email with pessimistic lock
     * Used for critical operations (e.g. password reset)
     * Prevents concurrent modifications to the same user record
     *
     * @param email User email
     * @return Optional containing user if found
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailForUpdate(@Param("email") String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") UUID id);

    /**
     * Paginated list of users by role
     * Used for admin user listing
     *
     * @param userRole Role to filter by
     * @param pageable Pagination/sort
     * @return page of users
     */
    Page<User> findByUserRoleIn(Collection<UserRole> userRoles, Pageable pageable);

    long countByUserRole(UserRole userRole);

    long countByUserRoleAndPlan(UserRole userRole, UserPlan plan);

    @Query("SELECT COALESCE(SUM(u.resumeGenerationUsed), 0) FROM User u WHERE u.userRole = :userRole")
    long sumResumeGenerationUsedByUserRole(@Param("userRole") UserRole userRole);


}
