package com.resumeagent.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnalyticsMetricsStatsResponse {
    private int aiSuccessRate;
    private int monthlyResumeLimit;
    private int monthlyTokensUsed;
    private int totalTokensUsed;
}
