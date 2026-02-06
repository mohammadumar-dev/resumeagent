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
import java.util.Objects;
import java.util.UUID;

/**
 * UserService
 * Handles registration for standard USER accounts and sends verification emails.
 * Mirrors AdminService behavior to keep consistent flows and security posture.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordHistoryRepository passwordHistoryRepository;
    private final EmailService emailService;

    /**
     * Registers a new USER account and sends an email verification.
     *
     * @param request registration DTO
     * @return CommonResponse with message and registered email
     */
    @Transactional
    public CommonResponse registerUser(RegisterAdminAndUserRequest request) {

        // Normalize email to avoid duplicates caused by case or spaces
        String email = request.getEmail().trim().toLowerCase();

        // Prevent duplicate accounts
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already exists");
        }

        // Validate password confirmation
        if (!Objects.equals(request.getPassword(), request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        // Build and save the user entity (emailActive defaults to false)
        User user = User.builder()
                .fullName(request.getFullName())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .userRole(UserRole.USER)
                .plan(UserPlan.FREE)
                .resumeGenerationLimit(5) // Free users get 5 resume generations per month
                .build();

        userRepository.save(user);

        // Save password history (for future reuse checks)
        PasswordHistory passwordHistory = PasswordHistory.builder()
                .user(user)
                .passwordHash(user.getPasswordHash())
                .build();
        passwordHistoryRepository.save(passwordHistory);

        // Generate verification token (plain UUID saved in DB like admin flow)
        String token = UUID.randomUUID().toString();

        EmailVerificationToken emailVerificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(token)
                .expiresAt(Instant.now().plusSeconds(3600)) // 1 hour expiry, same as admin
                .build();

        emailVerificationTokenRepository.save(emailVerificationToken);

        // Send verification email using existing EmailService
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), token);
        } catch (IOException | MessagingException e) {
            // Mirror AdminService behavior: bubble up as runtime for controller to handle
            throw new RuntimeException(e);
        }

        // Response mirrors AdminService message
        return CommonResponse.builder()
                .message("Your registration was successful. Please check your email to verify your account.")
                .email(email)
                .build();
    }
}
