package com.resumeagent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "resume_metadata")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "resumeId")
@ToString(exclude = "resume")
public class ResumeMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    // Primary key is resume_id (same PK as resumes.id)
    @Id
    @Column(name = "resume_id", nullable = false, updatable = false)
    private UUID resumeId;

    // Owning association to Resume; mapsId to use same PK
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(
            name = "resume_id",
            foreignKey = @ForeignKey(name = "fk_resume_metadata_resume")
    )
    private Resume resume;

    @Column(name = "generated_at")
    private Instant generatedAt;

    @Column(name = "language", length = 20)
    private String language = "en";

    @Column(name = "ats_optimized")
    private Boolean atsOptimized = Boolean.TRUE;

    // PostgreSQL text[] mapping (Hibernate 6 native)
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "ai_models_used", columnDefinition = "text[]")
    private String[] aiModelsUsed;

    @Column(name = "pipeline_version", length = 20)
    private String pipelineVersion;
}
