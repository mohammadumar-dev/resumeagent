package com.resumeagent.service;

import com.resumeagent.dto.request.CreateMasterResume;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.entity.MasterResume;
import com.resumeagent.entity.User;
import com.resumeagent.entity.model.MasterResumeJson;
import com.resumeagent.exception.DuplicateResourceException;
import com.resumeagent.repository.MasterResumeRepository;
import com.resumeagent.repository.UserRepository;
import jakarta.transaction.Transactional;
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

    /**
     * Creates a Master Resume for the authenticated user.
     * Only 1 master resume per user is allowed (Phase 1).
     *
     * Transactional because we insert a new master resume row,
     * and we want full rollback if anything fails.
     */
    @Transactional
    public CommonResponse createMasterResume(CreateMasterResume request, String email) {

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

    /**
     * Simple manual conversion method.
     * This keeps the service clean and avoids tight coupling of DB model and API DTO.
     */
    private MasterResumeJson convertToModel(CreateMasterResume request) {

        MasterResumeJson json = new MasterResumeJson();

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
