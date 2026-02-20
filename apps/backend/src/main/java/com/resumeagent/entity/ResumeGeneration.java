package com.resumeagent.entity;

import com.resumeagent.entity.enums.ResumeGenerationStatus;
import com.resumeagent.entity.model.JobDescriptionAnalyzerJson;
import com.resumeagent.entity.model.MasterResumeJson;
import com.resumeagent.entity.model.MatchingAgentJson;
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
        name = "resume_generations",
        indexes = {
                @Index(name = "idx_resume_generations_user_id", columnList = "user_id"),
                @Index(name = "idx_resume_generations_status", columnList = "status"),
                @Index(name = "idx_resume_generations_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"user", "masterResume", "jobDescription"})
public class ResumeGeneration implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_resume_generations_user_id")
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "master_resume_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_resume_generations_master_resume_id")
    )
    private MasterResume masterResume;

    @Column(name = "job_description", nullable = false, columnDefinition = "text")
    private String jobDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ResumeGenerationStatus status = ResumeGenerationStatus.PENDING;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "jd_analyzed_json", columnDefinition = "jsonb")
    private JobDescriptionAnalyzerJson jobDescriptionAnalyzerJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "matching_json", columnDefinition = "jsonb")
    private MatchingAgentJson matchingAgentJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rewritten_resume_json", columnDefinition = "jsonb")
    private MasterResumeJson rewrittenResumeJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "optimized_resume_json", columnDefinition = "jsonb")
    private MasterResumeJson optimizedResumeJson;

    @Column(name = "job_title_targeted", length = 150)
    private String jobTitleTargeted;

    @Column(name = "company_targeted", length = 150)
    private String companyTargeted;

    @Column(name = "failure_reason", columnDefinition = "text")
    private String failureReason;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", foreignKey = @ForeignKey(name = "fk_resume_generations_resume_id"))
    private Resume resume;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = ResumeGenerationStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
