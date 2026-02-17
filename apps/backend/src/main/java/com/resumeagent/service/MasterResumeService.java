package com.resumeagent.service;

import com.resumeagent.ai.agents.ResumeParserAgent;
import com.resumeagent.dto.request.CreateAndUpdateMasterResume;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.dto.response.MasterResumeResponse;
import com.resumeagent.entity.MasterResume;
import com.resumeagent.entity.User;
import com.resumeagent.entity.model.MasterResumeJson;
import com.resumeagent.exception.DuplicateResourceException;
import com.resumeagent.repository.MasterResumeRepository;
import com.resumeagent.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MasterResumeService {

    private final UserRepository userRepository;
    private final MasterResumeRepository masterResumeRepository;
    private final ObjectMapper objectMapper;
    private final ResumeParserAgent resumeParserAgent;

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

        // Prevent duplicate master resume creation
        if (masterResumeRepository.existsByUserId(userId)) {
            masterResumeRepository.deleteById(userId);
        }

        MasterResumeJson parsedResume = resumeParserAgent.run(resumeText);

        MasterResume masterResume = MasterResume.builder()
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

        MasterResume masterResume = masterResumeRepository.findByUser(user)
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

        masterResumeRepository.delete(masterResume);

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
}
