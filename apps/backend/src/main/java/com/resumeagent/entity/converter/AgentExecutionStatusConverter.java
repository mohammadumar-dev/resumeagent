package com.resumeagent.entity.converter;

import jakarta.persistence.Converter;
import com.resumeagent.entity.enums.AgentExecutionStatus;

/**
 * AgentExecutionStatus <-> DB (uppercase string).
 * Auto-applied globally (autoApply = true).
 */
@Converter(autoApply = true)
public class AgentExecutionStatusConverter extends AbstractUppercaseEnumConverter<AgentExecutionStatus> {
    public AgentExecutionStatusConverter() {
        super(AgentExecutionStatus.class);
    }
}
