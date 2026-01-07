package com.resumeagent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(
        name = "resume_versions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_resume_version",
                        columnNames = {"resume_id", "version_number"}
                )
        },
        indexes = {
                @Index(name = "idx_resume_versions_resume_id", columnList = "resume_id"),
                @Index(
                        name = "idx_resume_versions_version",
                        columnList = "resume_id, version_number DESC"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "resume")
public class ResumeVersion implements Serializable {

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "resume_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_resume_versions_resume")
    )
    private Resume resume;

    // -------------------------------------------------------------------------
    // Versioning
    // -------------------------------------------------------------------------

    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    // -------------------------------------------------------------------------
    // Resume Snapshot (JSONB)
    // -------------------------------------------------------------------------

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "resume_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> resumeJson;

    // -------------------------------------------------------------------------
    // Source of Version
    // -------------------------------------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 50)
    private Source source;

    // -------------------------------------------------------------------------
    // Auditing
    // -------------------------------------------------------------------------

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // -------------------------------------------------------------------------
    // Lifecycle Callbacks
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    // -------------------------------------------------------------------------
    // Source Enum (must match DB CHECK constraint)
    // -------------------------------------------------------------------------

    public enum Source {
        AI,
        USER,
        IMPORT
    }
}
