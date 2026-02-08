package com.resumeagent.render;

import com.resumeagent.entity.model.MasterResumeJson;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;
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
 * Enhanced service to generate modern, professional DOCX resume files.
 * Optimized for single-page layout with modern design elements.
 */
@Service
public class GreenResumeDocxService {

    private static final String TEMPLATE_PATH = "templates/resume/resume_template.docx";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy");

    // Modern color palette
    private static final String COLOR_PRIMARY = "1A4D2E";      // Deep green for headers
    private static final String COLOR_SECONDARY = "4F7942";    // Medium green for accents
    private static final String COLOR_TEXT = "333333";         // Dark gray for body
    private static final String COLOR_LIGHT_TEXT = "666666";   // Light gray for metadata

    // Font sizes (in half-points, so 36 = 18pt)
    private static final int SIZE_NAME = 36;           // 18pt
    private static final int SIZE_HEADLINE = 22;       // 11pt
    private static final int SIZE_SECTION_HEADER = 24; // 12pt
    private static final int SIZE_SUBTITLE = 22;       // 11pt
    private static final int SIZE_BODY = 20;           // 10pt
    private static final int SIZE_SMALL = 18;          // 9pt

    // Spacing (in twips, 1440 twips = 1 inch, 20 twips = 1pt)
    private static final int SPACING_BEFORE_SECTION = 180;  // ~0.125 inch
    private static final int SPACING_AFTER_SECTION = 80;    // ~0.055 inch
    private static final int SPACING_AFTER_ITEM = 60;       // ~0.042 inch
    private static final int SPACING_TIGHT = 40;            // ~0.028 inch
    private static final int SPACING_NONE = 0;

    /**
     * Generates a modern DOCX resume document from the provided resume JSON data.
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
     * Creates a new DOCX document with optimized settings.
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
     * Creates a new document with optimized margins and settings for single-page layout.
     */
    private XWPFDocument createNewDocument() {
        XWPFDocument document = new XWPFDocument();

        // Set narrow margins (0.5 inch = 720 twips)
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
        if (header == null) return;

        // Full Name - Large, Bold, Centered with primary color
        XWPFParagraph namePara = document.createParagraph();
        namePara.setAlignment(ParagraphAlignment.CENTER);
        namePara.setSpacingAfter(SPACING_TIGHT);
        XWPFRun nameRun = namePara.createRun();
        nameRun.setText(nullSafe(header.getFullName()));
        nameRun.setBold(true);
        nameRun.setFontSize(SIZE_NAME / 2); // Convert to points
        nameRun.setFontFamily("Calibri");
        nameRun.setColor(COLOR_PRIMARY);

        // Headline - Italic, centered with secondary color
        if (header.getHeadline() != null && !header.getHeadline().isBlank()) {
            XWPFParagraph headlinePara = document.createParagraph();
            headlinePara.setAlignment(ParagraphAlignment.CENTER);
            headlinePara.setSpacingAfter(SPACING_TIGHT);
            XWPFRun headlineRun = headlinePara.createRun();
            headlineRun.setText(header.getHeadline());
            headlineRun.setFontSize(SIZE_HEADLINE / 2);
            headlineRun.setItalic(true);
            headlineRun.setFontFamily("Calibri");
            headlineRun.setColor(COLOR_SECONDARY);
        }

        // Contact Info Line - Compact with pipe separators
        XWPFParagraph contactPara = document.createParagraph();
        contactPara.setAlignment(ParagraphAlignment.CENTER);
        contactPara.setSpacingAfter(SPACING_AFTER_SECTION);
        XWPFRun contactRun = contactPara.createRun();

        StringBuilder contactLine = new StringBuilder();
        if (header.getEmail() != null)
            contactLine.append(header.getEmail());
        if (header.getPhone() != null) {
            if (contactLine.length() > 0) contactLine.append(" | ");
            contactLine.append(header.getPhone());
        }
        if (header.getLocation() != null) {
            if (contactLine.length() > 0) contactLine.append(" | ");
            contactLine.append(header.getLocation());
        }

        // Add links
        MasterResumeJson.Links links = header.getLinks();
        if (links != null) {
            if (links.getLinkedin() != null) {
                if (contactLine.length() > 0) contactLine.append(" | ");
                contactLine.append(links.getLinkedin());
            }
            if (links.getGithub() != null) {
                if (contactLine.length() > 0) contactLine.append(" | ");
                contactLine.append(links.getGithub());
            }
            if (links.getPortfolio() != null) {
                if (contactLine.length() > 0) contactLine.append(" | ");
                contactLine.append(links.getPortfolio());
            }
        }

        contactRun.setText(contactLine.toString());
        contactRun.setFontSize(SIZE_SMALL / 2);
        contactRun.setFontFamily("Calibri");
        contactRun.setColor(COLOR_TEXT);
    }

