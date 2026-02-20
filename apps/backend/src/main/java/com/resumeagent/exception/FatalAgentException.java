package com.resumeagent.exception;

public class FatalAgentException extends RuntimeException {
    public FatalAgentException(String message) {
        super(message);
    }

    public FatalAgentException(String message, Throwable cause) {
        super(message, cause);
    }
}
