package com.resumeagent.entity;

import com.resumeagent.entity.enums.SystemLogLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "system_logs",
        indexes = {
                @Index(name = "idx_system_logs_created_at", columnList = "created_at DESC"),
                @Index(name = "idx_system_logs_log_level", columnList = "log_level"),
                @Index(name = "idx_system_logs_log_type", columnList = "log_type"),
                @Index(name = "idx_system_logs_user_id", columnList = "user_id"),
                @Index(name = "idx_system_logs_status_code", columnList = "status_code"),
                @Index(name = "idx_system_logs_endpoint", columnList = "endpoint"),
                @Index(name = "idx_system_logs_request_id", columnList = "request_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = { "metadata", "stackTrace", "userAgent" })
public class SystemLog implements Serializable {

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
    // Log Classification
    // -------------------------------------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "log_level", nullable = false, length = 10)
    private SystemLogLevel logLevel;

    @Column(name = "log_type", nullable = false, length = 50)
    private String logType;

    // -------------------------------------------------------------------------
    // Request Context
    // -------------------------------------------------------------------------

    @Column(name = "http_method", length = 10)
    private String httpMethod;

    @Column(name = "endpoint", columnDefinition = "TEXT")
    private String endpoint;

    @Column(name = "status_code")
    private Integer statusCode;

    // -------------------------------------------------------------------------
    // Actor Context
    // -------------------------------------------------------------------------

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_role", length = 10)
    private String userRole;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    // -------------------------------------------------------------------------
    // Correlation
    // -------------------------------------------------------------------------

    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "trace_id")
    private UUID traceId;

    // -------------------------------------------------------------------------
    // Message & Payload
    // -------------------------------------------------------------------------

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * Flexible structured metadata (JSONB).
     * Hibernate + PostgreSQL specific.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "JSONB")
    private Object metadata;

    // -------------------------------------------------------------------------
    // Error Details
    // -------------------------------------------------------------------------

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    // -------------------------------------------------------------------------
    // Timing
    // -------------------------------------------------------------------------

    @Column(name = "execution_time_ms")
    private Integer executionTimeMs;

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    /**
     * Database-managed (DEFAULT CURRENT_TIMESTAMP).
     */
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false,
            insertable = false
    )
    private Instant createdAt;
}
