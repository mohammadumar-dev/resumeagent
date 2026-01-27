package com.resumeagent.entity;

import com.resumeagent.entity.model.MasterResumeJson;
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
        name = "master_resumes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_master_resume_per_user",
                        columnNames = {"user_id"}
                )
        },
        indexes = {
                @Index(name = "idx_master_resumes_user_id", columnList = "user_id"),
                @Index(name = "idx_master_resumes_is_active", columnList = "is_active"),
                @Index(name = "idx_master_resumes_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"user", "resumeJson"})
public class MasterResume implements Serializable {

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
    // Ownership (ONE master resume per user)
    // -------------------------------------------------------------------------

    /**
     * Each user can have only one active "master resume" in Phase 1.
     * This table enforces uniqueness with uq_master_resume_per_user.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_master_resumes_user_id")
    )
    private User user;

    // -------------------------------------------------------------------------
    // Canonical Resume JSON (source of truth for AI pipelines)
    // -------------------------------------------------------------------------

    /**
     * Canonical resume JSON used as the single source of truth for generations.
     * Stored as JSONB in PostgreSQL.
     *
     * Note:
     * - Keep this JSON normalized and stable across versions.
     * - If you later support schema versioning, add a "schema_version" field here.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "resume_json", nullable = false, columnDefinition = "jsonb")
    private MasterResumeJson resumeJson;

    // -------------------------------------------------------------------------
    // Lifecycle & State
    // -------------------------------------------------------------------------

    /**
     * Controls whether this resume is active for AI generation.
     * Phase 1 assumes one resume per user (active by default).
     */
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    // -------------------------------------------------------------------------
    // Auditing
    // -------------------------------------------------------------------------

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // -------------------------------------------------------------------------
    // Lifecycle Callbacks
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
