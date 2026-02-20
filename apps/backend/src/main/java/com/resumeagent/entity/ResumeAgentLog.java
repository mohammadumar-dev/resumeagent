package com.resumeagent.entity;

import com.resumeagent.entity.enums.AgentExecutionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Audit trail for AI agent operations with performance metrics.
 * Maps to table: resume_agent_logs
 */
@Entity
@Table(
        name = "resume_agent_logs",
        indexes = {
                @Index(name = "idx_agent_logs_user_id", columnList = "user_id"),
                @Index(name = "idx_agent_logs_resume_id", columnList = "resume_id"),
                @Index(name = "idx_agent_logs_agent_name", columnList = "agent_name"),
                @Index(name = "idx_agent_logs_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"errorMessage", "inputSnapshot"})
public class ResumeAgentLog implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    // -------------------------------------------------------------------------
    // Primary Key
    // -------------------------------------------------------------------------
    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------
    /**
     * The user who triggered this agent run. DB: NOT NULL, FK -> users(id) ON DELETE CASCADE.
     * Keep FetchType.LAZY to avoid unnecessary joins when not required.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_agent_logs_user"))
    private User user;

    /**
     * Optional reference to a resume; nullable, DB-level FK ON DELETE SET NULL.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id",
            foreignKey = @ForeignKey(name = "fk_agent_logs_resume"))
    private Resume resume;

    // -------------------------------------------------------------------------
    // Attributes
    // -------------------------------------------------------------------------
    @Column(name = "agent_name", nullable = false, length = 100)
    private String agentName;

    @Column(name = "tokens_input")
    private Integer tokensInput;

    @Column(name = "tokens_output")
    private Integer tokensOutput;

    @Column(name = "attempt_number")
    private Integer attemptNumber;

    @Column(name = "input_snapshot", columnDefinition = "text")
    private String inputSnapshot;

    /**
     * Execution time in milliseconds.
     */
    @Column(name = "execution_time_ms")
    private Integer executionTimeMs;

    /**
     * Execution status stored as String (EnumType.STRING).
     * DB CHECK expects uppercase values: 'SUCCESS','FAILURE','PARTIAL'
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AgentExecutionStatus status = AgentExecutionStatus.PARTIAL;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    // -------------------------------------------------------------------------
    // Auditing
    // -------------------------------------------------------------------------
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.status == null) {
            this.status = AgentExecutionStatus.PARTIAL;
        }
    }
}
