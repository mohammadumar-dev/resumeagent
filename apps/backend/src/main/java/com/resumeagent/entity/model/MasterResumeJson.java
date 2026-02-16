package com.resumeagent.entity.model;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class MasterResumeJson {

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

    /* ===================== Nested Models ===================== */

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

    /* ===================== Experience ===================== */

    @Data
    public static class Experience {
        private String role;
        private String organization;
        private String location;
        private String employmentType;

        private LocalDate startDate;
        private LocalDate endDate;

        private List<String> responsibilities;
        private String context;
        private List<String> achievements;
        private List<String> skillsUsed;
    }

    /* ===================== Projects ===================== */

    @Data
    public static class ProjectOrWork {
        private String title;
        private String type; // project | freelance | open-source
        private String link;

        private List<String> description;
        private List<String> outcomes;
        private List<String> skillsUsed;
    }

    /* ===================== Education ===================== */

    @Data
    public static class Education {
        private String degree;
        private String fieldOfStudy;
        private String institution;
        private String location;

        private LocalDate startDate;
        private LocalDate endDate;

        private String gradeOrScore; // CGPA / Percentage
        private List<String> focusAreas;
    }

    /* ===================== Certifications ===================== */

    @Data
    public static class Certification {
        private String name;
        private String issuer;
        private Integer year;
        private String credentialId;
        private LocalDate validUntil;
    }

    /* ===================== Awards ===================== */

    @Data
    public static class AwardAndHonor {
        private String title;
        private String issuer;
        private Integer year;
        private List<String> description;
    }

    /* ===================== Publications ===================== */

    @Data
    public static class Publication {
        private String title;
        private String publisher;
        private Integer year;
        private String url;
    }

    /* ===================== Volunteering ===================== */

    @Data
    public static class VolunteerExperience {
        private String role;
        private String organization;
        private String location;

        private LocalDate startDate;
        private LocalDate endDate;

        private List<String> description;
    }

    /* ===================== Languages ===================== */

    @Data
    public static class Language {
        private String language;
        private String proficiency;
    }

    /* ===================== Custom Sections ===================== */

    @Data
    public static class AdditionalSection {
        private String title;
        private List<String> content;
    }
}
