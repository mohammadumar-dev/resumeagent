package com.resumeagent.dto.response;

import com.resumeagent.entity.enums.ResumeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeListItemResponse {
    private String id;
    private String jobTitle;
    private String companyName;
    private ResumeStatus status;
    private String createdAt;
    private String updatedAt;
}
