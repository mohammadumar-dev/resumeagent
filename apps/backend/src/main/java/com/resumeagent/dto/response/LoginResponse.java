package com.resumeagent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Login response DTO
 * 
 * Returned from POST /auth/login endpoint
 * 
 * SECURITY NOTE:
 * Tokens are NOT included in response body
 * Tokens are sent via HttpOnly Secure cookies
 * This prevents JavaScript access (XSS mitigation)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    /**
     * Success message
     */
    private String message;

    /**
     * User email (for confirmation)
     */
    private String email;
}
