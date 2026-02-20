package com.resumeagent.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnalyticsOverviewStatsResponse {
    private int monthlyResumeLimit;
    private int totalGeneratedResumes;
    private int uniqueRolesTargeted;
    private int aiSuccessRate;
}
