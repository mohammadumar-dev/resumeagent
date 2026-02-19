package com.resumeagent.dto.response;

import com.resumeagent.entity.enums.ResumeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecentActivityResponse {
    private String activity;
    private String title;
    private String company;
    private ResumeStatus status;
    private String time;
}
