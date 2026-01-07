package com.resumeagent.entity;

import com.resumeagent.entity.enums.SkillCategory;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(
        name = "resume_skills",
        indexes = {
                @Index(name = "idx_resume_skills_resume_id", columnList = "resume_id"),
                @Index(name = "idx_resume_skills_category", columnList = "category"),
                @Index(name = "idx_resume_skills_skill", columnList = "skill")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "resume")
public class ResumeSkill implements Serializable {

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
    // Skill Classification
    // -------------------------------------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private SkillCategory category;

    @Column(name = "skill", nullable = false, length = 100)
    private String skill;
}
