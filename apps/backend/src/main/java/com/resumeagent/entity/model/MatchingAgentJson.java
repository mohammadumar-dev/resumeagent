package com.resumeagent.entity.model;

import lombok.Data;

import java.util.List;

@Data
public class MatchingAgentJson {

    private MatchSummary matchSummary;
    private SkillAlignment skillAlignment;
    private ExperienceAlignment experienceAlignment;
    private ProjectRelevance projectRelevance;
    private GapAnalysis gapAnalysis;
    private PriorityEmphasis priorityEmphasis;
    private ContextualEnhancementSuggestions contextualEnhancementSuggestions;
    private ConstraintsAndValidation constraintsAndValidation;

    // -------------------- Match Summary --------------------
    @Data
    public static class MatchSummary {
        private double overallMatchScore;
        private String confidenceLevel;
        private String summaryReason;
    }

    // -------------------- Skill Alignment --------------------
    @Data
    public static class SkillAlignment {
        private List<StrongMatch> strongMatches;
        private List<PartialMatch> partialMatches;
        private List<MissingButRelated> missingButRelated;
    }

    @Data
    public static class StrongMatch {
        private String resumeSkill;
        private String jobRequirement;
        private String matchType;
        private String evidenceSource;
        private double relevanceScore;
    }

    @Data
    public static class PartialMatch {
        private String resumeSkill;
        private String jobRequirement;
        private String relationship;
        private String evidenceSource;
        private double relevanceScore;
    }

    @Data
    public static class MissingButRelated {
        private String jobRequirement;
        private List<String> relatedResumeSkills;
        private String reasoning;
        private String gapSeverity;
    }

    // -------------------- Experience Alignment --------------------
    @Data
    public static class ExperienceAlignment {
        private double roleRelevanceScore;
        private List<MatchedResponsibility> matchedResponsibilities;
        private List<PartialResponsibility> partialResponsibilities;
    }

    @Data
    public static class MatchedResponsibility {
        private String jobResponsibility;
        private String resumeEvidence;
        private String matchStrength;
    }

    @Data
    public static class PartialResponsibility {
        private String jobResponsibility;
        private String resumeEvidence;
        private String matchStrength;
    }

    // -------------------- Project Relevance --------------------
    @Data
    public static class ProjectRelevance {
        private double overallProjectScore;
        private List<RelevantProject> relevantProjects;
    }

    @Data
    public static class RelevantProject {
        private String projectTitle;
        private String relevanceReason;
        private List<String> applicableJobExpectations;
        private double relevanceScore;
    }

    // -------------------- Gap Analysis --------------------
    @Data
    public static class GapAnalysis {
        private List<CriticalGap> criticalGaps;
        private List<NonCriticalGap> nonCriticalGaps;
    }

    @Data
    public static class CriticalGap {
        private String missingSkill;
        private String impact;
        private String severity;
    }

    @Data
    public static class NonCriticalGap {
        private String missingSkill;
        private String impact;
        private String severity;
    }

    // -------------------- Priority Emphasis --------------------
    @Data
    public static class PriorityEmphasis {
        private List<String> skillsToEmphasize;
        private List<String> experienceSectionsToHighlight;
        private List<String> projectsToHighlight;
    }

    // -------------------- Contextual Enhancement --------------------
    @Data
    public static class ContextualEnhancementSuggestions {
        private List<TerminologyAlignment> terminologyAlignment;
        private List<String> skillVariantsToInclude;
    }

    @Data
    public static class TerminologyAlignment {
        private String resumeTerm;
        private String jobPreferredTerm;
    }

    // -------------------- Constraints & Validation --------------------
    @Data
    public static class ConstraintsAndValidation {
        private boolean resumeDataOnly;
        private boolean noFabricatedSkills;
        private boolean semanticMatchesExplainable;
    }
}
