package com.resumeagent.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CommonResponse generateResume(
            Authentication authentication,
            @RequestPart("jobDescription" ) String jobDescription
    ) throws JsonProcessingException {

        String email = authentication.getName();
        return resumeService.generateResume(jobDescription, email);
    }
}
