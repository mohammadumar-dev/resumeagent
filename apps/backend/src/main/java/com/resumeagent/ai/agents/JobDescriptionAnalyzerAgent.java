package com.resumeagent.ai.agents;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeagent.ai.llm.LlmClient;
import com.resumeagent.ai.util.PromptLoader;
import com.resumeagent.entity.model.JobDescriptionAnalyzerJson;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JobDescriptionAnalyzerAgent {

    private final LlmClient llm;
    private final ObjectMapper objectMapper;
    private final PromptLoader promptLoader;

    public JobDescriptionAnalyzerJson executeJobDescriptionAnalyzerAgent(String jobDescription) {
        String basePrompt = promptLoader.load("job_description_analyzer.prompt");

        String finalPrompt = basePrompt.replace(
                "{{JOB_DESCRIPTION}}",
                jobDescription
        );

        String output = llm.generate(finalPrompt);
        String json = sanitizeJson(output);

        try {
            return objectMapper.readValue(json, JobDescriptionAnalyzerJson.class);
        } catch (Exception e) {
            throw new RuntimeException(
                    "JobDescriptionAnalyzerAgent produced invalid JobDescriptionAnalyzerJson",
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
