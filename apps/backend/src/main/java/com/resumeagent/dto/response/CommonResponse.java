package com.resumeagent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Common response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommonResponse {

    /**
     * Success message
     */
    private String message;

    /**
     * User / Admin email (for confirmation)
     */
    private String email;
}
