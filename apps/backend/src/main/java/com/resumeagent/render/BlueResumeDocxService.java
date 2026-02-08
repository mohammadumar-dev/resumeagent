package com.resumeagent.render;

import com.resumeagent.entity.model.MasterResumeJson;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSectPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPageMar;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service to generate DOCX resume files from MasterResumeJson data.
 * Uses Apache POI to create professional single-page resumes.
 */
@Service
public class BlueResumeDocxService {

    private static final String TEMPLATE_PATH = "templates/resume/resume_template.docx";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy");

    /**
     * Generates a DOCX resume document from the provided resume JSON data.
     *
     * @param resumeJson The resume data to populate the document with
     * @return ByteArrayOutputStream containing the generated DOCX file
     * @throws IOException If template loading or document generation fails
     */
    public ByteArrayOutputStream generateResume(MasterResumeJson resumeJson) throws IOException {
        try (XWPFDocument document = createDocument()) {
            buildResumeDocument(document, resumeJson);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.write(outputStream);
            return outputStream;
        }
    }

    /**
     * Creates a new DOCX document or loads from template if available.
     */
    private XWPFDocument createDocument() throws IOException {
        try {
            ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
            if (resource.exists()) {
                try (InputStream templateStream = resource.getInputStream()) {
                    return new XWPFDocument(templateStream);
                }
            }
        } catch (Exception e) {
            // Template not found, create new document
        }
        return createNewDocument();
    }

    /**
     * Creates a new document with proper page margins for single-page layout.
     */
    private XWPFDocument createNewDocument() {
        XWPFDocument document = new XWPFDocument();

        // Set narrow margins for single-page layout (0.5 inch = 720 twips)
        CTSectPr sectPr = document.getDocument().getBody().addNewSectPr();
        CTPageMar pageMar = sectPr.addNewPgMar();
        pageMar.setTop(BigInteger.valueOf(720));
        pageMar.setBottom(BigInteger.valueOf(720));
        pageMar.setLeft(BigInteger.valueOf(720));
        pageMar.setRight(BigInteger.valueOf(720));

        return document;
    }

    /**
     * Builds the complete resume document with all sections.
     */
    private void buildResumeDocument(XWPFDocument document, MasterResumeJson resumeJson) {
        // Clear existing content if using template
        while (document.getParagraphs().size() > 0) {
            document.removeBodyElement(0);
        }

        addHeader(document, resumeJson.getHeader());
        addSummary(document, resumeJson.getSummary());
        addSkills(document, resumeJson.getCoreSkills());
        addExperience(document, resumeJson.getExperience());
        addEducation(document, resumeJson.getEducation());
        addCertifications(document, resumeJson.getCertifications());
        addProjects(document, resumeJson.getProjectsOrWork());
    }

    /**
     * Adds the header section with name, contact info, and links.
     */
    private void addHeader(XWPFDocument document, MasterResumeJson.Header header) {
        if (header == null)
            return;

        // Full Name - Large, Bold, Centered
        XWPFParagraph namePara = document.createParagraph();
        namePara.setAlignment(ParagraphAlignment.CENTER);
        namePara.setSpacingAfter(0);
        XWPFRun nameRun = namePara.createRun();
        nameRun.setText(nullSafe(header.getFullName()));
        nameRun.setBold(true);
        nameRun.setFontSize(18);
        nameRun.setFontFamily("Calibri");

        // Headline
        if (header.getHeadline() != null && !header.getHeadline().isBlank()) {
            XWPFParagraph headlinePara = document.createParagraph();
            headlinePara.setAlignment(ParagraphAlignment.CENTER);
            headlinePara.setSpacingAfter(0);
            XWPFRun headlineRun = headlinePara.createRun();
            headlineRun.setText(header.getHeadline());
            headlineRun.setFontSize(11);
            headlineRun.setItalic(true);
            headlineRun.setFontFamily("Calibri");
        }

        // Contact Info Line
        XWPFParagraph contactPara = document.createParagraph();
        contactPara.setAlignment(ParagraphAlignment.CENTER);
        contactPara.setSpacingAfter(100);
        XWPFRun contactRun = contactPara.createRun();

        StringBuilder contactLine = new StringBuilder();
        if (header.getEmail() != null)
            contactLine.append(header.getEmail());
        if (header.getPhone() != null) {
            if (contactLine.length() > 0)
                contactLine.append(" | ");
            contactLine.append(header.getPhone());
        }
        if (header.getLocation() != null) {
            if (contactLine.length() > 0)
                contactLine.append(" | ");
            contactLine.append(header.getLocation());
        }

        // Add links
        MasterResumeJson.Links links = header.getLinks();
        if (links != null) {
            if (links.getLinkedin() != null) {
                if (contactLine.length() > 0)
                    contactLine.append(" | ");
                contactLine.append(links.getLinkedin());
            }
            if (links.getGithub() != null) {
                if (contactLine.length() > 0)
                    contactLine.append(" | ");
                contactLine.append(links.getGithub());
            }
            if (links.getPortfolio() != null) {
                if (contactLine.length() > 0)
                    contactLine.append(" | ");
                contactLine.append(links.getPortfolio());
            }
        }

        contactRun.setText(contactLine.toString());
        contactRun.setFontSize(9);
        contactRun.setFontFamily("Calibri");
    }

