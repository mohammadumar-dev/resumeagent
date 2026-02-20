package com.resumeagent.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnalyticsChartInputOutputTokensResponse {
    private LocalDate date;
    private int inputTokens;
    private int outputTokens;
}
