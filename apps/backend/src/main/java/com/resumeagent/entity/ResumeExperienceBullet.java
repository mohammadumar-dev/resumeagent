package com.resumeagent.entity;

import com.resumeagent.entity.enums.ExperienceBulletType;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(
        name = "resume_experience_bullets",
        indexes = {
                @Index(
                        name = "idx_experience_bullets_experience_id",
                        columnList = "experience_id"
                ),
                @Index(
                        name = "idx_experience_bullets_type",
                        columnList = "bullet_type"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "experience")
public class ResumeExperienceBullet implements Serializable {

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
    @JoinColumn(name = "experience_id", nullable = false)
    private ResumeExperience experience;

    // -------------------------------------------------------------------------
    // Bullet Classification
    // -------------------------------------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "bullet_type", nullable = false, length = 50)
    private ExperienceBulletType bulletType;

    // -------------------------------------------------------------------------
    // Bullet Content
    // -------------------------------------------------------------------------

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
}
