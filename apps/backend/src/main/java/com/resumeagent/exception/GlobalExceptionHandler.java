package com.resumeagent.exception;

import com.resumeagent.dto.response.CommonResponse;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<CommonResponse> handleDuplicateResource(DuplicateResourceException ex) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    @ExceptionHandler(ValueNotFoundException.class)
    public ResponseEntity<CommonResponse> handleValueNotFound(ValueNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler({ValidationException.class, ConstraintViolationException.class})
    public ResponseEntity<CommonResponse> handleValidation(Exception ex) {
        if (ex instanceof ConstraintViolationException cve) {
            Map<String, List<String>> errors = new LinkedHashMap<>();
            cve.getConstraintViolations().forEach(v -> {
                String key = v.getPropertyPath() == null ? "request" : v.getPropertyPath().toString();
                errors.computeIfAbsent(key, __ -> new ArrayList<>()).add(v.getMessage());
            });
            return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed", errors);
        }

        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, List<String>> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String field = error.getField() == null || error.getField().isBlank()
                    ? "request"
                    : error.getField();
            String message = error.getDefaultMessage() == null || error.getDefaultMessage().isBlank()
                    ? "Invalid value"
                    : error.getDefaultMessage();
            errors.computeIfAbsent(field, __ -> new ArrayList<>()).add(message);
        });

        String message = errors.values().stream()
                .flatMap(List::stream)
                .findFirst()
                .orElse("Validation failed");

        return buildResponse(HttpStatus.BAD_REQUEST, message, errors);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<CommonResponse> handleArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String name = ex.getName() == null ? "parameter" : ex.getName();
        return buildResponse(HttpStatus.BAD_REQUEST, "Invalid value for " + name, null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponse> handleUnreadableMessage(HttpMessageNotReadableException ex) {
        String message = Optional.ofNullable(ex.getMostSpecificCause())
                .map(Throwable::getMessage)
                .filter(msg -> msg != null && !msg.isBlank())
                .orElse("Malformed request body");
        return buildResponse(HttpStatus.BAD_REQUEST, message, null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<CommonResponse> handleBadCredentials(BadCredentialsException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid credentials", null);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<CommonResponse> handleUsernameNotFound(UsernameNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<CommonResponse> handleAccessDenied(AccessDeniedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "Forbidden", null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<CommonResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return buildResponse(HttpStatus.CONFLICT, "Conflict", null);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<CommonResponse> handleIllegalState(Exception ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    @ExceptionHandler({TransientAgentException.class, FatalAgentException.class})
    public ResponseEntity<CommonResponse> handleAgentFailures(RuntimeException ex) {
        log.error("Agent failure", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonResponse> handleUnhandled(Exception ex) {
        log.error("Unhandled exception", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", null);
    }

    private ResponseEntity<CommonResponse> buildResponse(
            HttpStatus status,
            String message,
            Map<String, List<String>> errors
    ) {
        String resolvedMessage = (message == null || message.isBlank())
                ? "Unexpected error occurred"
                : message;
        CommonResponse body = CommonResponse.builder()
                .message(resolvedMessage)
                .status(status.value())
                .errors(errors == null || errors.isEmpty() ? null : errors)
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
