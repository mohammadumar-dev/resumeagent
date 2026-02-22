package com.resumeagent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Common response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommonResponse {

    /**
     * Human-friendly message (success or error).
     */
    private String message;

    /**
     * User / Admin email (for confirmation)
     */
    private String email;

    /**
     * HTTP status code (only set for error responses).
     */
    private Integer status;

    /**
     * Field-level validation errors (only set when applicable).
     */
    private Map<String, List<String>> errors;
}