    /**
     * Adds the professional summary section.
     */
    private void addSummary(XWPFDocument document, String summary) {
        if (summary == null || summary.isBlank()) return;

        addSectionTitle(document, "PROFESSIONAL SUMMARY");

        XWPFParagraph para = document.createParagraph();
        para.setSpacingAfter(SPACING_AFTER_ITEM);
        XWPFRun run = para.createRun();
        run.setText(summary);
        run.setFontSize(SIZE_BODY / 2);
        run.setFontFamily("Calibri");
        run.setColor(COLOR_TEXT);
    }

    /**
     * Adds the skills section with structured layout.
     */
    private void addSkills(XWPFDocument document, MasterResumeJson.CoreSkills skills) {
        if (skills == null) return;

        addSectionTitle(document, "SKILLS");

        // Create a table for better visual organization
        XWPFTable table = document.createTable();
        table.removeBorders();
        table.setWidth("100%");

        // Technical Skills
        if (skills.getTechnical() != null && !skills.getTechnical().isEmpty()) {
            addSkillRow(table, "Technical", String.join(", ", skills.getTechnical()));
        }

        // Tools & Technologies
        if (skills.getTools() != null && !skills.getTools().isEmpty()) {
            addSkillRow(table, "Tools & Technologies", String.join(", ", skills.getTools()));
        }

        // Professional Skills
        if (skills.getProfessional() != null && !skills.getProfessional().isEmpty()) {
            addSkillRow(table, "Professional", String.join(", ", skills.getProfessional()));
        }

        // Add spacing after skills section
        XWPFParagraph spacer = document.createParagraph();
        spacer.setSpacingAfter(SPACING_AFTER_ITEM);
    }

    /**
     * Helper method to add a skill row to the table.
     */
    private void addSkillRow(XWPFTable table, String category, String skills) {
        XWPFTableRow row = (table.getNumberOfRows() == 1 && table.getRow(0).getTableCells().isEmpty())
                ? table.getRow(0)
                : table.createRow();

        // Category cell (20% width)
        XWPFTableCell categoryCell = row.getCell(0);
        categoryCell.setWidth("20%");
        XWPFParagraph categoryPara = categoryCell.getParagraphs().get(0);
        categoryPara.setSpacingAfter(SPACING_TIGHT);
        XWPFRun categoryRun = categoryPara.createRun();
        categoryRun.setText(category + ":");
        categoryRun.setBold(true);
        categoryRun.setFontSize(SIZE_BODY / 2);
        categoryRun.setFontFamily("Calibri");
        categoryRun.setColor(COLOR_SECONDARY);

        // Skills cell (80% width)
        XWPFTableCell skillsCell = row.getCell(1) != null ? row.getCell(1) : row.addNewTableCell();
        skillsCell.setWidth("80%");
        XWPFParagraph skillsPara = skillsCell.getParagraphs().get(0);
        skillsPara.setSpacingAfter(SPACING_TIGHT);
        XWPFRun skillsRun = skillsPara.createRun();
        skillsRun.setText(skills);
        skillsRun.setFontSize(SIZE_BODY / 2);
        skillsRun.setFontFamily("Calibri");
        skillsRun.setColor(COLOR_TEXT);
    }

