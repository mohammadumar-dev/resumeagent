package com.resumeagent.ai.agents;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeagent.ai.llm.LlmClient;
import com.resumeagent.ai.util.PromptLoader;
import com.resumeagent.entity.model.MasterResumeJson;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ResumeParserAgent {

    private final LlmClient llm;
    private final ObjectMapper mapper;
    private final PromptLoader promptLoader;

    public MasterResumeJson run(String resumeText) {
      String basePrompt = promptLoader.load("resume_parser.prompt");

        String finalPrompt = basePrompt.replace(
                "{{RESUME_TEXT}}",
                resumeText
        );

        String output = llm.generate(finalPrompt);
        String json = sanitizeJson(output);

        try {
            return mapper.readValue(json, MasterResumeJson.class);
        } catch (Exception e) {
            throw new RuntimeException(
                    "ResumeParserAgent produced invalid MasterResumeJson",
                    e
            );
        }
    }

    private String sanitizeJson(String raw) {
        String trimmed = raw.trim();

        if (trimmed.startsWith("```")) {
            trimmed = trimmed
                    .replaceFirst("^```[a-zA-Z]*", "")
                    .replaceFirst("```$", "")
                    .trim();
        }

        return trimmed;
    }
}
