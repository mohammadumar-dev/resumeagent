package com.resumeagent.dto.request;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class CreateAndUpdateMasterResume {

    private Metadata metadata;
    private Header header;
    private String summary;
    private CoreSkills coreSkills;
    private List<Experience> experience;
    private List<ProjectOrWork> projectsOrWork;
    private List<Education> education;
    private List<Certification> certifications;
    private List<AwardAndHonor> awardsAndHonors;
    private List<Publication> publications;
    private List<VolunteerExperience> volunteerExperience;
    private List<Language> languages;
    private List<String> professionalAffiliations;
    private List<AdditionalSection> additionalSections;

    /* ===================== Nested DTOs ===================== */

    @Data
    public static class Metadata {
        private String version;
    }

    @Data
    public static class Header {
        private String fullName;
        private String headline;
        private String location;
        private String email;
        private String phone;
        private Links links;
    }

    @Data
    public static class Links {
        private String linkedin;
        private String github;
        private String portfolio;
        private String website;
        private List<String> other;
    }

    @Data
    public static class CoreSkills {
        private List<String> technical;
        private List<String> professional;
        private List<String> soft;
        private List<String> tools;
        private List<String> domainSpecific;
    }

    @Data
    public static class Experience {
        private String role;
        private String organization;
        private String location;
        private String employmentType;
        private Instant startDate;
        private Instant endDate;
        private String context;
        private List<String> responsibilities;
        private List<String> achievements;
        private List<String> skillsUsed;
    }

    @Data
    public static class ProjectOrWork {
        private String title;
        private String type;
        private String description;
        private List<String> outcomes;
        private List<String> skillsUsed;
        private String link;
    }

    @Data
    public static class Education {
        private String degree;
        private String fieldOfStudy;
        private String institution;
        private String location;
        private Integer startYear;
        private Integer endYear;
        private String gradeOrScore;
        private String notes;
    }

    @Data
    public static class Certification {
        private String name;
        private String issuer;
        private Integer year;
        private String credentialId;
        private Instant validUntil;
    }

    @Data
    public static class AwardAndHonor {
        private String title;
        private String issuer;
        private Integer year;
        private String description;
    }

    @Data
    public static class Publication {
        private String title;
        private String platform;
        private Integer year;
        private String url;
    }

    @Data
    public static class VolunteerExperience {
        private String role;
        private String organization;
        private String location;
        private Instant startDate;
        private Instant endDate;
        private String description;
    }

    @Data
    public static class Language {
        private String language;
        private String proficiency;
    }

    @Data
    public static class AdditionalSection {
        private String title;
        private String content;
    }
}
