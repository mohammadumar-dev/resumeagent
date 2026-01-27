package com.resumeagent.dto.response;

import com.resumeagent.entity.model.MasterResumeJson;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterResumeResponse {

    private MasterResumeJson resumeJson;
}
