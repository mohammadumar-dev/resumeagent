package com.resumeagent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(
        name = "resume_projects",
        indexes = {
                @Index(name = "idx_resume_projects_resume_id", columnList = "resume_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "resume")
public class ResumeProject implements Serializable {

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
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    // -------------------------------------------------------------------------
    // Project Details
    // -------------------------------------------------------------------------

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "type", length = 100)
    private String type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // -------------------------------------------------------------------------
    // Technologies Used (PostgreSQL TEXT[])
    // -------------------------------------------------------------------------

    /**
     * PostgreSQL TEXT[] mapping.
     * Hibernate-specific.
     */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "technologies", columnDefinition = "TEXT[]")
    private String[] technologies;
}