    /**
     * Adds the work experience section.
     */
    private void addExperience(XWPFDocument document, List<MasterResumeJson.Experience> experiences) {
        if (experiences == null || experiences.isEmpty()) return;

        addSectionTitle(document, "EXPERIENCE");

        for (int i = 0; i < experiences.size(); i++) {
            MasterResumeJson.Experience exp = experiences.get(i);

            // Role and Company on one line
            XWPFParagraph titlePara = document.createParagraph();
            titlePara.setSpacingAfter(SPACING_NONE);

            XWPFRun roleRun = titlePara.createRun();
            roleRun.setText(nullSafe(exp.getRole()));
            roleRun.setBold(true);
            roleRun.setFontSize(SIZE_SUBTITLE / 2);
            roleRun.setFontFamily("Calibri");
            roleRun.setColor(COLOR_TEXT);

            XWPFRun separatorRun = titlePara.createRun();
            separatorRun.setText(" at ");
            separatorRun.setFontSize(SIZE_BODY / 2);
            separatorRun.setFontFamily("Calibri");
            separatorRun.setColor(COLOR_TEXT);

            XWPFRun companyRun = titlePara.createRun();
            companyRun.setText(nullSafe(exp.getOrganization()));
            companyRun.setFontSize(SIZE_BODY / 2);
            companyRun.setItalic(true);
            companyRun.setFontFamily("Calibri");
            companyRun.setColor(COLOR_TEXT);

            // Date and Location
            XWPFParagraph datePara = document.createParagraph();
            datePara.setSpacingAfter(SPACING_TIGHT);
            XWPFRun dateRun = datePara.createRun();
            String dateRange = formatDateRange(exp.getStartDate(), exp.getEndDate());
            String locationInfo = exp.getLocation() != null ? " | " + exp.getLocation() : "";
            dateRun.setText(dateRange + locationInfo);
            dateRun.setFontSize(SIZE_SMALL / 2);
            dateRun.setItalic(true);
            dateRun.setFontFamily("Calibri");
            dateRun.setColor(COLOR_SECONDARY);

            // Achievements or Responsibilities as bullets
            List<String> bullets = exp.getAchievements() != null && !exp.getAchievements().isEmpty()
                    ? exp.getAchievements()
                    : exp.getResponsibilities();

            if (bullets != null && !bullets.isEmpty()) {
                for (String bullet : bullets) {
                    XWPFParagraph bulletPara = document.createParagraph();
                    bulletPara.setSpacingAfter(SPACING_NONE);
                    bulletPara.setIndentationLeft(360);  // 0.25 inch
                    bulletPara.setIndentationHanging(260); // Hanging indent for bullet

                    XWPFRun bulletRun = bulletPara.createRun();
                    bulletRun.setText("• " + bullet);
                    bulletRun.setFontSize(SIZE_BODY / 2);
                    bulletRun.setFontFamily("Calibri");
                    bulletRun.setColor(COLOR_TEXT);
                }
            }

            // Add spacing between experiences (except after the last one)
            if (i < experiences.size() - 1) {
                XWPFParagraph spacer = document.createParagraph();
                spacer.setSpacingAfter(SPACING_AFTER_ITEM);
            }
        }
    }

    /**
     * Adds the education section.
     */
    private void addEducation(XWPFDocument document, List<MasterResumeJson.Education> educations) {
        if (educations == null || educations.isEmpty()) return;

        addSectionTitle(document, "EDUCATION");

        for (MasterResumeJson.Education edu : educations) {
            // Degree and Field
            XWPFParagraph titlePara = document.createParagraph();
            titlePara.setSpacingAfter(SPACING_NONE);

            XWPFRun degreeRun = titlePara.createRun();
            degreeRun.setText(nullSafe(edu.getDegree()));
            degreeRun.setBold(true);
            degreeRun.setFontSize(SIZE_SUBTITLE / 2);
            degreeRun.setFontFamily("Calibri");
            degreeRun.setColor(COLOR_TEXT);

            if (edu.getFieldOfStudy() != null) {
                XWPFRun fieldRun = titlePara.createRun();
                fieldRun.setText(" in " + edu.getFieldOfStudy());
                fieldRun.setFontSize(SIZE_BODY / 2);
                fieldRun.setFontFamily("Calibri");
                fieldRun.setColor(COLOR_TEXT);
            }

            // Institution, Location, Date, GPA
            XWPFParagraph detailPara = document.createParagraph();
            detailPara.setSpacingAfter(SPACING_AFTER_ITEM);
            XWPFRun detailRun = detailPara.createRun();

            StringBuilder details = new StringBuilder(nullSafe(edu.getInstitution()));
            if (edu.getLocation() != null)
                details.append(", ").append(edu.getLocation());

            String dateRange = formatDateRange(edu.getStartDate(), edu.getEndDate());
            if (!dateRange.isEmpty())
                details.append(" | ").append(dateRange);
            if (edu.getGradeOrScore() != null)
                details.append(" | ").append(edu.getGradeOrScore());

            detailRun.setText(details.toString());
            detailRun.setFontSize(SIZE_SMALL / 2);
            detailRun.setItalic(true);
            detailRun.setFontFamily("Calibri");
            detailRun.setColor(COLOR_SECONDARY);
        }
    }

