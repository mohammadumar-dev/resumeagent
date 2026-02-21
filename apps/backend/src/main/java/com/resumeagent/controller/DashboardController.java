package com.resumeagent.controller;

import com.resumeagent.dto.dashboard.AnalyticsAverageAgentExecutionTimeResponse;
import com.resumeagent.dto.dashboard.AnalyticsAIExecutionStatusResponse;
import com.resumeagent.dto.dashboard.AnalyticsChartInputOutputTokensListResponse;
import com.resumeagent.dto.dashboard.AnalyticsMetricsStatsResponse;
import com.resumeagent.dto.dashboard.AnalyticsOverviewStatsResponse;
import com.resumeagent.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/analytics/overview")
    @ResponseStatus(HttpStatus.OK)
    public AnalyticsOverviewStatsResponse getAnalyticsOverviewStats(Authentication authentication) {
        String email = authentication.getName();
        return dashboardService.getAnalyticsOverviewStats(email);
    }

    @GetMapping(value = "/analytics/metrics")
    @ResponseStatus(HttpStatus.OK)
    public AnalyticsMetricsStatsResponse getAnalyticsMetricsStats(Authentication authentication) {
        String email = authentication.getName();
        return dashboardService.getAnalyticsMetricsStats(email);
    }

    @GetMapping(value = "/analytics/chart/input-output-tokens")
    @ResponseStatus(HttpStatus.OK)
    public AnalyticsChartInputOutputTokensListResponse getInputOutputTokensChart(Authentication authentication) {
        String email = authentication.getName();
        return dashboardService.getAnalyticsChartInputOutputTokens(email);
    }

    @GetMapping(value = "/analytics/agent-execution-time")
    @ResponseStatus(HttpStatus.OK)
    public AnalyticsAverageAgentExecutionTimeResponse getAverageAgentExecutionTime(Authentication authentication) {
        String email = authentication.getName();
        return dashboardService.getAnalyticsAverageAgentExecutionTime(email);
    }

    @GetMapping(value = "/analytics/ai-execution-status")
    @ResponseStatus(HttpStatus.OK)
    public AnalyticsAIExecutionStatusResponse getAIExecutionStatus(Authentication authentication) {
        String email = authentication.getName();
        return dashboardService.getAnalyticsAIExecutionStatus(email);
    }
}
