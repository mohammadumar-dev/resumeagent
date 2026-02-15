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
public class ResumeRewriteAgent {

    private final LlmClient llm;
    private final ObjectMapper objectMapper;
    private final PromptLoader promptLoader;

    public MasterResumeJson executeResumeRewriteAgent(
            MasterResumeJson resumeText, JobDescriptionAnalyzerJson jobDescription, MatchingAgentJson matchingAgentJson
    ) throws JsonProcessingException {
        String basePrompt = promptLoader.load("resume_rewrite_agent.prompt");

        String finalPrompt = basePrompt
                .replace("{{MASTER_RESUME_JSON}}", objectMapper.writeValueAsString(resumeText))
                .replace("{{JOB_DESCRIPTION_ANALYSIS_JSON}}", objectMapper.writeValueAsString(jobDescription))
                .replace("{{MATCHING_AGENT_JSON}}", objectMapper.writeValueAsString(matchingAgentJson));

        String output = llm.generate(finalPrompt);
        String json = sanitizeJson(output);

        try {
            return objectMapper.readValue(json, MasterResumeJson.class);
        } catch (Exception e) {
            throw new RuntimeException(
                    "ResumeRewriteAgent produced invalid ResumeRewriteAgent",
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
