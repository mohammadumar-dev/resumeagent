package com.resumeagent.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserListItemResponse {

    private String id;

    @JsonProperty("full_name")
    private String fullName;

    private String email;

    private String plan;

    private String role;

    @JsonProperty("resume_generation_limit")
    private int resumeGenerationLimit;

    @JsonProperty("resume_generation_used")
    private int resumeGenerationUsed;

    @JsonProperty("is_email_active")
    private boolean emailActive;

    @JsonProperty("created_at")
    private String createdAt;
}
