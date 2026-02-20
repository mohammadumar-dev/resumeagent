package com.resumeagent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeagent.ai.agents.ATSOptimizationAgent;
import com.resumeagent.ai.agents.JobDescriptionAnalyzerAgent;
import com.resumeagent.ai.agents.MatchingAgent;
import com.resumeagent.ai.agents.ResumeRewriteAgent;
import com.resumeagent.ai.orchestration.AgentExecutor;
import com.resumeagent.ai.util.TokenCounter;
import com.resumeagent.dto.request.CreateAndUpdateMasterResume;
import com.resumeagent.dto.response.*;
import com.resumeagent.entity.MasterResume;
import com.resumeagent.entity.Resume;
import com.resumeagent.entity.ResumeGeneration;
import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.ResumeGenerationStatus;
import com.resumeagent.entity.enums.ResumeStatus;
import com.resumeagent.entity.model.JobDescriptionAnalyzerJson;
import com.resumeagent.entity.model.MasterResumeJson;
import com.resumeagent.entity.model.MatchingAgentJson;
import com.resumeagent.exception.DuplicateResourceException;
import com.resumeagent.exception.FatalAgentException;
import com.resumeagent.exception.TransientAgentException;
import com.resumeagent.render.GreenResumeDocxService;
import com.resumeagent.render.BlueResumeDocxService;
import com.resumeagent.repository.MasterResumeRepository;
import com.resumeagent.repository.ResumeGenerationRepository;
import com.resumeagent.repository.ResumeRepository;
import com.resumeagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeService {
    private static final Logger log = LoggerFactory.getLogger(ResumeService.class);

    // Repositories
    private final UserRepository userRepository;
    private final MasterResumeRepository masterResumeRepository;
    private final ResumeGenerationRepository resumeGenerationRepository;
    private final AgentExecutor agentExecutor;
    private final ObjectMapper objectMapper;

    // AI Agents
    private final JobDescriptionAnalyzerAgent jobDescriptionAnalyzerAgent;
    private final ResumeRepository resumeRepository;
    private final MatchingAgent matchingAgent;
    private final ResumeRewriteAgent resumeRewriteAgent;
    private final ATSOptimizationAgent atsOptimizationAgent;

    // Resume Templates
    private final BlueResumeDocxService blueResumeDocxService;
    private final GreenResumeDocxService greenResumeDocxService;

    // WebSocket Messaging
    private final SimpMessagingTemplate messagingTemplate;
    private final PlatformTransactionManager transactionManager;

    // Content type for DOCX files
    private static final String DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    /**
     * Generates a tailored resume based on the provided job description
     * for the authenticated user.
     *
     * @param jobDescription The job description to tailor the resume for.
     * @param email          The email of the authenticated user.
     * @return A CommonResponse indicating success or failure.
     * @throws JsonProcessingException If there is an error processing JSON.
     */
    public CommonResponse generateResume(String jobDescription, String email) throws JsonProcessingException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        sendStatusSafe(user.getId(), "ResumeGeneration", "STARTED");

        // Reset monthly usage if needed (short transaction)
        refreshUsageMonthAndValidateLimit(user.getId());

        MasterResume masterResume = masterResumeRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Master resume not found"));

        ResumeGeneration generation = findOrCreateGeneration(user, masterResume, jobDescription);

        try {
            MasterResumeJson masterResumeJson = masterResume.getResumeJson();

            JobDescriptionAnalyzerJson jobDescriptionAnalyzerJson =
                    ensureJobDescriptionAnalyzed(generation, user, jobDescription);

            MatchingAgentJson matchingAgentJson =
                    ensureMatched(generation, user, masterResumeJson, jobDescriptionAnalyzerJson);

            MasterResumeJson rewrittenResume =
                    ensureRewritten(generation, user, masterResumeJson, jobDescriptionAnalyzerJson, matchingAgentJson);

            MasterResumeJson finalResume =
                    ensureOptimized(generation, user, rewrittenResume);

            finalizeGeneration(generation, user.getId(), masterResume, jobDescriptionAnalyzerJson, finalResume);
            sendStatusSafe(user.getId(), "ResumeGeneration", "SUCCESS");

            return CommonResponse.builder()
                    .message("Resume generated successfully")
                    .email(email)
                    .build();
        } catch (TransientAgentException | FatalAgentException | JsonProcessingException ex) {
            markGenerationFailed(generation.getId(), ex.getMessage());
            sendStatusSafe(user.getId(), "ResumeGeneration", "FAILED");
            throw ex;
        } catch (RuntimeException ex) {
            markGenerationFailed(generation.getId(), ex.getMessage());
            sendStatusSafe(user.getId(), "ResumeGeneration", "FAILED");
            throw ex;
        }
    }

    private ResumeGeneration findOrCreateGeneration(User user, MasterResume masterResume, String jobDescription) {
        Optional<ResumeGeneration> existing = resumeGenerationRepository
                .findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
                        user.getId(),
                        EnumSet.of(
                                ResumeGenerationStatus.PENDING,
                                ResumeGenerationStatus.JD_ANALYZED,
                                ResumeGenerationStatus.MATCHED,
                                ResumeGenerationStatus.REWRITTEN,
                                ResumeGenerationStatus.OPTIMIZED
                        )
                );

        if (existing.isPresent() && jobDescription.equals(existing.get().getJobDescription())) {
            return existing.get();
        }

        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        return template.execute(status -> resumeGenerationRepository.save(
                ResumeGeneration.builder()
                        .user(user)
                        .masterResume(masterResume)
                        .jobDescription(jobDescription)
                        .status(ResumeGenerationStatus.PENDING)
                        .build()
        ));
    }

    private void refreshUsageMonthAndValidateLimit(UUID userId) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        template.executeWithoutResult(status -> {
            User lockedUser = userRepository.findByIdForUpdate(userId)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
            LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
            if (lockedUser.getUsageMonth() == null || !lockedUser.getUsageMonth().equals(currentMonth)) {
                lockedUser.setUsageMonth(currentMonth);
                lockedUser.setResumeGenerationUsed(0);
                userRepository.save(lockedUser);
            }
            if (lockedUser.getResumeGenerationUsed() >= lockedUser.getResumeGenerationLimit()) {
                throw new IllegalStateException("Monthly resume generation limit reached. Upgrade your plan to continue.");
            }
        });
    }

    private JobDescriptionAnalyzerJson ensureJobDescriptionAnalyzed(
            ResumeGeneration generation,
            User user,
            String jobDescription
    ) throws JsonProcessingException {
        if (generation.getStatus().isAtLeast(ResumeGenerationStatus.JD_ANALYZED)
                && generation.getJobDescriptionAnalyzerJson() != null) {
            return generation.getJobDescriptionAnalyzerJson();
        }

        sendStatusSafe(user.getId(), "JobDescriptionAnalyzerAgent", "STARTED");
        try {
            JobDescriptionAnalyzerJson result = agentExecutor.execute(
                    AgentExecutor.AgentExecutionRequest.<JobDescriptionAnalyzerJson>builder()
                            .agentName("JobDescriptionAnalyzerAgent")
                            .user(user)
                            .resume(null)
                            .tokensInput(TokenCounter.countTokens(jobDescription))
                            .inputSnapshot(jobDescription)
                            .outputSerializer(this::writeJson)
                            .action(() -> jobDescriptionAnalyzerAgent.executeJobDescriptionAnalyzerAgent(jobDescription))
                            .build()
            );

            String jobTitle = result.getJobIdentity() == null ? null : result.getJobIdentity().getJobTitle();
            String company = result.getJobIdentity() == null ? null : result.getJobIdentity().getCompanyName();
            generation.setJobDescriptionAnalyzerJson(result);
            generation.setJobTitleTargeted(jobTitle);
            generation.setCompanyTargeted(company);
            generation.setStatus(ResumeGenerationStatus.JD_ANALYZED);

            updateGeneration(generation.getId(), updated -> {
                updated.setJobDescriptionAnalyzerJson(result);
                updated.setJobTitleTargeted(jobTitle);
                updated.setCompanyTargeted(company);
                updated.setStatus(ResumeGenerationStatus.JD_ANALYZED);
                updated.setFailureReason(null);
            });

            sendStatusSafe(user.getId(), "JobDescriptionAnalyzerAgent", "SUCCESS");
            return result;
        } catch (RuntimeException ex) {
            sendStatusSafe(user.getId(), "JobDescriptionAnalyzerAgent", "FAILED");
            throw ex;
        }
    }

    private MatchingAgentJson ensureMatched(
            ResumeGeneration generation,
            User user,
            MasterResumeJson masterResumeJson,
            JobDescriptionAnalyzerJson jobDescriptionAnalyzerJson
    ) throws JsonProcessingException {
        if (generation.getStatus().isAtLeast(ResumeGenerationStatus.MATCHED)
                && generation.getMatchingAgentJson() != null) {
            return generation.getMatchingAgentJson();
        }

        sendStatusSafe(user.getId(), "MatchingAgent", "STARTED");
        try {
            int tokensInput = countTokensFromJson(masterResumeJson) + countTokensFromJson(jobDescriptionAnalyzerJson);
            MatchingAgentJson result = agentExecutor.execute(
                    AgentExecutor.AgentExecutionRequest.<MatchingAgentJson>builder()
                            .agentName("MatchingAgent")
                            .user(user)
                            .resume(null)
                            .tokensInput(tokensInput)
                            .inputSnapshot(safeJsonSnapshot(jobDescriptionAnalyzerJson))
                            .outputSerializer(this::writeJson)
                            .action(() -> matchingAgent.executeMatchingAgent(masterResumeJson, jobDescriptionAnalyzerJson))
                            .build()
            );

            generation.setMatchingAgentJson(result);
            generation.setStatus(ResumeGenerationStatus.MATCHED);

            updateGeneration(generation.getId(), updated -> {
                updated.setMatchingAgentJson(result);
                updated.setStatus(ResumeGenerationStatus.MATCHED);
                updated.setFailureReason(null);
            });

            sendStatusSafe(user.getId(), "MatchingAgent", "SUCCESS");
            return result;
        } catch (RuntimeException ex) {
            sendStatusSafe(user.getId(), "MatchingAgent", "FAILED");
            throw ex;
        }
    }

    private MasterResumeJson ensureRewritten(
            ResumeGeneration generation,
            User user,
            MasterResumeJson masterResumeJson,
            JobDescriptionAnalyzerJson jobDescriptionAnalyzerJson,
            MatchingAgentJson matchingAgentJson
    ) throws JsonProcessingException {
        if (generation.getStatus().isAtLeast(ResumeGenerationStatus.REWRITTEN)
                && generation.getRewrittenResumeJson() != null) {
            return generation.getRewrittenResumeJson();
        }

        sendStatusSafe(user.getId(), "ResumeRewriteAgent", "STARTED");
        try {
            int tokensInput = countTokensFromJson(masterResumeJson)
                    + countTokensFromJson(jobDescriptionAnalyzerJson)
                    + countTokensFromJson(matchingAgentJson);
            MasterResumeJson result = agentExecutor.execute(
                    AgentExecutor.AgentExecutionRequest.<MasterResumeJson>builder()
                            .agentName("ResumeRewriteAgent")
                            .user(user)
                            .resume(null)
                            .tokensInput(tokensInput)
                            .inputSnapshot(safeJsonSnapshot(matchingAgentJson))
                            .outputSerializer(this::writeJson)
                            .action(() -> resumeRewriteAgent.executeResumeRewriteAgent(
                                    masterResumeJson, jobDescriptionAnalyzerJson, matchingAgentJson))
                            .build()
            );

            generation.setRewrittenResumeJson(result);
            generation.setStatus(ResumeGenerationStatus.REWRITTEN);

            updateGeneration(generation.getId(), updated -> {
                updated.setRewrittenResumeJson(result);
                updated.setStatus(ResumeGenerationStatus.REWRITTEN);
                updated.setFailureReason(null);
            });

            sendStatusSafe(user.getId(), "ResumeRewriteAgent", "SUCCESS");
            return result;
        } catch (RuntimeException ex) {
            sendStatusSafe(user.getId(), "ResumeRewriteAgent", "FAILED");
            throw ex;
        }
    }

    private MasterResumeJson ensureOptimized(
            ResumeGeneration generation,
            User user,
            MasterResumeJson rewrittenResume
    ) throws JsonProcessingException {
        if (generation.getStatus().isAtLeast(ResumeGenerationStatus.OPTIMIZED)
                && generation.getOptimizedResumeJson() != null) {
            return generation.getOptimizedResumeJson();
        }

        sendStatusSafe(user.getId(), "ATSOptimizationAgent", "STARTED");
        try {
            int tokensInput = countTokensFromJson(rewrittenResume);
            MasterResumeJson result = agentExecutor.execute(
                    AgentExecutor.AgentExecutionRequest.<MasterResumeJson>builder()
                            .agentName("ATSOptimizationAgent")
                            .user(user)
                            .resume(null)
                            .tokensInput(tokensInput)
                            .inputSnapshot(safeJsonSnapshot(rewrittenResume))
                            .outputSerializer(this::writeJson)
                            .action(() -> atsOptimizationAgent.executeATSOptimizationAgent(rewrittenResume))
                            .build()
            );

            generation.setOptimizedResumeJson(result);
            generation.setStatus(ResumeGenerationStatus.OPTIMIZED);

            updateGeneration(generation.getId(), updated -> {
                updated.setOptimizedResumeJson(result);
                updated.setStatus(ResumeGenerationStatus.OPTIMIZED);
                updated.setFailureReason(null);
            });

            sendStatusSafe(user.getId(), "ATSOptimizationAgent", "SUCCESS");
            return result;
        } catch (RuntimeException ex) {
            sendStatusSafe(user.getId(), "ATSOptimizationAgent", "FAILED");
            throw ex;
        }
    }

    private void finalizeGeneration(
            ResumeGeneration generation,
            UUID userId,
            MasterResume masterResume,
            JobDescriptionAnalyzerJson jobDescriptionAnalyzerJson,
            MasterResumeJson finalResume
    ) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        template.executeWithoutResult(status -> {
            ResumeGeneration current = resumeGenerationRepository.findById(generation.getId())
                    .orElseThrow(() -> new IllegalStateException("Resume generation not found"));
            if (current.getStatus() == ResumeGenerationStatus.FAILED) {
                throw new IllegalStateException("Resume generation already failed");
            }

            User lockedUser = userRepository.findByIdForUpdate(userId)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

            LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
            if (lockedUser.getUsageMonth() == null || !lockedUser.getUsageMonth().equals(currentMonth)) {
                lockedUser.setUsageMonth(currentMonth);
                lockedUser.setResumeGenerationUsed(0);
            }

            if (lockedUser.getResumeGenerationUsed() >= lockedUser.getResumeGenerationLimit()) {
                throw new IllegalStateException("Monthly resume generation limit reached. Upgrade your plan to continue.");
            }

            String jobTitle = jobDescriptionAnalyzerJson.getJobIdentity() == null
                    ? null
                    : jobDescriptionAnalyzerJson.getJobIdentity().getJobTitle();
            String companyName = jobDescriptionAnalyzerJson.getJobIdentity() == null
                    ? null
                    : jobDescriptionAnalyzerJson.getJobIdentity().getCompanyName();

            Resume generatedResume = Resume.builder()
                    .user(lockedUser)
                    .masterResume(masterResume)
                    .jobTitleTargeted(jobTitle)
                    .jobDescriptionAnalyzerJson(jobDescriptionAnalyzerJson)
                    .companyTargeted(companyName)
                    .resumeJson(finalResume)
                    .status(ResumeStatus.ACTIVE)
                    .build();

            try {
                resumeRepository.save(generatedResume);
                lockedUser.setResumeGenerationUsed(lockedUser.getResumeGenerationUsed() + 1);
                userRepository.save(lockedUser);

                ResumeGeneration updated = resumeGenerationRepository.findById(generation.getId())
                        .orElseThrow(() -> new IllegalStateException("Resume generation not found"));
                updated.setResume(generatedResume);
                updated.setStatus(ResumeGenerationStatus.COMPLETED);
                updated.setFailureReason(null);
                resumeGenerationRepository.save(updated);
            } catch (DataIntegrityViolationException ex) {
                throw new RuntimeException("Failed to save generated resume", ex);
            }
        });
    }

    private void markGenerationFailed(UUID generationId, String reason) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        template.executeWithoutResult(status -> {
            ResumeGeneration generation = resumeGenerationRepository.findById(generationId)
                    .orElseThrow(() -> new IllegalStateException("Resume generation not found"));
            if (generation.getStatus() == ResumeGenerationStatus.COMPLETED) {
                return;
            }
            generation.setStatus(ResumeGenerationStatus.FAILED);
            generation.setFailureReason(reason);
            resumeGenerationRepository.save(generation);
        });
    }

    private ResumeGeneration updateGeneration(UUID id, java.util.function.Consumer<ResumeGeneration> updater) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        return template.execute(status -> {
            ResumeGeneration generation = resumeGenerationRepository.findById(id)
                    .orElseThrow(() -> new IllegalStateException("Resume generation not found"));
            if (generation.getStatus() == ResumeGenerationStatus.FAILED
                    || generation.getStatus() == ResumeGenerationStatus.COMPLETED) {
                return generation;
            }
            updater.accept(generation);
            return resumeGenerationRepository.save(generation);
        });
    }

    private void sendStatus(UUID userId, String agentName, String status) {
        messagingTemplate.convertAndSend(
                "/topic/resume-status/" + userId,
                new AgentStatusMessageResponse(agentName, status)
        );
    }

    private void sendStatusSafe(UUID userId, String agentName, String status) {
        try {
            sendStatus(userId, agentName, status);
        } catch (RuntimeException ex) {
            log.warn("WebSocket status send failed: agent={}, status={}, userId={}", agentName, status, userId, ex);
        }
    }

    private String safeJsonSnapshot(Object value) {
        try {
            return writeJson(value);
        } catch (JsonProcessingException ex) {
            return null;
        }
    }

    private int countTokensFromJson(Object value) throws JsonProcessingException {
        return TokenCounter.countTokens(writeJson(value));
    }

    private String writeJson(Object value) throws JsonProcessingException {
        return objectMapper.writeValueAsString(value);
    }

    public ResponseEntity<byte[]> downloadResumeGreen(String email, UUID id) {
        // Get user from email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        // Find resume by ID ensuring it belongs to the authenticated user
        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalStateException("Resume not found or access denied"));

        try {
            // Generate DOCX from resume JSON
            ByteArrayOutputStream docxStream = greenResumeDocxService.generateResume(resume.getResumeJson());
            byte[] docxBytes = docxStream.toByteArray();

            // Build filename from job title and company if available
            String filename = buildFilename(resume);

            // Return the file as attachment
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(DOCX_CONTENT_TYPE));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(docxBytes.length);

            return new ResponseEntity<>(docxBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate resume document", e);
        }
    }

    public ResponseEntity<byte[]> downloadResumeBlue(String email, UUID id) {
        // Get user from email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        // Find resume by ID ensuring it belongs to the authenticated user
        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalStateException("Resume not found or access denied"));

        try {
            // Generate DOCX from resume JSON
            ByteArrayOutputStream docxStream = blueResumeDocxService.generateResume(resume.getResumeJson());
            byte[] docxBytes = docxStream.toByteArray();

            // Build filename from job title and company if available
            String filename = buildFilename(resume);

            // Return the file as attachment
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(DOCX_CONTENT_TYPE));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(docxBytes.length);

            return new ResponseEntity<>(docxBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate resume document", e);
        }
    }

    /**
     * Builds a descriptive filename for the resume download.
     */
    private String buildFilename(Resume resume) {
        StringBuilder filename = new StringBuilder("Resume");

        if (resume.getJobTitleTargeted() != null && !resume.getJobTitleTargeted().isBlank()) {
            filename.append("_").append(sanitizeFilename(resume.getJobTitleTargeted()));
        }
        if (resume.getCompanyTargeted() != null && !resume.getCompanyTargeted().isBlank()) {
            filename.append("_").append(sanitizeFilename(resume.getCompanyTargeted()));
        }

        filename.append(".docx");
        return filename.toString();
    }

    /**
     * Sanitizes a string for use in a filename.
     */
    private String sanitizeFilename(String input) {
        return input.replaceAll("[^a-zA-Z0-9.-]", "_").substring(0, Math.min(input.length(), 30));
    }


    @Transactional
    public ResumeListResponse getResumeList(String email, Pageable pageable) {
        User user = userRepository.findByEmailForUpdate(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        Page<Resume> resumesPage = resumeRepository.findByUserAndStatusIn(
                user,
                EnumSet.of(ResumeStatus.ACTIVE, ResumeStatus.ARCHIVED),
                pageable
        );

        List<ResumeListItemResponse> items = resumesPage.getContent().stream()
                .map(resume -> ResumeListItemResponse.builder()
                        .id(resume.getId().toString())
                        .jobTitle(resume.getJobTitleTargeted())
                        .companyName(resume.getCompanyTargeted())
                        .status(resume.getStatus())
                        .createdAt(resume.getCreatedAt() == null ? null : resume.getCreatedAt().toString())
                        .updatedAt(resume.getUpdatedAt() == null ? null : resume.getUpdatedAt().toString())
                        .build())
                .collect(Collectors.toList());

        return ResumeListResponse.builder()
                .items(items)
                .page(resumesPage.getNumber())
                .size(resumesPage.getSize())
                .totalElements(resumesPage.getTotalElements())
                .totalPages(resumesPage.getTotalPages())
                .hasNext(resumesPage.hasNext())
                .hasPrevious(resumesPage.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public MasterResumeResponse getResumeById(String email, UUID id) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalStateException("Authenticated user not found"));

        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalStateException("Resume not found"));

        return MasterResumeResponse.builder()
                .resumeJson(resume.getResumeJson())
                .build();
    }

    @Transactional
    public CommonResponse updateResume(UUID id, CreateAndUpdateMasterResume request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalStateException("Authenticated user not found"));

        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Resume does not exist. Create one before updating."));

        // Convert DTO → JSON model
        MasterResumeJson resumeJson = convertToModel(request);

        // Update canonical JSON
        resume.setResumeJson(resumeJson);
        // updatedAt handled by @PreUpdate

        try {
            resumeRepository.save(resume);
        } catch (DataIntegrityViolationException ex) {
            // This handles race conditions if two requests come together
            throw new DuplicateResourceException("Resume does not exist. Create one before updating.");
        }

        return CommonResponse.builder()
                .message("Resume updated successfully")
                .email(email)
                .build();
    }

    @Transactional
    public CommonResponse deleteResumeById(UUID id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalStateException("Authenticated user not found"));

        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Resume does not exist."));

        resume.setStatus(ResumeStatus.DELETED);

        try {
            resumeRepository.save(resume);
        } catch (DataIntegrityViolationException ex) {
            // This handles race conditions if two requests come together
            throw new DuplicateResourceException("Resume does not exist");
        }

        return CommonResponse.builder()
                .message("Resume deleted successfully")
                .email(email)
                .build();
    }

    /**
     * Simple manual conversion method.
     * This keeps the service clean and avoids tight coupling of DB model and API DTO.
     */
    private MasterResumeJson convertToModel(CreateAndUpdateMasterResume request) {

        // Minimal safe mapping (you can expand field-by-field later)
        // If your DTO == model exactly, you can also use ObjectMapper convertValue()
        // but manual mapping is safest long-term for stability.

        // For now, simplest conversion:
        // (Assuming your DTO structure matches model structure perfectly)
        // You can replace this with an ObjectMapper-based conversion later.

        // Quick approach (recommended for speed):
        // return objectMapper.convertValue(request, MasterResumeJson.class);

        // Manual mapping placeholder:
        // NOTE: To keep response short, we assign root fields directly only if needed.

        return objectMapper.convertValue(request, MasterResumeJson.class);
    }
}
