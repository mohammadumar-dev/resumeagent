package com.resumeagent.exception;

public class TransientAgentException extends RuntimeException {
    public TransientAgentException(String message) {
        super(message);
    }

    public TransientAgentException(String message, Throwable cause) {
        super(message, cause);
    }
}
