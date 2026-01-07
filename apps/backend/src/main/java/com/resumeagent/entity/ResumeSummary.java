package com.resumeagent.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(
        name = "resume_summary",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_resume_summary",
                        columnNames = "resume_id"
                )
        },
        indexes = {
                @Index(name = "idx_resume_summary_resume_id", columnList = "resume_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "resume")
public class ResumeSummary implements Serializable {

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
     * One-to-one relationship with Resume.
     * Enforced at DB level via UNIQUE (resume_id).
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false, unique = true)
    private Resume resume;

    // -------------------------------------------------------------------------
    // Summary Content
    // -------------------------------------------------------------------------

    @Column(name = "summary_text", nullable = false, columnDefinition = "TEXT")
    private String summaryText;
}
