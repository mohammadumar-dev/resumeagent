package com.resumeagent.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(
        name = "resume_education",
        indexes = {
                @Index(
                        name = "idx_resume_education_resume_id",
                        columnList = "resume_id"
                ),
                @Index(
                        name = "idx_resume_education_years",
                        columnList = "end_year DESC"
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
public class ResumeEducation implements Serializable {

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
    // Education Details
    // -------------------------------------------------------------------------

    @Column(name = "degree", nullable = false, length = 150)
    private String degree;

    @Column(name = "field", length = 150)
    private String field;

    @Column(name = "institution", nullable = false, length = 200)
    private String institution;

    @Column(name = "location", length = 150)
    private String location;

    @Column(name = "start_year")
    private Integer startYear;

    @Column(name = "end_year")
    private Integer endYear;
}