    /**
     * Adds the professional summary section.
     */
    private void addSummary(XWPFDocument document, String summary) {
        if (summary == null || summary.isBlank())
            return;

        addSectionTitle(document, "PROFESSIONAL SUMMARY");

        XWPFParagraph para = document.createParagraph();
        para.setSpacingAfter(100);
        XWPFRun run = para.createRun();
        run.setText(summary);
        run.setFontSize(10);
        run.setFontFamily("Calibri");
    }

    /**
     * Adds the skills section.
     */
    private void addSkills(XWPFDocument document, MasterResumeJson.CoreSkills skills) {
        if (skills == null)
            return;

        addSectionTitle(document, "SKILLS");

        StringBuilder skillsText = new StringBuilder();

        if (skills.getTechnical() != null && !skills.getTechnical().isEmpty()) {
            skillsText.append("Technical: ").append(String.join(", ", skills.getTechnical()));
        }
        if (skills.getTools() != null && !skills.getTools().isEmpty()) {
            if (skillsText.length() > 0)
                skillsText.append(" | ");
            skillsText.append("Tools: ").append(String.join(", ", skills.getTools()));
        }
        if (skills.getProfessional() != null && !skills.getProfessional().isEmpty()) {
            if (skillsText.length() > 0)
                skillsText.append(" | ");
            skillsText.append("Professional: ").append(String.join(", ", skills.getProfessional()));
        }

        if (skillsText.length() > 0) {
            XWPFParagraph para = document.createParagraph();
            para.setSpacingAfter(100);
            XWPFRun run = para.createRun();
            run.setText(skillsText.toString());
            run.setFontSize(10);
            run.setFontFamily("Calibri");
        }
    }

    /**
     * Adds the work experience section.
     */
    private void addExperience(XWPFDocument document, List<MasterResumeJson.Experience> experiences) {
        if (experiences == null || experiences.isEmpty())
            return;

        addSectionTitle(document, "EXPERIENCE");

        for (MasterResumeJson.Experience exp : experiences) {
            // Role and Company
            XWPFParagraph titlePara = document.createParagraph();
            titlePara.setSpacingAfter(0);

            XWPFRun roleRun = titlePara.createRun();
            roleRun.setText(nullSafe(exp.getRole()));
            roleRun.setBold(true);
            roleRun.setFontSize(10);
            roleRun.setFontFamily("Calibri");

            XWPFRun separatorRun = titlePara.createRun();
            separatorRun.setText(" at ");
            separatorRun.setFontSize(10);
            separatorRun.setFontFamily("Calibri");

            XWPFRun companyRun = titlePara.createRun();
            companyRun.setText(nullSafe(exp.getOrganization()));
            companyRun.setFontSize(10);
            companyRun.setFontFamily("Calibri");

            // Date and Location
            XWPFParagraph datePara = document.createParagraph();
            datePara.setSpacingAfter(50);
            XWPFRun dateRun = datePara.createRun();
            String dateRange = formatDateRange(exp.getStartDate(), exp.getEndDate());
            String locationInfo = exp.getLocation() != null ? " | " + exp.getLocation() : "";
            dateRun.setText(dateRange + locationInfo);
            dateRun.setFontSize(9);
            dateRun.setItalic(true);
            dateRun.setFontFamily("Calibri");

            // Responsibilities/Achievements as bullet points
            List<String> bullets = exp.getAchievements() != null && !exp.getAchievements().isEmpty()
                    ? exp.getAchievements()
                    : exp.getResponsibilities();

            if (bullets != null) {
                for (String bullet : bullets) {
                    XWPFParagraph bulletPara = document.createParagraph();
                    bulletPara.setSpacingAfter(0);
                    bulletPara.setIndentationLeft(360);
                    XWPFRun bulletRun = bulletPara.createRun();
                    bulletRun.setText("• " + bullet);
                    bulletRun.setFontSize(10);
                    bulletRun.setFontFamily("Calibri");
                }
            }
        }
    }

