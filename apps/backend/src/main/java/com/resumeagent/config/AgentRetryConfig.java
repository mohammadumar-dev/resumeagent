package com.resumeagent.config;

import com.resumeagent.exception.TransientAgentException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;

import java.util.Map;

@Configuration
public class AgentRetryConfig {

    @Bean
    public RetryTemplate agentRetryTemplate() {
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(2000L);
        backOffPolicy.setMultiplier(2.0);
        backOffPolicy.setMaxInterval(8000L);

        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy(3, Map.of(
                TransientAgentException.class, true
        ));

        RetryTemplate retryTemplate = new RetryTemplate();
        retryTemplate.setBackOffPolicy(backOffPolicy);
        retryTemplate.setRetryPolicy(retryPolicy);
        return retryTemplate;
    }
}
