package com.resumeagent.ai.orchestration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.resumeagent.ai.util.TokenCounter;
import com.resumeagent.entity.Resume;
import com.resumeagent.entity.ResumeAgentLog;
import com.resumeagent.entity.User;
import com.resumeagent.entity.enums.AgentExecutionStatus;
import com.resumeagent.exception.FatalAgentException;
import com.resumeagent.exception.TransientAgentException;
import com.resumeagent.repository.ResumeAgentLogRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.http.HttpStatusCode;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import javax.net.ssl.SSLException;
import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.time.Duration;
import java.util.concurrent.TimeoutException;

@Component
@RequiredArgsConstructor
public class AgentExecutor {

    private static final int MAX_INPUT_SNAPSHOT_CHARS = 2000;

    private final RetryTemplate agentRetryTemplate;
    private final ResumeAgentLogRepository resumeAgentLogRepository;
    private final PlatformTransactionManager transactionManager;

    public <T> T execute(AgentExecutionRequest<T> request) {
        return agentRetryTemplate.execute(context -> {
            int attempt = context.getRetryCount() + 1;
            long start = System.nanoTime();
            try {
                T result = request.getAction().call();
                int tokensOutput = countOutputTokens(request, result);
                saveAgentLog(request, attempt, AgentExecutionStatus.SUCCESS, null, tokensOutput, start);
                return result;
            } catch (Exception ex) {
                RuntimeException classified = classifyException(ex, request.getAgentName());
                saveAgentLog(request, attempt, AgentExecutionStatus.FAILURE, classified.getMessage(), 0, start);
                throw classified;
            }
        });
    }

    private <T> int countOutputTokens(AgentExecutionRequest<T> request, T result) throws JsonProcessingException {
        if (request.getOutputSerializer() == null) {
            return 0;
        }
        String serialized = request.getOutputSerializer().serialize(result);
        return TokenCounter.countTokens(serialized);
    }

    private ResumeAgentLog saveAgentLog(
            AgentExecutionRequest<?> request,
            int attempt,
            AgentExecutionStatus status,
            String errorMessage,
            int tokensOutput,
            long startNanoTime
    ) {
        long elapsedMs = Duration.ofNanos(System.nanoTime() - startNanoTime).toMillis();
        int executionTimeMs = elapsedMs > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) elapsedMs;

        ResumeAgentLog agentLog = ResumeAgentLog.builder()
                .agentName(request.getAgentName())
                .user(request.getUser())
                .resume(request.getResume())
                .status(status)
                .attemptNumber(attempt)
                .executionTimeMs(executionTimeMs)
                .errorMessage(errorMessage)
                .tokensInput(request.getTokensInput())
                .tokensOutput(tokensOutput)
                .inputSnapshot(truncate(request.getInputSnapshot()))
                .build();

        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        ResumeAgentLog saved = transactionTemplate.execute(statusTx -> resumeAgentLogRepository.save(agentLog));
        return saved == null ? agentLog : saved;
    }

    private String truncate(String value) {
        if (value == null) {
            return null;
        }
        if (value.length() <= MAX_INPUT_SNAPSHOT_CHARS) {
            return value;
        }
        return value.substring(0, MAX_INPUT_SNAPSHOT_CHARS);
    }

    private RuntimeException classifyException(Exception ex, String agentName) {
        if (ex instanceof TransientAgentException || ex instanceof FatalAgentException) {
            return (RuntimeException) ex;
        }
        if (ex instanceof JsonProcessingException) {
            return new FatalAgentException("Agent output serialization failed: " + agentName, ex);
        }
        if (isTransient(ex)) {
            return new TransientAgentException("Transient agent failure: " + agentName, ex);
        }
        return new FatalAgentException("Fatal agent failure: " + agentName, ex);
    }

    private boolean isTransient(Throwable ex) {
        if (hasCause(ex, SocketTimeoutException.class)
                || hasCause(ex, TimeoutException.class)
                || hasCause(ex, ConnectException.class)
                || hasCause(ex, UnknownHostException.class)
                || hasCause(ex, SSLException.class)
                || hasCause(ex, ResourceAccessException.class)
                || hasCause(ex, IOException.class)
                || hasCause(ex, TransientDataAccessException.class)) {
            return true;
        }

        HttpStatusCode status = extractHttpStatus(ex);
        if (status == null) {
            return false;
        }
        int code = status.value();
        return code == 429
                || code == 503
                || code == 502
                || code == 504
                || status.is5xxServerError();
    }

    private HttpStatusCode extractHttpStatus(Throwable ex) {
        if (ex instanceof HttpStatusCodeException httpEx) {
            return httpEx.getStatusCode();
        }
        if (ex instanceof WebClientResponseException webEx) {
            return webEx.getStatusCode();
        }
        return null;
    }

    private boolean hasCause(Throwable ex, Class<? extends Throwable> type) {
        Throwable current = ex;
        while (current != null) {
            if (type.isInstance(current)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    @Getter
    @Builder
    public static class AgentExecutionRequest<T> {
        private final String agentName;
        private final User user;
        private final Resume resume;
        private final int tokensInput;
        private final String inputSnapshot;
        private final AgentCall<T> action;
        private final AgentOutputSerializer<T> outputSerializer;
    }

    @FunctionalInterface
    public interface AgentCall<T> {
        T call() throws Exception;
    }

    @FunctionalInterface
    public interface AgentOutputSerializer<T> {
        String serialize(T output) throws JsonProcessingException;
    }
}
