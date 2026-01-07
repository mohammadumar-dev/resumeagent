package com.resumeagent.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"user", "versions"})
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
    // Owner (User)
    // -------------------------------------------------------------------------
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_resumes_user")
    )
    private User user;

    // -------------------------------------------------------------------------
    // Targeting Information
    // -------------------------------------------------------------------------
    @Column(name = "job_title_targeted", length = 150)
    private String jobTitleTargeted;

    @Column(name = "company_targeted", length = 150)
    private String companyTargeted;

    // -------------------------------------------------------------------------
    // Version Tracking
    // -------------------------------------------------------------------------
    @Column(name = "current_version", nullable = false)
    private int currentVersion = 1;

    // -------------------------------------------------------------------------
    // Resume Versions (history)
    // -------------------------------------------------------------------------
    @OneToMany(
            mappedBy = "resume",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ResumeVersion> versions = new ArrayList<>();

    // -------------------------------------------------------------------------
    // Auditing
    // -------------------------------------------------------------------------
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // -------------------------------------------------------------------------
    // Domain Invariant (Validation only)
    // -------------------------------------------------------------------------
    /**
     * Validates that a given version number does not already exist
     * for this resume. Object creation and persistence must be handled
     * by the service layer.
     */
    public void validateVersionUniqueness(int versionNumber) {
        boolean exists = this.versions.stream()
                .anyMatch(v -> v.getVersionNumber() == versionNumber);

        if (exists) {
            throw new IllegalStateException(
                    "Version " + versionNumber + " already exists for resume " + this.id
            );
        }
    }

    // -------------------------------------------------------------------------
    // Lifecycle Callbacks
    // -------------------------------------------------------------------------
    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.currentVersion <= 0) {
            this.currentVersion = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
