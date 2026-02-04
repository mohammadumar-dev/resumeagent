package com.resumeagent.entity.model;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class JobDescriptionAnalyzerJson {

    private JobMetadata jobMetadata;
    private JobIdentity jobIdentity;
    private Location location;
    private Experience experience;
    private Requirements requirements;
    private Responsibilities responsibilities;
    private Education education;
    private Signals signals;
    private Normalization normalization;

    /* ===================== Nested Models ===================== */
    @Data
    public static class JobMetadata {
        private String jobId;
        private String sourcePlatform;
        private String sourceUrl;
        private LocalDate postingDate;
        private String language;
    }

    @Data
    public static class JobIdentity {
        private String jobTitle;
        private String companyName;
        private String roleCategory;
        private String industry;
        private String seniorityLevel;
        private String employmentType;
        private String workType;
    }

    @Data
    public static class Location {
        private String country;
        private List<String> cities;
        private String remotePolicy;
    }

    @Data
    public static class Experience {
        private int minimumYears;
        private int maximumYears;
        private List<String> experienceDomains;
    }

    @Data
    public static class Requirements {
        private Mandatory mandatory;
        private Preferred preferred;
        private Contextual contextual;
    }

    @Data
    public static class Mandatory {
        private List<String> skills;
        private List<String> tools;
        private List<String> technologies;
        private List<String> certifications;
    }

    @Data
    public static class Preferred {
        private List<String> skills;
        private List<String> tools;
        private List<String> technologies;
        private List<String> certifications;
    }

    @Data
    public static class Contextual {
        private List<String> domainTerms;
        private List<String> industryTerms;
    }

    @Data
    public static class Responsibilities {
        private List<String> core;
        private List<String> secondary;
    }

    @Data
    public static class Education {
        private String minimum;
        private List<String> preferred;
    }

    @Data
    public static class Signals {
        private List<String> seniorityIndicators;
        private List<String> leadershipIndicators;
        private List<String> complexityIndicators;
    }

    @Data
    public static class Normalization {
        private List<String> atsKeywords;
        private List<String> skillVariants;
        private List<String> roleAliases;
        private List<String> industryAliases;
    }
}
