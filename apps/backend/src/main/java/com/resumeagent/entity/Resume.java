package com.resumeagent.entity;

import com.resumeagent.entity.enums.ResumeStatus;
import com.resumeagent.entity.model.JobDescriptionAnalyzerJson;
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
        name = "resumes",
        indexes = {
                @Index(name = "idx_resumes_user_id", columnList = "user_id"),
                @Index(name = "idx_resumes_master_resume_id", columnList = "master_resume_id"),
                @Index(name = "idx_resumes_status", columnList = "status"),
                @Index(name = "idx_resumes_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"user", "masterResume"})
public class Resume implements Serializable {

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
    // Ownership
    // -------------------------------------------------------------------------

    /**
     * Owner of this generated/targeted resume.
     * If user is deleted, resumes are deleted via DB cascade.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_resumes_user_id")
    )
    private User user;

    // -------------------------------------------------------------------------
    // Master Resume Reference (Source of Truth)
    // -------------------------------------------------------------------------

    /**
     * Reference to the master resume used as source for this resume generation.
     * ON DELETE RESTRICT prevents deleting master resume if resumes depend on it.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "master_resume_id",
            nullable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_resumes_master_resume_id")
    )
    private MasterResume masterResume;

    // -------------------------------------------------------------------------
    // Targeting Metadata
    // -------------------------------------------------------------------------

    /**
     * Optional targeted job title (e.g., "Backend Developer").
     */
    @Column(name = "job_title_targeted", length = 150)
    private String jobTitleTargeted;

    /**
     * Analyzed job description JSON from JobDescriptionAnalyzerAgent.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "analyzed_job_description", nullable = false, columnDefinition = "jsonb")
    private JobDescriptionAnalyzerJson jobDescriptionAnalyzerJson;

    /**
     * Optional targeted company name (e.g., "Google", "Amazon").
     */
    @Column(name = "company_targeted", length = 150)
    private String companyTargeted;


    // -------------------------------------------------------------------------
    // Generated Resume JSON
    // -------------------------------------------------------------------------

    /**
     * The final resume JSON generated for this targeted resume.
     * Stored as JSONB in PostgreSQL.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "resume_json", nullable = false, columnDefinition = "jsonb")
    private MasterResumeJson resumeJson;

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------

    /**
     * Lifecycle status of the generated resume.
     * ACTIVE   -> currently usable
     * ARCHIVED -> saved but not active
     * DELETED  -> soft deleted (kept for audit/history)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ResumeStatus status = ResumeStatus.ACTIVE;

    // -------------------------------------------------------------------------
    // Auditing
    // -------------------------------------------------------------------------

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // -------------------------------------------------------------------------
    // Lifecycle Hooks
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
