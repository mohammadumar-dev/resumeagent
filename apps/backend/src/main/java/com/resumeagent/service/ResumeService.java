package com.resumeagent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeagent.ai.agents.ATSOptimizationAgent;
import com.resumeagent.ai.agents.JobDescriptionAnalyzerAgent;
import com.resumeagent.ai.agents.MatchingAgent;
import com.resumeagent.ai.agents.ResumeRewriteAgent;
import com.resumeagent.ai.util.TokenCounter;
import com.resumeagent.dto.response.CommonResponse;
import com.resumeagent.entity.MasterResume;
import com.resumeagent.entity.Resume;
import com.resumeagent.entity.ResumeAgentLog;
import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.AgentExecutionStatus;
import com.resumeagent.entity.enums.ResumeStatus;
import com.resumeagent.entity.model.JobDescriptionAnalyzerJson;
import com.resumeagent.entity.model.MasterResumeJson;
import com.resumeagent.entity.model.MatchingAgentJson;
import com.resumeagent.render.GreenResumeDocxService;
import com.resumeagent.render.BlueResumeDocxService;
import com.resumeagent.repository.MasterResumeRepository;
import com.resumeagent.repository.ResumeAgentLogRepository;
import com.resumeagent.repository.ResumeRepository;
import com.resumeagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeService {

    // Repositories
    private final UserRepository userRepository;
    private final MasterResumeRepository masterResumeRepository;
    private final ResumeAgentLogRepository agentLogRepository;
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
    @Transactional
    public CommonResponse generateResume(String jobDescription, String email) throws JsonProcessingException {

        User user = userRepository.findByEmailForUpdate(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);

        // Reset monthly usage if it's a new month
        if (!user.getUsageMonth().equals(currentMonth)) {
            user.setUsageMonth(currentMonth);
            user.setResumeGenerationUsed(0);
        }

        // Enforce resume generation limits based on user role
        if (user.getResumeGenerationUsed() >= user.getResumeGenerationLimit()) {
            throw new IllegalStateException(
                    "Monthly resume generation limit reached. Upgrade your plan to continue."
            );
        }


        // Fetch user's master resume
        MasterResume masterResume =  masterResumeRepository.findByUser(user).orElseThrow(
                () -> new IllegalStateException("Master resume not found"));

        // Extract master resume JSON model
        MasterResumeJson masterResumeJson = masterResume.getResumeJson();

        List<ResumeAgentLog> agentLogs = new ArrayList<>();

        // Execute AI pipeline
        // Step 1: Job Description Analysis
        JobDescriptionAnalyzerJson jobDescriptionAnalyzerJson = executeAgentWithLog(
                "JobDescriptionAnalyzerAgent",
                user,
                null,
                agentLogs,
                TokenCounter.countTokens(jobDescription),
                this::writeJson,
                () -> jobDescriptionAnalyzerAgent.executeJobDescriptionAnalyzerAgent(jobDescription)
        );

        System.out.println("Job Description Analysis JSON: " + jobDescriptionAnalyzerJson);
        // Step 2: Matching
        MatchingAgentJson matchingAgentJson = executeAgentWithLog(
                "MatchingAgent",
                user,
                null,
                agentLogs,
                countTokensFromJson(masterResumeJson) + countTokensFromJson(jobDescriptionAnalyzerJson),
                this::writeJson,
                () -> matchingAgent.executeMatchingAgent(masterResumeJson, jobDescriptionAnalyzerJson)
        );

        // Step 3: Resume Rewriting
        MasterResumeJson rewrittenResume = executeAgentWithLog(
                "ResumeRewriteAgent",
                user,
                null,
                agentLogs,
                countTokensFromJson(masterResumeJson)
                        + countTokensFromJson(jobDescriptionAnalyzerJson)
                        + countTokensFromJson(matchingAgentJson),
                this::writeJson,
                () -> resumeRewriteAgent.executeResumeRewriteAgent(
                        masterResumeJson, jobDescriptionAnalyzerJson, matchingAgentJson)
        );

        // Step 4: ATS Optimization
        MasterResumeJson finalResume = executeAgentWithLog(
                "ATSOptimizationAgent",
                user,
                null,
                agentLogs,
                countTokensFromJson(rewrittenResume),
                this::writeJson,
                () -> atsOptimizationAgent.executeATSOptimizationAgent(rewrittenResume)
        );

        // Extract targeted job title and company name
        String jobTitle = jobDescriptionAnalyzerJson.getJobIdentity().getJobTitle();
        String companyName = jobDescriptionAnalyzerJson.getJobIdentity().getCompanyName();

        // Save the generated resume
        Resume generatedResume = Resume.builder()
                .user(user)
                .masterResume(masterResume)
                .jobTitleTargeted(jobTitle)
                .jobDescriptionAnalyzerJson(jobDescriptionAnalyzerJson)
                .companyTargeted(companyName)
                .resumeJson(finalResume)
                .status(ResumeStatus.ACTIVE)
                .build();

        user.setResumeGenerationUsed(user.getResumeGenerationUsed() + 1);

        // Handle potential data integrity issues
        try {
            // Save generated resume
            resumeRepository.save(generatedResume);

            // Update user's resume generation count
            userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            // This handles race conditions or other integrity issues
            throw new RuntimeException("Failed to save generated resume", ex);
        }

        if (!agentLogs.isEmpty()) {
            agentLogs.forEach(log -> log.setResume(generatedResume));
            agentLogRepository.saveAll(agentLogs);
        }

        // Return success response
        return CommonResponse.builder()
                .message("Resume generated successfully")
                .email(email)
                .build();
    }

    private interface AgentCall<T> {
        T call() throws Exception;
    }

    private interface AgentOutputSerializer<T> {
        String serialize(T output) throws JsonProcessingException;
    }

    private <T> T executeAgentWithLog(
            String agentName,
            User user,
            Resume resume,
            List<ResumeAgentLog> agentLogs,
            int tokensInput,
            AgentOutputSerializer<T> outputSerializer,
            AgentCall<T> action
    ) throws JsonProcessingException {
        long start = System.nanoTime();
        try {
            T result = action.call();
            int tokensOutput = TokenCounter.countTokens(outputSerializer.serialize(result));
            agentLogs.add(saveAgentLog(
                    agentName,
                    user,
                    resume,
                    AgentExecutionStatus.SUCCESS,
                    null,
                    tokensInput,
                    tokensOutput,
                    start
            ));
            return result;
        } catch (Exception ex) {
            String errorMessage = ex.getMessage();
            agentLogs.add(saveAgentLog(
                    agentName,
                    user,
                    resume,
                    AgentExecutionStatus.FAILURE,
                    errorMessage,
                    tokensInput,
                    0,
                    start
            ));
            if (ex instanceof JsonProcessingException jsonProcessingException) {
                throw jsonProcessingException;
            }
            throw new RuntimeException("Agent execution failed: " + agentName, ex);
        }
    }

    private ResumeAgentLog saveAgentLog(
            String agentName,
            User user,
            Resume resume,
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
                .resume(resume)
                .status(status)
                .executionTimeMs(executionTimeMs)
                .errorMessage(errorMessage)
                .tokensInput(tokensInput)
                .tokensOutput(tokensOutput)
                .build();

        return agentLogRepository.save(agentLog);
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
}
