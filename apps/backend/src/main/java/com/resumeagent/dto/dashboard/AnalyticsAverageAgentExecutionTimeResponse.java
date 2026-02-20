package com.resumeagent.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnalyticsAverageAgentExecutionTimeResponse {
    private int resumeParser;
    private int jobDescriptionAnalyzer;
    private int matching;
    private int resumeRewriter;
    private int atsOptimizer;
}
