//package com.resumeagent.prompts;
//
//import org.springframework.core.io.ClassPathResource;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//import java.io.InputStream;
//import java.nio.charset.StandardCharsets;
//
//@Component
//public class PromptLoader {
//
//    public String load(String path) {
//        try (InputStream is =
//                     new ClassPathResource(path).getInputStream()) {
//
//            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
//
//        } catch (IOException e) {
//            throw new IllegalStateException("Failed to load prompt: " + path, e);
//        }
//    }
//}
//
