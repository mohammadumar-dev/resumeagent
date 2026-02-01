package com.resumeagent.ai.agents;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeagent.ai.llm.LlmClient;
import com.resumeagent.entity.model.MasterResumeJson;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ResumeParserAgent {

    private final LlmClient llm;
    private final ObjectMapper mapper;

    public MasterResumeJson run(String resumeText) {
        String prompt = """
You are a STRICT resume-to-JSON compiler.

Your output is parsed by a machine.
If the JSON does NOT exactly match the schema, it will be REJECTED.

====================
TASK
====================
Convert the resume text into a JSON object that EXACTLY matches the schema below.

====================
ABSOLUTE RULES (MANDATORY)
====================
- Output ONLY valid JSON
- Do NOT include explanations, comments, or markdown
- Do NOT add or infer information
- Do NOT rename fields
- Use null for missing scalar fields
- Use [] (empty array) for missing array fields
- Dates MUST be ISO-8601 (YYYY-MM-DD)

====================
CRITICAL ARRAY RULE
====================
The following fields are ARRAYS and MUST ALWAYS be JSON ARRAYS.
NEVER output a string for these fields, even if there is only ONE item.

Array-only fields:
- header.links.other
- coreSkills.technical
- coreSkills.professional
- coreSkills.soft
- coreSkills.tools
- coreSkills.domainSpecific
- experience
- experience[].responsibilities
- experience[].achievements
- experience[].skillsUsed
- projectsOrWork
- projectsOrWork[].description
- projectsOrWork[].outcomes
- projectsOrWork[].skillsUsed
- education
- certifications
- awardsAndHonors
- awardsAndHonors[].description
- publications
- volunteerExperience
- volunteerExperience[].description
- languages
- professionalAffiliations
- additionalSections
- additionalSections[].content

If a field is listed above, it MUST be an array.
A single sentence MUST still be wrapped in an array.

====================
SCHEMA (MasterResumeJson)
====================
{
  "metadata": { "version": "string" },
  "header": {
    "fullName": "string",
    "headline": "string",
    "location": "string",
    "email": "string",
    "phone": "string",
    "links": {
      "linkedin": "string",
      "github": "string",
      "portfolio": "string",
      "website": "string",
      "other": ["string"]
    }
  },
  "summary": "string",
  "coreSkills": {
    "technical": ["string"],
    "professional": ["string"],
    "soft": ["string"],
    "tools": ["string"],
    "domainSpecific": ["string"]
  },
  "experience": [
    {
      "role": "string",
      "organization": "string",
      "location": "string",
      "employmentType": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "context": "string",
      "responsibilities": ["string"],
      "achievements": ["string"],
      "skillsUsed": ["string"]
    }
  ],
  "projectsOrWork": [
    {
      "title": "string",
      "type": "string",
      "link": "string",
      "description": ["string"],
      "outcomes": ["string"],
      "skillsUsed": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "fieldOfStudy": "string",
      "institution": "string",
      "location": "string",
      "startYear": number,
      "endYear": number,
      "gradeOrScore": "string",
      "notes": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "year": number,
      "credentialId": "string",
      "validUntil": "YYYY-MM-DD"
    }
  ],
  "awardsAndHonors": [
    {
      "title": "string",
      "issuer": "string",
      "year": number,
      "description": ["string"]
    }
  ],
  "publications": [
    {
      "title": "string",
      "platform": "string",
      "year": number,
      "url": "string"
    }
  ],
  "volunteerExperience": [
    {
      "role": "string",
      "organization": "string",
      "location": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "description": ["string"]
    }
  ],
  "languages": [
    {
      "language": "string",
      "proficiency": "string"
    }
  ],
  "professionalAffiliations": ["string"],
  "additionalSections": [
    {
      "title": "string",
      "content": ["string"]
    }
  ]
}

====================
RESUME TEXT
====================
%s
""".formatted(resumeText);


        String output = llm.generate(prompt);
        String json = sanitizeJson(output);

        try {
            System.out.println(json);
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
