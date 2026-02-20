package com.resumeagent.repository;

import com.resumeagent.entity.ResumeAgentLog;
import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.AgentExecutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeAgentLogRepository extends JpaRepository<ResumeAgentLog, UUID> {

    boolean existsByUser(User user);

    boolean existsByUserId(UUID userId);

    Optional<ResumeAgentLog> findByUser(User user);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, AgentExecutionStatus status);

    @Query("select coalesce(sum(coalesce(r.tokensInput, 0) + coalesce(r.tokensOutput, 0)), 0) " +
            "from ResumeAgentLog r " +
            "where r.user.id = :userId and r.status <> :status")
    long sumTokensByUserIdAndStatusNot(
            @Param("userId") UUID userId,
            @Param("status") AgentExecutionStatus status
    );

    @Query("select coalesce(sum(coalesce(r.tokensInput, 0) + coalesce(r.tokensOutput, 0)), 0) " +
            "from ResumeAgentLog r " +
            "where r.user.id = :userId and r.status <> :status " +
            "and r.createdAt >= :start and r.createdAt < :end")
    long sumTokensByUserIdAndStatusNotAndCreatedAtBetween(
            @Param("userId") UUID userId,
            @Param("status") AgentExecutionStatus status,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query(value = "select date(r.created_at) as day, " +
            "coalesce(sum(coalesce(r.tokens_input, 0)), 0) as inputTokens, " +
            "coalesce(sum(coalesce(r.tokens_output, 0)), 0) as outputTokens " +
            "from resume_agent_logs r " +
            "where r.user_id = :userId and r.created_at >= :start and r.created_at < :end " +
            "group by day order by day",
            nativeQuery = true)
    List<DailyTokenUsage> findDailyTokenUsage(
            @Param("userId") UUID userId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("select r.agentName as agentName, avg(r.executionTimeMs) as avgExecutionTimeMs " +
            "from ResumeAgentLog r " +
            "where r.user.id = :userId and r.executionTimeMs is not null " +
            "group by r.agentName")
    List<AgentExecutionTimeAverage> findAverageExecutionTimeByAgentName(
            @Param("userId") UUID userId
    );

    interface AgentExecutionTimeAverage {
        String getAgentName();

        Double getAvgExecutionTimeMs();
    }

    interface DailyTokenUsage {
        LocalDate getDay();

        long getInputTokens();

        long getOutputTokens();
    }
}
