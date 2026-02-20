package com.resumeagent.ai.llm;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LlmClient {

    private final ChatClient chatClient;

    // Ordered by preference
    private static final List<String> FREE_MODELS = List.of(
            "upstage/solar-pro-3:free",
            "openrouter/free",
            "nvidia/nemotron-3-nano-30b-a3b:free",
            "arcee-ai/trinity-large-preview:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "stepfun/step-3.5-flash:free",
            "z-ai/glm-4.5-air:free",
            "upstage/solar-pro-3:free",
            "openai/gpt-oss-120b:free",
            "tngtech/deepseek-r1t2-chimera:free",
            "openai/gpt-oss-20b:free",
            "deepseek/deepseek-r1-0528:free",
            "arcee-ai/trinity-mini:free",
            "nvidia/nemotron-nano-9b-v2:free",
            "nvidia/nemotron-nano-12b-v2-vl:free",
            "qwen/qwen3-next-80b-a3b-instruct:free",
            "google/gemma-3-27b-it:free",
            "liquid/lfm-2.5-1.2b-instruct:free",
            "liquid/lfm-2.5-1.2b-thinking:free",
            "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
            "mistralai/mistral-small-3.1-24b-instruct:free",
            "nousresearch/hermes-3-llama-3.1-405b:free",
            "google/gemma-3n-e2b-it:free",
            "qwen/qwen3-4b:free",
            "google/gemma-3-4b-it:free",
            "google/gemma-3-12b-it:free",
            "meta-llama/llama-3.2-3b-instruct:free",
            "google/gemma-3n-e4b-it:free"
    );


    public String generate(String prompt) {

        RuntimeException lastException = null;

        for (String model : FREE_MODELS) {
            try {
                return chatClient
                        .prompt(prompt)
                        .options(OpenAiChatOptions.builder()
                                .model(model)
                                .temperature(0.4)
                                .maxTokens(12000)
                                .build())
                        .call()
                        .content();

            } catch (Exception ex) {
                lastException = new RuntimeException(
                        "Model failed: " + model + " -> " + ex.getMessage(), ex
                );
            }
        }

        throw new RuntimeException("All fallback models failed", lastException);
    }
}
