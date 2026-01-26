package com.resumeagent.controller;

import com.resumeagent.dto.request.CreateMasterResume;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.service.MasterResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/master-resume")
@RequiredArgsConstructor
public class MasterResumeController {

    private final MasterResumeService masterResumeService;

    /**
     * Creates a new Master Resume for the authenticated user.
     * Only one master resume per user is allowed in Phase 1.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse createMasterResume(
            Authentication authentication,
            @Valid @RequestBody CreateMasterResume request
    ) {
        String email = authentication.getName();
        return masterResumeService.createMasterResume(request, email);
    }
}
