package com.resumeagent.entity.enums;

/**
 * Execution status for agent runs.

 * Note: Values are stored in the DB as uppercase strings using EnumType.STRING.
 * The DB CHECK constraint must match these values:
 *   CHECK (status IN ('SUCCESS', 'FAILURE', 'PARTIAL'))
 */
public enum AgentExecutionStatus {
    SUCCESS,
    FAILURE,
    PARTIAL
}
