package com.resumeagent.entity.enums;

public enum ResumeGenerationStatus {
    PENDING,
    JD_ANALYZED,
    MATCHED,
    REWRITTEN,
    OPTIMIZED,
    COMPLETED,
    FAILED;

    public boolean isAtLeast(ResumeGenerationStatus other) {
        return this.ordinal() >= other.ordinal();
    }
}
