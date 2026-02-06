package com.resumeagent.entity;

import com.resumeagent.entity.enums.UserPlan;
import com.resumeagent.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_users_email", columnList = "email"),
                @Index(name = "idx_users_role", columnList = "user_role"),
                @Index(name = "idx_users_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "passwordHash")
public class User implements Serializable {

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
    // Identity & Authentication
    // -------------------------------------------------------------------------

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    // -------------------------------------------------------------------------
    // Authorization & Subscription
    // -------------------------------------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false, length = 10)
    private UserRole userRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false, length = 20)
    private UserPlan plan = UserPlan.FREE;

    // -------------------------------------------------------------------------
    // Usage Limits
    // -------------------------------------------------------------------------

    @Column(name = "resume_generation_limit", nullable = false)
    private int resumeGenerationLimit = 5;

    @Column(name = "resume_generation_used", nullable = false)
    private int resumeGenerationUsed = 0;

    @Column(name = "usage_month", nullable = false)
    private LocalDate usageMonth;


    // -------------------------------------------------------------------------
    // Status Flags
    // -------------------------------------------------------------------------

    @Column(name = "is_email_active", nullable = false)
    private boolean emailActive = false;

    // -------------------------------------------------------------------------
    // Auditing
    // -------------------------------------------------------------------------

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // -------------------------------------------------------------------------
    // Lifecycle Callbacks
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
