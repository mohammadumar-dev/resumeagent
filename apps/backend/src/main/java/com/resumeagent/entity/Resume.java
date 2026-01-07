package com.resumeagent.entity;


import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "resumes",
        indexes = {
                @Index(name = "idx_resumes_user_id", columnList = "user_id"),
                @Index(name = "idx_resumes_created_at", columnList = "created_at"),
                @Index(name = "idx_resumes_job_title", columnList = "job_title_targeted")
        }
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Resume implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    // -------------------------------------------------------------------------
    // Primary Key
    // -------------------------------------------------------------------------

    @Id
    @GeneratedValue
    @Column(name = "id",  nullable = false, updatable = false)
    private UUID id;

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // -------------------------------------------------------------------------
    // Targeted Job Role (Title) & Company Name
    // -------------------------------------------------------------------------

    @Column(name = "job_title_targeted",  nullable = false)
    private String jobTitleTargeted;

    @Column(name = "company_targeted", nullable = false)
    private String companyTargeted;

    // -------------------------------------------------------------------------
    // Resumes Versions
    // -------------------------------------------------------------------------

    @Column(name = "current_version", nullable = false)
    private int currentVersion = 1;

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
