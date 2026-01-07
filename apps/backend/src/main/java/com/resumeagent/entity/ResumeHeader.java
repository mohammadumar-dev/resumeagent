package com.resumeagent.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(
        name = "resume_header",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_resume_header",
                        columnNames = "resume_id"
                )
        },
        indexes = {
                @Index(name = "idx_resume_header_resume_id", columnList = "resume_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "resume")
public class ResumeHeader implements Serializable {

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
    // Contact Information
    // -------------------------------------------------------------------------

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "location", length = 150)
    private String location;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    // -------------------------------------------------------------------------
    // Professional Summary & Links
    // -------------------------------------------------------------------------

    @Column(name = "headline", length = 200)
    private String headline;

    @Column(name = "linkedin", columnDefinition = "TEXT")
    private String linkedin;

    @Column(name = "github", columnDefinition = "TEXT")
    private String github;

    @Column(name = "portfolio", columnDefinition = "TEXT")
    private String portfolio;
}
