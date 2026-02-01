package com.resumeagent.ai.llm;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LlmClient {

    private final ChatClient openAiChatClient;

    public String generate(String prompt) {
        return openAiChatClient
                .prompt(prompt)
                .call()
                .content();
    }
}

