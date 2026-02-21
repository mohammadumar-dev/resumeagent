package com.resumeagent.service;

import com.resumeagent.dto.dashboard.AnalyticsChartInputOutputTokensListResponse;
import com.resumeagent.dto.dashboard.AnalyticsChartInputOutputTokensResponse;
import com.resumeagent.dto.dashboard.AnalyticsAIExecutionStatusResponse;
import com.resumeagent.dto.dashboard.AnalyticsAverageAgentExecutionTimeResponse;
import com.resumeagent.dto.dashboard.AnalyticsMetricsStatsResponse;
import com.resumeagent.dto.dashboard.AnalyticsOverviewStatsResponse;
import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.AgentExecutionStatus;
import com.resumeagent.entity.enums.ResumeStatus;
import com.resumeagent.repository.ResumeAgentLogRepository;
import com.resumeagent.repository.ResumeRepository;
import com.resumeagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAgentLogRepository resumeAgentLogRepository;

    @Transactional(readOnly = true)
    public AnalyticsOverviewStatsResponse getAnalyticsOverviewStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        UUID userId = user.getId();

        int monthlyResumeLimit = user.getResumeGenerationUsed();

        long totalGeneratedResumes = resumeRepository.countByUserIdAndStatusNot(
                userId, ResumeStatus.DELETED
        );

        long uniqueRolesTargeted = resumeRepository.countDistinctJobTitleTargetedByUserIdAndStatusNot(
                userId, ResumeStatus.DELETED
        );

        long totalLogs = resumeAgentLogRepository.countByUserId(userId);
        long successLogs = resumeAgentLogRepository.countByUserIdAndStatus(
                userId, AgentExecutionStatus.SUCCESS
        );

        int aiSuccessRate = totalLogs == 0
                ? 0
                : (int) Math.round((double) successLogs * 100.0 / totalLogs);

        return AnalyticsOverviewStatsResponse.builder()
                .monthlyResumeLimit(monthlyResumeLimit)
                .totalGeneratedResumes(Math.toIntExact(totalGeneratedResumes))
                .uniqueRolesTargeted(Math.toIntExact(uniqueRolesTargeted))
                .aiSuccessRate(aiSuccessRate)
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsMetricsStatsResponse getAnalyticsMetricsStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        UUID userId = user.getId();
        int monthlyResumeLimit = user.getResumeGenerationUsed();

        ZoneId zoneId = ZoneId.systemDefault();
        LocalDate monthStart = LocalDate.now(zoneId).withDayOfMonth(1);
        Instant start = monthStart.atStartOfDay(zoneId).toInstant();
        Instant end = monthStart.plusMonths(1).atStartOfDay(zoneId).toInstant();

        long monthlyTokensUsed = resumeAgentLogRepository.sumTokensByUserIdAndStatusNotAndCreatedAtBetween(
                userId, AgentExecutionStatus.FAILURE, start, end
        );

        long totalTokensUsed = resumeAgentLogRepository.sumTokensByUserIdAndStatusNot(
                userId, AgentExecutionStatus.FAILURE
        );

        long totalLogs = resumeAgentLogRepository.countByUserId(userId);
        long successLogs = resumeAgentLogRepository.countByUserIdAndStatus(
                userId, AgentExecutionStatus.SUCCESS
        );

        int aiSuccessRate = totalLogs == 0
                ? 0
                : (int) Math.round((double) successLogs * 100.0 / totalLogs);

        return AnalyticsMetricsStatsResponse.builder()
                .aiSuccessRate(aiSuccessRate)
                .monthlyResumeLimit(monthlyResumeLimit)
                .monthlyTokensUsed(Math.toIntExact(monthlyTokensUsed))
                .totalTokensUsed(Math.toIntExact(totalTokensUsed))
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsChartInputOutputTokensListResponse getAnalyticsChartInputOutputTokens(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        UUID userId = user.getId();
        ZoneId zoneId = ZoneId.systemDefault();

        LocalDate startDate = LocalDate.now(zoneId).minusMonths(2).withDayOfMonth(1);
        LocalDate endDate = LocalDate.now(zoneId).plusMonths(1).withDayOfMonth(1);

        Instant start = startDate.atStartOfDay(zoneId).toInstant();
        Instant end = endDate.atStartOfDay(zoneId).toInstant();

        List<ResumeAgentLogRepository.DailyTokenUsage> usageRows =
                resumeAgentLogRepository.findDailyTokenUsage(userId, start, end);

        Map<LocalDate, ResumeAgentLogRepository.DailyTokenUsage> usageByDay = new HashMap<>();
        for (ResumeAgentLogRepository.DailyTokenUsage row : usageRows) {
            usageByDay.put(row.getDay(), row);
        }

        List<AnalyticsChartInputOutputTokensResponse> items = new ArrayList<>();
        for (LocalDate day = startDate; day.isBefore(endDate); day = day.plusDays(1)) {
            ResumeAgentLogRepository.DailyTokenUsage row = usageByDay.get(day);
            int inputTokens = row == null ? 0 : Math.toIntExact(row.getInputTokens());
            int outputTokens = row == null ? 0 : Math.toIntExact(row.getOutputTokens());

            items.add(AnalyticsChartInputOutputTokensResponse.builder()
                    .date(day)
                    .inputTokens(inputTokens)
                    .outputTokens(outputTokens)
                    .build());
        }

        return AnalyticsChartInputOutputTokensListResponse.builder()
                .items(items)
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsAverageAgentExecutionTimeResponse getAnalyticsAverageAgentExecutionTime(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        List<ResumeAgentLogRepository.AgentExecutionTimeAverage> averages =
                resumeAgentLogRepository.findAverageExecutionTimeByAgentName(user.getId());

        int resumeParser = 0;
        int jobDescriptionAnalyzer = 0;
        int matching = 0;
        int resumeRewriter = 0;
        int atsOptimizer = 0;

        for (ResumeAgentLogRepository.AgentExecutionTimeAverage row : averages) {
            String agentName = row.getAgentName();
            Double avgMs = row.getAvgExecutionTimeMs();
            int avgRounded = avgMs == null ? 0 : (int) Math.round(avgMs);

            if ("ResumeParserAgent".equals(agentName)) {
                resumeParser = avgRounded;
            } else if ("JobDescriptionAnalyzerAgent".equals(agentName)) {
                jobDescriptionAnalyzer = avgRounded;
            } else if ("MatchingAgent".equals(agentName)) {
                matching = avgRounded;
            } else if ("ResumeRewriteAgent".equals(agentName)) {
                resumeRewriter = avgRounded;
            } else if ("ATSOptimizationAgent".equals(agentName)) {
                atsOptimizer = avgRounded;
            }
        }

        return AnalyticsAverageAgentExecutionTimeResponse.builder()
                .resumeParser(resumeParser)
                .jobDescriptionAnalyzer(jobDescriptionAnalyzer)
                .matching(matching)
                .resumeRewriter(resumeRewriter)
                .atsOptimizer(atsOptimizer)
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsAIExecutionStatusResponse getAnalyticsAIExecutionStatus(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        UUID userId = user.getId();

        long successLogs = resumeAgentLogRepository.countByUserIdAndStatus(
                userId, AgentExecutionStatus.SUCCESS
        );
        long failureLogs = resumeAgentLogRepository.countByUserIdAndStatus(
                userId, AgentExecutionStatus.FAILURE
        );
        long partialLogs = resumeAgentLogRepository.countByUserIdAndStatus(
                userId, AgentExecutionStatus.PARTIAL
        );

        return AnalyticsAIExecutionStatusResponse.builder()
                .successCount(Math.toIntExact(successLogs))
                .failureCount(Math.toIntExact(failureLogs))
                .partialCount(Math.toIntExact(partialLogs))
                .build();
    }
}
