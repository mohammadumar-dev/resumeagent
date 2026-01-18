//package com.resumeagent.config;
//
//import org.springframework.ai.chat.client.ChatClient;
//import org.springframework.ai.openai.OpenAiChatOptions;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//import java.util.Map;
//
//@Configuration
//public class AiConfig {
//    @Bean
//    ChatClient chatClient(ChatClient.Builder builder) {
//        return builder
//                .defaultOptions(OpenAiChatOptions.builder().httpHeaders(Map.of(
//                                        "HTTP-Referer", "http://localhost",
//                                        "X-Title", "ResumeAgent"
//                                ))
//                                .build()
//                )
//                .build();
//    }
//}
