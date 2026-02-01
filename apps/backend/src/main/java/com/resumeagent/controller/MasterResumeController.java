package com.resumeagent.controller;

import com.resumeagent.dto.request.CreateAndUpdateMasterResume;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.dto.response.MasterResumeResponse;
import com.resumeagent.service.MasterResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/master-resume")
@RequiredArgsConstructor
public class MasterResumeController {

    private final MasterResumeService masterResumeService;

    /**
     * Creates a new Master Resume for the authenticated user.
     * Only one master resume per user is allowed in Phase 1.
     */
    @PostMapping(value = "/create")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse createMasterResume(
            Authentication authentication,
            @Valid @RequestBody CreateAndUpdateMasterResume request
    ) {
        String email = authentication.getName();
        return masterResumeService.createMasterResume(request, email);
    }

    @PostMapping(
            value = "/create/text",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse createMasterResumeFromText(
            Authentication authentication,
            @RequestPart("resume") String resumeText
    ) {

        String email = authentication.getName();
        return masterResumeService.createMasterResumeFromText(resumeText, email);
    }

    /**
     * Updates a Master Resume for the authenticated user.
     */
    @PutMapping(value = "/update")
    @ResponseStatus(HttpStatus.OK)
    public CommonResponse updateMasterResume(
            Authentication authentication,
            @Valid @RequestBody CreateAndUpdateMasterResume request
    ) {
        String email = authentication.getName();
        return masterResumeService.updateMasterResume(request, email);
    }

    /**
     * Returns a Master Resume for the authenticated user.
     */
    @GetMapping(value = "/view")
    @ResponseStatus(HttpStatus.OK)
    public MasterResumeResponse getMasterResume(Authentication authentication ) {
        String email = authentication.getName();
        return masterResumeService.getMasterResume(email);
    }

    /**
     * Deletes a Master Resume for the authenticated user.
     */
    @DeleteMapping(value = "/delete")
    @ResponseStatus(HttpStatus.OK)
    public CommonResponse deleteMasterResume(Authentication authentication) {
        String email = authentication.getName();
        return masterResumeService.deleteMasterResume(email);
    }
}
