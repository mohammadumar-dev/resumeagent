package com.resumeagent.dto.response;

import com.resumeagent.entity.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * User information response DTO
 * 
 * Returned from GET /auth/me endpoint
 * Contains current user details
 * 
 * SECURITY NOTE:
 * Does NOT include:
 * - Password hash
 * - Refresh tokens
 * - Sensitive internal data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {

    /**
     * User ID
     */
    private UUID id;

    /**
     * User email address
     */
    private String email;

    /**
     * User full name
     */
    private String fullName;

    /**
     * User role (USER or ADMIN)
     */
    private UserRole role;

    /**
     * Email verification status
     */
    private boolean emailActive;

    /**
     * User plan type
     */
    private String plan;

    /**
     * Resume generation usage stats
     */
    private int resumeGenerationLimit;
    private int resumeGenerationUsed;
}
