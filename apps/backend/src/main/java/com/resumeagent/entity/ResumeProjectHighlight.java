package com.resumeagent.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(
        name = "resume_project_highlights",
        indexes = {
                @Index(
                        name = "idx_project_highlights_project_id",
                        columnList = "project_id"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "project")
public class ResumeProjectHighlight implements Serializable {

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
    @JoinColumn(name = "project_id", nullable = false)
    private ResumeProject project;

    // -------------------------------------------------------------------------
    // Highlight Content
    // -------------------------------------------------------------------------

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
}
