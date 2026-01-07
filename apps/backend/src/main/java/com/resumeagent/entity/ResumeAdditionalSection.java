package com.resumeagent.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(
        name = "resume_additional_sections",
        indexes = {
                @Index(name = "idx_resume_additional_sections_resume_id", columnList = "resume_id"),
                @Index(name = "idx_resume_additional_sections_name", columnList = "section_name")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "resume")
public class ResumeAdditionalSection implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "section_name", nullable = false, length = 100)
    private String sectionName;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
}
