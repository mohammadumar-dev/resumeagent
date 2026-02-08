package com.resumeagent.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.repository.ResumeRepository;
import com.resumeagent.repository.UserRepository;
import com.resumeagent.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(value = "/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @PostMapping(value = "/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CommonResponse generateResume(
            Authentication authentication,
            @RequestPart("jobDescription") String jobDescription) throws JsonProcessingException {

        String email = authentication.getName();
        return resumeService.generateResume(jobDescription, email);
    }

    /**
     * Downloads a resume as a DOCX file.
     * Resume Template: Blue
     * @param authentication The authenticated user
     * @param id             The UUID of the resume to download
     * @return ResponseEntity containing the DOCX file bytes
     */
    @GetMapping("/{id}/blue/download")
    public ResponseEntity<byte[]> downloadResumeBlue(
            Authentication authentication,
            @PathVariable UUID id) {
        String email = authentication.getName();

        return resumeService.downloadResumeBlue(email, id);
    }

    /**
     * Downloads a resume as a DOCX file.
     * Resume Template: Green
     * @param authentication The authenticated user
     * @param id             The UUID of the resume to download
     * @return ResponseEntity containing the DOCX file bytes
     */
    @GetMapping("/{id}/green/download")
    public ResponseEntity<byte[]> downloadResumeGreen(
            Authentication authentication,
            @PathVariable UUID id) {
        String email = authentication.getName();

        return resumeService.downloadResumeGreen(email, id);
    }

}
