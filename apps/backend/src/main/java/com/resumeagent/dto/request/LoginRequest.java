package com.resumeagent.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Login request DTO
 * 
 * Used for POST /auth/login endpoint
 * Contains user credentials for authentication
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /**
     * User email address (used as username)
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    /**
     * User password (plaintext, will be compared with hashed password)
     * 
     * SECURITY NOTE:
     * Password is transmitted in HTTPS POST body
     * Never logged or stored in plaintext
     * Immediately compared with BCrypt hash then discarded
     */
    @NotBlank(message = "Password is required")
    private String password;
}
