package com.resumeagent.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnalyticsChartInputOutputTokensListResponse {
    private List<AnalyticsChartInputOutputTokensResponse> items;
}
