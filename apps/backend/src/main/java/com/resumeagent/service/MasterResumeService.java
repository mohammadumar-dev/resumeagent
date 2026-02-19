package com.resumeagent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.resumeagent.ai.agents.ResumeParserAgent;
import com.resumeagent.ai.util.TokenCounter;
import com.resumeagent.dto.request.CreateAndUpdateMasterResume;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.dto.response.MasterResumeResponse;
import com.resumeagent.entity.MasterResume;
import com.resumeagent.entity.ResumeAgentLog;
import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.AgentExecutionStatus;
import com.resumeagent.entity.model.MasterResumeJson;
import com.resumeagent.exception.DuplicateResourceException;
import com.resumeagent.repository.MasterResumeRepository;
import com.resumeagent.repository.ResumeAgentLogRepository;
import com.resumeagent.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MasterResumeService {

    private final UserRepository userRepository;
    private final MasterResumeRepository masterResumeRepository;
    private final ResumeAgentLogRepository agentLogRepository;
    private final ObjectMapper objectMapper;
    private final ResumeParserAgent resumeParserAgent;
    private final PlatformTransactionManager transactionManager;

    /**
     * Creates a Master Resume for the authenticated user.
     * Only 1 master resume per user is allowed (Phase 1).
     * Transactional because we insert a new master resume row,
     * and we want full rollback if anything fails.
     */
    @Transactional
    public CommonResponse createMasterResume(CreateAndUpdateMasterResume request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        UUID userId = user.getId();

        // Prevent duplicate master resume creation
        if (masterResumeRepository.existsByUserId(userId)) {
            throw new DuplicateResourceException("Master resume already exists for this user");
        }

        // Convert request DTO -> Model (stored as JSONB)
        MasterResumeJson resumeJson = convertToModel(request);

        MasterResume masterResume = MasterResume.builder()
                .user(user)
                .resumeJson(resumeJson)
                .active(true)
                .build();

        try {
            masterResumeRepository.save(masterResume);
        } catch (DataIntegrityViolationException ex) {
            // This handles race conditions if two requests come together
            throw new DuplicateResourceException("Master resume already exists for this user");
        }

        return CommonResponse.builder()
                .message("Master resume created successfully")
                .email(email)
                .build();
    }

    @Transactional
    public CommonResponse createMasterResumeFromText(String resumeText, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        UUID userId = user.getId();

        MasterResume existingMasterResume = masterResumeRepository.findByUser(user).orElse(null);

        int tokensInput = TokenCounter.countTokens(resumeText);
        long start = System.nanoTime();
        MasterResumeJson parsedResume;

        try {
            parsedResume = resumeParserAgent.run(resumeText);
            int tokensOutput = countTokensFromJson(parsedResume);
            saveAgentLog(
                    "ResumeParserAgent",
                    user,
                    AgentExecutionStatus.SUCCESS,
                    null,
                    tokensInput,
                    tokensOutput,
                    start
            );
        } catch (Exception ex) {
            String errorMessage = ex.getMessage();
            saveAgentLog(
                    "ResumeParserAgent",
                    user,
                    AgentExecutionStatus.FAILURE,
                    errorMessage,
                    tokensInput,
                    0,
                    start
            );
            if (ex instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new RuntimeException("Resume parser agent failed", ex);
        }

        MasterResume masterResume = existingMasterResume != null
                ? updateExistingMasterResume(existingMasterResume, parsedResume)
                : MasterResume.builder()
                    .user(user)
                    .resumeJson(parsedResume)
                    .active(true)
                    .build();

        try {
            masterResumeRepository.save(masterResume);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Master resume failed to create from text. Please try again.");
        }

        return CommonResponse.builder()
                .message("Master resume created from text successfully")
                .email(email)
                .build();
    }

    /**
     * Updates a Master Resume for the authenticated user.
     * Only if master resume exist then update happens.
     * Transactional because we insert a new master resume row,
     * and we want full rollback if anything fails.
     */
    @Transactional
    public CommonResponse updateMasterResume(CreateAndUpdateMasterResume request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalStateException("Authenticated user not found"));

        MasterResume masterResume = masterResumeRepository.findByUser(user)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Master resume does not exist. Create one before updating."));

        // Convert DTO → JSON model
        MasterResumeJson resumeJson = convertToModel(request);

        // Update canonical JSON
        masterResume.setResumeJson(resumeJson);
        // updatedAt handled by @PreUpdate

        try {
            masterResumeRepository.save(masterResume);
        } catch (DataIntegrityViolationException ex) {
            // This handles race conditions if two requests come together
            throw new DuplicateResourceException("Master resume does not exist. Create one before updating.");
        }

        return CommonResponse.builder()
                .message("Master resume updated successfully")
                .email(email)
                .build();
    }

    @Transactional(readOnly = true)
    public MasterResumeResponse getMasterResume(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalStateException("Authenticated user not found"));

        MasterResume masterResume = masterResumeRepository.findByUserAndActive(user, true)
                .orElseThrow(() ->
                        new IllegalStateException("Master resume not found"));

        return MasterResumeResponse.builder()
                .resumeJson(masterResume.getResumeJson())
                .build();
    }

    @Transactional
    public CommonResponse deleteMasterResume(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        MasterResume masterResume = masterResumeRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("Master resume not found"));

        masterResume.setActive(false);

        try {
            masterResumeRepository.save(masterResume);
        } catch (DataIntegrityViolationException ex) {
            // This handles race conditions if two requests come together
            throw new DuplicateResourceException("Master resume does not exist.");
        }

        return CommonResponse.builder()
                .email(email)
                .message("Master resume deleted successfully")
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

    private MasterResume updateExistingMasterResume(MasterResume masterResume, MasterResumeJson resumeJson) {
        masterResume.setResumeJson(resumeJson);
        masterResume.setActive(true);
        return masterResume;
    }

    private ResumeAgentLog saveAgentLog(
            String agentName,
            User user,
            AgentExecutionStatus status,
            String errorMessage,
            Integer tokensInput,
            Integer tokensOutput,
            long startNanoTime
    ) {
        long elapsedMs = (System.nanoTime() - startNanoTime) / 1_000_000L;
        int executionTimeMs = elapsedMs > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) elapsedMs;

        ResumeAgentLog agentLog = ResumeAgentLog.builder()
                .agentName(agentName)
                .user(user)
                .status(status)
                .executionTimeMs(executionTimeMs)
                .errorMessage(errorMessage)
                .tokensInput(tokensInput)
                .tokensOutput(tokensOutput)
                .build();

        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        ResumeAgentLog saved = transactionTemplate.execute(statusTx -> agentLogRepository.save(agentLog));
        return saved == null ? agentLog : saved;
    }

    private int countTokensFromJson(Object value) throws JsonProcessingException {
        return TokenCounter.countTokens(writeJson(value));
    }

    private String writeJson(Object value) throws JsonProcessingException {
        return objectMapper.writeValueAsString(value);
    }
}
