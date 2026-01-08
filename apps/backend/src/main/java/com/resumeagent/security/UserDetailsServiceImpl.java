package com.resumeagent.security;

import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.UserRole;
import com.resumeagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

/**
 * Custom UserDetailsService implementation for Spring Security
 * Loads user details from database for authentication
 * Maps User entity to Spring Security UserDetails
 * SECURITY ENFORCEMENT:
 * - Account must have emailActive = true to authenticate
 * - Role-based authorities for authorization
 * - Account status flags control access
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by email (username)
     * Called by Spring Security during authentication
     * User details are loaded fresh on every request (no caching)
     * STATELESS DESIGN:
     * No user session caching ensures:
     * - Account changes take effect immediately
     * - User blocking/unblocking works without delay
     * - Role changes apply instantly
     * SECURITY NOTE:
     * If user not found, throw UsernameNotFoundException
     * Error message should NOT reveal if email exists (prevents enumeration)
     * 
     * @param email User email address
     * @return UserDetails for Spring Security
     * @throws UsernameNotFoundException if user not found
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));

        return buildUserDetails(user);
    }

    /**
     * Build Spring Security UserDetails from User entity
     * Maps our User entity to Spring Security's UserDetails interface
     * ACCOUNT STATUS FLAGS:
     * - enabled: Account must have emailActive = true
     * - accountNonExpired: true (we don't use account expiration)
     * - credentialsNonExpired: true (we don't use password expiration)
     * - accountNonLocked: true (we don't use account locking yet)
     * FUTURE ENHANCEMENT:
     * Add blocked/locked status when account blocking is implemented
     * 
     * @param user User entity from database
     * @return UserDetails implementation
     */
    private UserDetails buildUserDetails(User user) {
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                user.isEmailActive(), // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                getAuthorities(user.getUserRole()));
    }

    /**
     * Convert UserRole enum to Spring Security GrantedAuthority
     * Spring Security expects authorities with "ROLE_" prefix
     * Our UserRole enum values: USER, ADMIN
     * Converted to: ROLE_USER, ROLE_ADMIN
     * AUTHORIZATION:
     * These authorities are used in @PreAuthorize and SecurityConfig
     * 
     * @param role User role enum
     * @return Collection of GrantedAuthority
     */
    private Collection<? extends GrantedAuthority> getAuthorities(UserRole role) {
        String authority = "ROLE_" + role.name();
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }
}
