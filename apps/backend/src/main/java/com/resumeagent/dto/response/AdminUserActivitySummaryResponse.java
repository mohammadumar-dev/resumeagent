package com.resumeagent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserActivitySummaryResponse {
    private String userId;
    private String email;
    private String fullName;
    private String role;
    private String plan;
    private boolean emailActive;
    private String createdAt;

    private int resumeGenerationLimit;
    private int resumeGenerationUsed;

    private boolean hasMasterResume;
    private int totalResumes;
    private int totalResumeGenerations;
    private int totalAgentLogs;

    private int agentSuccessCount;
    private int agentFailureCount;
    private int agentPartialCount;

    private long totalTokensUsed;

    private String lastResumeGenerationStatus;
    private String lastResumeGenerationAt;
}
