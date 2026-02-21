package com.resumeagent.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnalyticsAIExecutionStatusResponse {
    private int successCount;
    private int failureCount;
    private int partialCount;
}
