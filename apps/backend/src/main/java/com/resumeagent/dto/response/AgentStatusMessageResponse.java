package com.resumeagent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentStatusMessageResponse {
    private String agentName;
    private String status; // STARTED | SUCCESS | FAILED
}
