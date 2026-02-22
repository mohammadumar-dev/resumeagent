package com.resumeagent.service;

import com.resumeagent.dto.request.RegisterAdminAndUserRequest;
import com.resumeagent.dto.response.AdminUserActivitySummaryResponse;
import com.resumeagent.dto.response.AdminUserListItemResponse;
import com.resumeagent.dto.response.AdminUserListResponse;
import com.resumeagent.dto.response.AdminUsersDashboard;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.entity.EmailVerificationToken;
import com.resumeagent.entity.PasswordHistory;
import com.resumeagent.entity.User;
import com.resumeagent.entity.ResumeGeneration;
import com.resumeagent.entity.enums.AgentExecutionStatus;
import com.resumeagent.entity.enums.UserPlan;
import com.resumeagent.entity.enums.UserRole;
import com.resumeagent.exception.DuplicateResourceException;
import com.resumeagent.exception.ValueNotFoundException;
import com.resumeagent.repository.EmailVerificationTokenRepository;
import com.resumeagent.repository.MasterResumeRepository;
import com.resumeagent.repository.PasswordHistoryRepository;
import com.resumeagent.repository.ResumeAgentLogRepository;
import com.resumeagent.repository.ResumeGenerationRepository;
import com.resumeagent.repository.ResumeRepository;
import com.resumeagent.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.List;
import java.util.stream.Collectors;
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
    private final MasterResumeRepository masterResumeRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeGenerationRepository resumeGenerationRepository;
    private final ResumeAgentLogRepository resumeAgentLogRepository;

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

    @Transactional(readOnly = true)
    public AdminUserListResponse listUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findByUserRoleIn(
                List.of(UserRole.ADMIN, UserRole.USER),
                pageable
        );

        List<AdminUserListItemResponse> items = usersPage.getContent().stream()
                .map(user -> AdminUserListItemResponse.builder()
                        .id(user.getId() == null ? null : user.getId().toString())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .plan(user.getPlan() == null ? null : user.getPlan().name())
                        .role(user.getUserRole() == null ? null : user.getUserRole().name())
                        .resumeGenerationLimit(user.getResumeGenerationLimit())
                        .resumeGenerationUsed(user.getResumeGenerationUsed())
                        .emailActive(user.isEmailActive())
                        .createdAt(user.getCreatedAt() == null ? null : user.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());

        return AdminUserListResponse.builder()
                .items(items)
                .page(usersPage.getNumber())
                .size(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .hasNext(usersPage.hasNext())
                .hasPrevious(usersPage.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminUsersDashboard getUsersDashboard() {
        long totalUsersCount = userRepository.count();
        long totalAdmins = userRepository.countByUserRole(UserRole.ADMIN);
        long totalUsers = userRepository.countByUserRole(UserRole.USER);
        long totalFreePlanUsers = userRepository.countByUserRoleAndPlan(UserRole.USER, UserPlan.FREE);
        long totalPremiumPlanUsers = userRepository.countByUserRoleAndPlan(UserRole.USER, UserPlan.PRO);
        long totalResumeGenerations = userRepository.sumResumeGenerationUsedByUserRole(UserRole.USER);

        return AdminUsersDashboard.builder()
                .totalUsersCount(Math.toIntExact(totalUsersCount))
                .totalAdmins(Math.toIntExact(totalAdmins))
                .totalUsers(Math.toIntExact(totalUsers))
                .totalFreePlanUsers(Math.toIntExact(totalFreePlanUsers))
                .totalPremiumPlanUsers(Math.toIntExact(totalPremiumPlanUsers))
                .totalResumeGenerations(Math.toIntExact(totalResumeGenerations))
                .build();
    }

    @Transactional
    public CommonResponse deactivateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ValueNotFoundException("User not found"));

        if (!user.isEmailActive()) {
            return CommonResponse.builder()
                    .message("User is already deactivated")
                    .email(user.getEmail())
                    .build();
        }

        user.setEmailActive(false);
        userRepository.save(user);

        return CommonResponse.builder()
                .message("User deactivated successfully")
                .email(user.getEmail())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminUserActivitySummaryResponse getUserActivitySummary(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ValueNotFoundException("User not found"));

        boolean hasMasterResume = masterResumeRepository.existsByUserId(userId);
        long totalResumes = resumeRepository.countByUserIdAndStatusNot(
                userId,
                com.resumeagent.entity.enums.ResumeStatus.DELETED
        );
        long totalResumeGenerations = resumeGenerationRepository.countByUserId(userId);
        long totalAgentLogs = resumeAgentLogRepository.countByUserId(userId);

        int agentSuccessCount = (int) resumeAgentLogRepository.countByUserIdAndStatus(
                userId,
                AgentExecutionStatus.SUCCESS
        );
        int agentFailureCount = (int) resumeAgentLogRepository.countByUserIdAndStatus(
                userId,
                AgentExecutionStatus.FAILURE
        );
        int agentPartialCount = (int) resumeAgentLogRepository.countByUserIdAndStatus(
                userId,
                AgentExecutionStatus.PARTIAL
        );

        long totalTokensUsed = resumeAgentLogRepository.sumTokensByUserIdAndStatusNot(
                userId,
                AgentExecutionStatus.FAILURE
        );

        ResumeGeneration lastGeneration = resumeGenerationRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);

        String lastGenerationStatus = lastGeneration == null || lastGeneration.getStatus() == null
                ? null
                : lastGeneration.getStatus().name();
        String lastGenerationAt = lastGeneration == null || lastGeneration.getCreatedAt() == null
                ? null
                : lastGeneration.getCreatedAt().toString();

        return AdminUserActivitySummaryResponse.builder()
                .userId(user.getId() == null ? null : user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getUserRole() == null ? null : user.getUserRole().name())
                .plan(user.getPlan() == null ? null : user.getPlan().name())
                .emailActive(user.isEmailActive())
                .createdAt(user.getCreatedAt() == null ? null : user.getCreatedAt().toString())
                .resumeGenerationLimit(user.getResumeGenerationLimit())
                .resumeGenerationUsed(user.getResumeGenerationUsed())
                .hasMasterResume(hasMasterResume)
                .totalResumes(Math.toIntExact(totalResumes))
                .totalResumeGenerations(Math.toIntExact(totalResumeGenerations))
                .totalAgentLogs(Math.toIntExact(totalAgentLogs))
                .agentSuccessCount(agentSuccessCount)
                .agentFailureCount(agentFailureCount)
                .agentPartialCount(agentPartialCount)
                .totalTokensUsed(totalTokensUsed)
                .lastResumeGenerationStatus(lastGenerationStatus)
                .lastResumeGenerationAt(lastGenerationAt)
                .build();
    }
}