    /**
     * Adds the certifications section.
     */
    private void addCertifications(XWPFDocument document, List<MasterResumeJson.Certification> certifications) {
        if (certifications == null || certifications.isEmpty()) return;

        addSectionTitle(document, "CERTIFICATIONS");

        for (MasterResumeJson.Certification cert : certifications) {
            XWPFParagraph para = document.createParagraph();
            para.setSpacingAfter(SPACING_TIGHT);

            XWPFRun nameRun = para.createRun();
            nameRun.setText(nullSafe(cert.getName()));
            nameRun.setBold(true);
            nameRun.setFontSize(SIZE_BODY / 2);
            nameRun.setFontFamily("Calibri");
            nameRun.setColor(COLOR_TEXT);

            StringBuilder details = new StringBuilder();
            if (cert.getIssuer() != null)
                details.append(" - ").append(cert.getIssuer());
            if (cert.getYear() != null)
                details.append(" (").append(cert.getYear()).append(")");

            if (details.length() > 0) {
                XWPFRun detailRun = para.createRun();
                detailRun.setText(details.toString());
                detailRun.setFontSize(SIZE_BODY / 2);
                detailRun.setFontFamily("Calibri");
                detailRun.setColor(COLOR_TEXT);
            }
        }
    }

    /**
     * Adds the projects section.
     */
    private void addProjects(XWPFDocument document, List<MasterResumeJson.ProjectOrWork> projects) {
        if (projects == null || projects.isEmpty()) return;

        addSectionTitle(document, "PROJECTS");

        for (MasterResumeJson.ProjectOrWork project : projects) {
            // Project title
            XWPFParagraph titlePara = document.createParagraph();
            titlePara.setSpacingAfter(SPACING_TIGHT);

            XWPFRun titleRun = titlePara.createRun();
            titleRun.setText(nullSafe(project.getTitle()));
            titleRun.setBold(true);
            titleRun.setFontSize(SIZE_SUBTITLE / 2);
            titleRun.setFontFamily("Calibri");
            titleRun.setColor(COLOR_TEXT);

            if (project.getLink() != null) {
                XWPFRun linkRun = titlePara.createRun();
                linkRun.setText(" (" + project.getLink() + ")");
                linkRun.setFontSize(SIZE_SMALL / 2);
                linkRun.setFontFamily("Calibri");
                linkRun.setColor(COLOR_SECONDARY);
            }

            // Project descriptions as bullets
            if (project.getDescription() != null && !project.getDescription().isEmpty()) {
                for (String desc : project.getDescription()) {
                    XWPFParagraph descPara = document.createParagraph();
                    descPara.setSpacingAfter(SPACING_NONE);
                    descPara.setIndentationLeft(360);
                    descPara.setIndentationHanging(260);

                    XWPFRun descRun = descPara.createRun();
                    descRun.setText("• " + desc);
                    descRun.setFontSize(SIZE_BODY / 2);
                    descRun.setFontFamily("Calibri");
                    descRun.setColor(COLOR_TEXT);
                }
            }

            // Add spacing after project
            XWPFParagraph spacer = document.createParagraph();
            spacer.setSpacingAfter(SPACING_TIGHT);
        }
    }

    /**
     * Adds a modern section title with colored underline.
     */
    private void addSectionTitle(XWPFDocument document, String title) {
        XWPFParagraph para = document.createParagraph();
        para.setSpacingBefore(SPACING_BEFORE_SECTION);
        para.setSpacingAfter(SPACING_AFTER_SECTION);

        // Add colored bottom border
        CTPPr pPr = para.getCTP().getPPr();
        if (pPr == null) pPr = para.getCTP().addNewPPr();
        CTPBdr borders = pPr.addNewPBdr();
        CTBorder bottomBorder = borders.addNewBottom();
        bottomBorder.setVal(STBorder.SINGLE);
        bottomBorder.setColor(COLOR_PRIMARY);
        bottomBorder.setSz(BigInteger.valueOf(8));  // Border thickness
        bottomBorder.setSpace(BigInteger.valueOf(1));

        XWPFRun run = para.createRun();
        run.setText(title);
        run.setBold(true);
        run.setFontSize(SIZE_SECTION_HEADER / 2);
        run.setFontFamily("Calibri");
        run.setColor(COLOR_PRIMARY);
    }

    /**
     * Formats a date range for display.
     */
    private String formatDateRange(LocalDate start, LocalDate end) {
        if (start == null) return "";

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