    /**
     * Adds the education section.
     */
    private void addEducation(XWPFDocument document, List<MasterResumeJson.Education> educations) {
        if (educations == null || educations.isEmpty())
            return;

        addSectionTitle(document, "EDUCATION");

        for (MasterResumeJson.Education edu : educations) {
            XWPFParagraph titlePara = document.createParagraph();
            titlePara.setSpacingAfter(0);

            XWPFRun degreeRun = titlePara.createRun();
            degreeRun.setText(nullSafe(edu.getDegree()));
            degreeRun.setBold(true);
            degreeRun.setFontSize(10);
            degreeRun.setFontFamily("Calibri");

            if (edu.getFieldOfStudy() != null) {
                XWPFRun fieldRun = titlePara.createRun();
                fieldRun.setText(" in " + edu.getFieldOfStudy());
                fieldRun.setFontSize(10);
                fieldRun.setFontFamily("Calibri");
            }

            XWPFParagraph detailPara = document.createParagraph();
            detailPara.setSpacingAfter(50);
            XWPFRun detailRun = detailPara.createRun();
            String details = nullSafe(edu.getInstitution());
            if (edu.getLocation() != null)
                details += ", " + edu.getLocation();
            String dateRange = formatDateRange(edu.getStartDate(), edu.getEndDate());
            if (!dateRange.isEmpty())
                details += " | " + dateRange;
            if (edu.getGradeOrScore() != null)
                details += " | " + edu.getGradeOrScore();
            detailRun.setText(details);
            detailRun.setFontSize(9);
            detailRun.setItalic(true);
            detailRun.setFontFamily("Calibri");
        }
    }

    /**
     * Adds the certifications section.
     */
    private void addCertifications(XWPFDocument document, List<MasterResumeJson.Certification> certifications) {
        if (certifications == null || certifications.isEmpty())
            return;

        addSectionTitle(document, "CERTIFICATIONS");

        for (MasterResumeJson.Certification cert : certifications) {
            XWPFParagraph para = document.createParagraph();
            para.setSpacingAfter(0);

            XWPFRun nameRun = para.createRun();
            nameRun.setText(nullSafe(cert.getName()));
            nameRun.setBold(true);
            nameRun.setFontSize(10);
            nameRun.setFontFamily("Calibri");

            String details = "";
            if (cert.getIssuer() != null)
                details += " - " + cert.getIssuer();
            if (cert.getYear() != null)
                details += " (" + cert.getYear() + ")";

            if (!details.isEmpty()) {
                XWPFRun detailRun = para.createRun();
                detailRun.setText(details);
                detailRun.setFontSize(10);
                detailRun.setFontFamily("Calibri");
            }
        }
    }

    /**
     * Adds the projects section.
     */
    private void addProjects(XWPFDocument document, List<MasterResumeJson.ProjectOrWork> projects) {
        if (projects == null || projects.isEmpty())
            return;

        addSectionTitle(document, "PROJECTS");

        for (MasterResumeJson.ProjectOrWork project : projects) {
            XWPFParagraph titlePara = document.createParagraph();
            titlePara.setSpacingAfter(0);

            XWPFRun titleRun = titlePara.createRun();
            titleRun.setText(nullSafe(project.getTitle()));
            titleRun.setBold(true);
            titleRun.setFontSize(10);
            titleRun.setFontFamily("Calibri");

            if (project.getLink() != null) {
                XWPFRun linkRun = titlePara.createRun();
                linkRun.setText(" (" + project.getLink() + ")");
                linkRun.setFontSize(9);
                linkRun.setFontFamily("Calibri");
            }

            if (project.getDescription() != null) {
                for (String desc : project.getDescription()) {
                    XWPFParagraph descPara = document.createParagraph();
                    descPara.setSpacingAfter(0);
                    descPara.setIndentationLeft(360);
                    XWPFRun descRun = descPara.createRun();
                    descRun.setText("• " + desc);
                    descRun.setFontSize(10);
                    descRun.setFontFamily("Calibri");
                }
            }
        }
    }

    /**
     * Adds a section title with formatting and separator line.
     */
    private void addSectionTitle(XWPFDocument document, String title) {
        XWPFParagraph para = document.createParagraph();
        para.setSpacingBefore(150);
        para.setSpacingAfter(50);
        para.setBorderBottom(Borders.SINGLE);

        XWPFRun run = para.createRun();
        run.setText(title);
        run.setBold(true);
        run.setFontSize(11);
        run.setFontFamily("Calibri");
        run.setColor("2E4A62");
    }

    /**
     * Formats a date range for display.
     */
    private String formatDateRange(LocalDate start, LocalDate end) {
        if (start == null)
            return "";

        String startStr = start.format(DATE_FORMATTER);
        String endStr = end != null ? end.format(DATE_FORMATTER) : "Present";
        return startStr + " - " + endStr;
    }

    /**
     * Returns empty string if value is null.
     */
    private String nullSafe(String value) {
        return value != null ? value : "";
    }
}
