package com.resumeagent.ai.agents;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeagent.ai.llm.LlmClient;
import com.resumeagent.ai.util.PromptLoader;
import com.resumeagent.entity.model.MasterResumeJson;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ATSOptimizationAgent {

    private final LlmClient llm;
    private final ObjectMapper objectMapper;
    private final PromptLoader promptLoader;

    public MasterResumeJson executeATSOptimizationAgent(
            MasterResumeJson resumeJson
    ) throws JsonProcessingException {
        String basePrompt = promptLoader.load("ats_optimization_agent.prompt");

        String finalPrompt = basePrompt
                .replace("{{REWRITTEN_RESUME_JSON}}", objectMapper.writeValueAsString(resumeJson));

        String output = llm.generate(finalPrompt);
        String json = sanitizeJson(output);

        try {
            return objectMapper.readValue(json, MasterResumeJson.class);
        } catch (Exception e) {
            throw new RuntimeException(
                    "ATSOptimizationAgent produced invalid MasterResumeJson",
                    e
            );
        }
    }

    private String sanitizeJson(String raw) {
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start == -1 || end == -1 || end <= start) {
            throw new IllegalArgumentException("No valid JSON object found");
        }
        return raw.substring(start, end + 1);
    }
}
