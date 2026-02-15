package com.resumeagent.ai.agents;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeagent.ai.llm.LlmClient;
import com.resumeagent.ai.util.PromptLoader;
import com.resumeagent.entity.model.JobDescriptionAnalyzerJson;
import com.resumeagent.entity.model.MasterResumeJson;
import com.resumeagent.entity.model.MatchingAgentJson;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MatchingAgent {

    private final LlmClient llm;
    private final ObjectMapper objectMapper;
    private final PromptLoader promptLoader;

    public MatchingAgentJson executeMatchingAgent(MasterResumeJson resumeJson, JobDescriptionAnalyzerJson jobDescription) throws JsonProcessingException {
        String basePrompt = promptLoader.load("matching_agent.prompt");

        String finalPrompt = basePrompt
                .replace("{{RESUME_TEXT}}", objectMapper.writeValueAsString(resumeJson))
                .replace("{{JOB_DESCRIPTION}}", objectMapper.writeValueAsString(jobDescription));

        String output = llm.generate(finalPrompt);
        String json = sanitizeJson(output);

        try {
            return objectMapper.readValue(json, MatchingAgentJson.class);
        } catch (Exception e) {
            throw new RuntimeException(
                    "MatchingAgent produced invalid MatchingAgentJson",
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
