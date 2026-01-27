package com.resumeagent.controller;

import com.resumeagent.dto.request.CreateAndUpdateMasterResume;
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
    @PostMapping(value = "/create")
    @ResponseStatus(HttpStatus.CREATED)
    public CommonResponse createMasterResume(
            Authentication authentication,
            @Valid @RequestBody CreateAndUpdateMasterResume request
    ) {
        String email = authentication.getName();
        return masterResumeService.createMasterResume(request, email);
    }

    @PutMapping(value = "/update")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public CommonResponse updateMasterResume(
            Authentication authentication,
            @Valid @RequestBody CreateAndUpdateMasterResume request
    ) {
        String email = authentication.getName();
        return masterResumeService.updateMasterResume(request, email);
    }
}
