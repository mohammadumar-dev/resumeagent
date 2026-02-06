package com.resumeagent.service;

import com.resumeagent.dto.request.RegisterAdminAndUserRequest;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.entity.EmailVerificationToken;
import com.resumeagent.entity.PasswordHistory;
import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.UserPlan;
import com.resumeagent.entity.enums.UserRole;
import com.resumeagent.exception.DuplicateResourceException;
import com.resumeagent.repository.EmailVerificationTokenRepository;
import com.resumeagent.repository.PasswordHistoryRepository;
import com.resumeagent.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

/**
 * AdminService
 * Contains all business logic related to admin registration.
 * This service is responsible for:
 * - Validating business rules
 * - Creating admin users
 * - Managing password history
 * - Creating email verification tokens
 * IMPORTANT:
 * - This layer owns transactions
 * - This layer talks to repositories
 * - Controllers should remain thin
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final EmailService emailService;

    /**
     * Registers a new admin user.
     * Transactional because:
     * - User creation
     * - Password history save
     * - Email verification token save
     * must all succeed or all fail together.
     *
     * @param request registration request data
     * @return success response
     */
    @Transactional
    public CommonResponse registerAdmin(RegisterAdminAndUserRequest request) {

        // Normalize email to avoid duplicates caused by case or spaces
        String email = request.getEmail().trim().toLowerCase();

        // Check if email already exists
        // This prevents duplicate accounts
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already exists");
        }

        // Validate password and confirm password match
        // This is a business validation, not a technical error
        if (!Objects.equals(request.getPassword(), request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        // Create and save the admin user
        // Password is always stored as a secure hash
        User admin = User.builder()
                .fullName(request.getFullName())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .userRole(UserRole.ADMIN)
                .plan(UserPlan.FREE)
                .resumeGenerationLimit(5)
                .resumeGenerationUsed(0)
                .usageMonth(LocalDate.now().withDayOfMonth(1))
                .emailActive(false) // or true if verified immediately
                .build();

        userRepository.save(admin);

        // Save password history
        // This helps enforce password reuse policies in the future
        PasswordHistory passwordHistory = PasswordHistory.builder()
                .user(admin)
                .passwordHash(admin.getPasswordHash())
                .build();

        passwordHistoryRepository.save(passwordHistory);

        // Generate email verification token
        // Token expires after 1 hour
        String token = UUID.randomUUID().toString();

        EmailVerificationToken emailVerificationToken = EmailVerificationToken.builder()
                .user(admin)
                .token(token)
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        emailVerificationTokenRepository.save(emailVerificationToken);

        // Sending Verification
        try {
            emailService.sendVerificationEmail(admin.getEmail(), admin.getFullName(), token);
        } catch (IOException | MessagingException e) {
            throw new RuntimeException(e);
        }

        // Return success response
        // Email verification is required before login
        return CommonResponse.builder()
                .message("Your registration was successful. Please check your email to verify your account.")
                .email(email)
                .build();
    }
}
