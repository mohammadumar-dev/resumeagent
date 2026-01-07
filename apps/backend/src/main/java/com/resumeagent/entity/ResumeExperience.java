package com.resumeagent.entity;

import com.resumeagent.entity.enums.EmploymentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "resume_experience",
        indexes = {
                @Index(name = "idx_resume_experience_resume_id", columnList = "resume_id"),
                @Index(
                        name = "idx_resume_experience_dates",
                        columnList = "start_date DESC, end_date DESC"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "resume")
public class ResumeExperience implements Serializable {

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
    // Role & Company Information
    // -------------------------------------------------------------------------

    @Column(name = "role", nullable = false, length = 150)
    private String role;

    @Column(name = "company", nullable = false, length = 150)
    private String company;

    @Column(name = "location", length = 150)
    private String location;

    // -------------------------------------------------------------------------
    // Employment Details
    // -------------------------------------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 50)
    private EmploymentType employmentType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // -------------------------------------------------------------------------
    // Technologies Used
    // -------------------------------------------------------------------------

    /**
     * PostgreSQL TEXT[] mapping.
     * Requires Hibernate.
     */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "technologies", columnDefinition = "TEXT[]")
    private String[] technologies;

}
