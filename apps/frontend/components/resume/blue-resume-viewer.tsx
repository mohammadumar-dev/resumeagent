"use client";

import React from "react";

/* ===================== Types ===================== */

interface MasterResumeLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
  other?: string[];
}

interface MasterResumeHeader {
  fullName?: string;
  headline?: string;
  location?: string;
  email?: string;
  phone?: string;
  links?: MasterResumeLinks;
}

interface MasterResumeCoreSkills {
  technical?: string[];
  professional?: string[];
  soft?: string[];
  tools?: string[];
  domainSpecific?: string[];
}

interface MasterResumeExperience {
  role?: string;
  organization?: string;
  location?: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: string[];
  context?: string;
  achievements?: string[];
  skillsUsed?: string[];
}

interface MasterResumeProjectOrWork {
  title?: string;
  type?: string;
  link?: string;
  description?: string[];
  outcomes?: string[];
  skillsUsed?: string[];
}

interface MasterResumeEducation {
  degree?: string;
  fieldOfStudy?: string;
  institution?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gradeOrScore?: string;
  focusAreas?: string[];
}

interface MasterResumeCertification {
  name?: string;
  issuer?: string;
  year?: number;
  credentialId?: string;
  validUntil?: string;
}

interface MasterResumeAwardAndHonor {
  title?: string;
  issuer?: string;
  year?: number;
  description?: string[];
}

interface MasterResumePublication {
  title?: string;
  publisher?: string;
  year?: number;
  url?: string;
}

interface MasterResumeVolunteerExperience {
  role?: string;
  organization?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string[];
}

interface MasterResumeLanguage {
  language?: string;
  proficiency?: string;
}

interface MasterResumeAdditionalSection {
  title?: string;
  content?: string[];
}

export interface ViewMasterResumeResponse {
  metadata?: { version?: string };
  header?: MasterResumeHeader;
  summary?: string;
  coreSkills?: MasterResumeCoreSkills;
  experience?: MasterResumeExperience[];
  projectsOrWork?: MasterResumeProjectOrWork[];
  education?: MasterResumeEducation[];
  certifications?: MasterResumeCertification[];
  awardsAndHonors?: MasterResumeAwardAndHonor[];
  publications?: MasterResumePublication[];
  volunteerExperience?: MasterResumeVolunteerExperience[];
  languages?: MasterResumeLanguage[];
  professionalAffiliations?: string[];
  additionalSections?: MasterResumeAdditionalSection[];
}

/* ===================== Props ===================== */

export interface BlueResumeViewerProps {
  resumeData: ViewMasterResumeResponse;
  /** Wrap in a card shadow (default: true) */
  wrapInCard?: boolean;
}

/* ===================== Design Tokens ===================== */

// BlueResumeDocxService uses run.setColor("2E4A62") only on section titles.
// Name, body text, dates are all default black — no accent colors elsewhere.
const C = {
  sectionTitle: "#2E4A62",  // The only color in the entire template
  black: "#000000",
  body: "#111111",          // near-black for body text
  page: "#ffffff",
  bg: "#e8edf2",            // subtle blue-gray page background
  border: "#c8d3dc",        // card border tint
};

/* ===================== Helpers ===================== */

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatDateRange(start?: string, end?: string): string {
  if (!start) return "";
  return `${formatDate(start)} - ${end ? formatDate(end) : "Present"}`;
}

/* ===================== Shared Primitives ===================== */

// Mirrors: run.setBold(true), run.setFontSize(11), run.setFontFamily("Calibri"), run.setColor("2E4A62")
// + para.setBorderBottom(Borders.SINGLE), para.setSpacingBefore(150), para.setSpacingAfter(50)
function SectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        borderBottom: "1px solid #000000",
        marginTop: "11px",
        marginBottom: "4px",
        paddingBottom: "2px",
      }}
    >
      <span
        style={{
          fontFamily: "'Calibri', 'Segoe UI', sans-serif",
          fontSize: "11px",
          fontWeight: 700,
          color: C.sectionTitle,
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </span>
    </div>
  );
}

// Mirrors: bulletPara.setIndentationLeft(360), bulletRun.setFontSize(10)
function Bullet({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        paddingLeft: "14px",
        marginBottom: "1px",
      }}
    >
      <span
        style={{
          color: C.body,
          marginRight: "5px",
          fontSize: "10px",
          lineHeight: "16px",
          flexShrink: 0,
        }}
      >
        •
      </span>
      <span
        style={{
          fontFamily: "'Calibri', 'Segoe UI', sans-serif",
          fontSize: "10px",
          color: C.body,
          lineHeight: "1.5",
        }}
      >
        {text}
      </span>
    </div>
  );
}

/* ===================== Header ===================== */
// namePara: CENTER, bold, 18pt
// headlinePara: CENTER, italic, 11pt
// contactPara: CENTER, 9pt, pipe-joined
function HeaderSection({ header }: { header?: MasterResumeHeader }) {
  if (!header) return null;

  const contactParts: string[] = [];
  if (header.email) contactParts.push(header.email);
  if (header.phone) contactParts.push(header.phone);
  if (header.location) contactParts.push(header.location);
  if (header.links?.linkedin) contactParts.push(header.links.linkedin);
  if (header.links?.github) contactParts.push(header.links.github);
  if (header.links?.portfolio) contactParts.push(header.links.portfolio);
  if (header.links?.website) contactParts.push(header.links.website);

  return (
    <div style={{ textAlign: "center", marginBottom: "6px" }}>
      {/* Full Name — bold, 18pt, black */}
      {header.fullName && (
        <div
          style={{
            fontFamily: "'Calibri', 'Segoe UI', sans-serif",
            fontSize: "18px",
            fontWeight: 700,
            color: C.black,
            lineHeight: 1.2,
            marginBottom: "1px",
          }}
        >
          {header.fullName}
        </div>
      )}

      {/* Headline — italic, 11pt, black */}
      {header.headline && (
        <div
          style={{
            fontFamily: "'Calibri', 'Segoe UI', sans-serif",
            fontSize: "11px",
            fontStyle: "italic",
            color: C.black,
            marginBottom: "2px",
          }}
        >
          {header.headline}
        </div>
      )}

      {/* Contact line — 9pt, pipe-separated, black */}
      {contactParts.length > 0 && (
        <div
          style={{
            fontFamily: "'Calibri', 'Segoe UI', sans-serif",
            fontSize: "9px",
            color: C.body,
          }}
        >
          {contactParts.join(" | ")}
        </div>
      )}
    </div>
  );
}

/* ===================== Summary ===================== */
// run.setFontSize(10)
function SummarySection({ summary }: { summary?: string }) {
  if (!summary) return null;
  return (
    <div>
      <SectionTitle title="Professional Summary" />
      <p
        style={{
          fontFamily: "'Calibri', 'Segoe UI', sans-serif",
          fontSize: "10px",
          color: C.body,
          lineHeight: "1.55",
          margin: "0 0 4px",
        }}
      >
        {summary}
      </p>
    </div>
  );
}

/* ===================== Skills ===================== */
// BlueResumeDocxService renders skills as ONE flat paragraph with pipe separators:
// "Technical: x, y | Tools: a, b | Professional: c, d"
function SkillsSection({ skills }: { skills?: MasterResumeCoreSkills }) {
  if (!skills) return null;

  const parts: string[] = [];
  if (skills.technical?.length)
    parts.push(`Technical: ${skills.technical.join(", ")}`);
  if (skills.tools?.length)
    parts.push(`Tools: ${skills.tools.join(", ")}`);
  if (skills.professional?.length)
    parts.push(`Professional: ${skills.professional.join(", ")}`);
  if (skills.soft?.length)
    parts.push(`Soft Skills: ${skills.soft.join(", ")}`);
  if (skills.domainSpecific?.length)
    parts.push(`Domain: ${skills.domainSpecific.join(", ")}`);

  if (!parts.length) return null;

  return (
    <div>
      <SectionTitle title="Skills" />
      <p
        style={{
          fontFamily: "'Calibri', 'Segoe UI', sans-serif",
          fontSize: "10px",
          color: C.body,
          lineHeight: "1.55",
          margin: "0 0 4px",
        }}
      >
        {parts.join(" | ")}
      </p>
    </div>
  );
}

/* ===================== Experience ===================== */
// titlePara: "Role at Company" — role bold 10pt, " at " normal, company normal
// datePara: italic 9pt, black
// bullets: 10pt, indented left 360
function ExperienceSection({ experiences }: { experiences?: MasterResumeExperience[] }) {
  if (!experiences?.length) return null;

  return (
    <div>
      <SectionTitle title="Experience" />
      {experiences.map((exp, i) => {
        const bullets =
          exp.achievements?.length ? exp.achievements : exp.responsibilities ?? [];
        const dateStr = formatDateRange(exp.startDate, exp.endDate);
        const location = exp.location ? ` | ${exp.location}` : "";

        return (
          <div key={i} style={{ marginBottom: i < experiences.length - 1 ? "7px" : "0" }}>
            {/* Role at Company — mirrors titlePara */}
            <div
              style={{
                fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                fontSize: "10px",
                lineHeight: "1.4",
                color: C.body,
                marginBottom: "1px",
              }}
            >
              <span style={{ fontWeight: 700 }}>{exp.role}</span>
              {exp.organization && (
                <>
                  <span style={{ fontWeight: 400 }}> at </span>
                  <span style={{ fontWeight: 400 }}>{exp.organization}</span>
                </>
              )}
            </div>

            {/* Date / Location — italic 9pt */}
            {(dateStr || location) && (
              <div
                style={{
                  fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                  fontSize: "9px",
                  fontStyle: "italic",
                  color: C.body,
                  marginBottom: "2px",
                }}
              >
                {dateStr}{location}
              </div>
            )}

            {/* Bullet points */}
            {bullets.map((b, j) => <Bullet key={j} text={b} />)}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== Education ===================== */
// titlePara: degree bold 10pt + " in fieldOfStudy" normal
// detailPara: "Institution, Location | Date | GPA" — italic 9pt
function EducationSection({ educations }: { educations?: MasterResumeEducation[] }) {
  if (!educations?.length) return null;

  return (
    <div>
      <SectionTitle title="Education" />
      {educations.map((edu, i) => {
        const detailParts: string[] = [];
        let instLine = edu.institution ?? "";
        if (edu.location) instLine += `, ${edu.location}`;
        if (instLine) detailParts.push(instLine);
        const dateRange = formatDateRange(edu.startDate, edu.endDate);
        if (dateRange) detailParts.push(dateRange);
        if (edu.gradeOrScore) detailParts.push(edu.gradeOrScore);

        return (
          <div key={i} style={{ marginBottom: i < educations.length - 1 ? "5px" : "0" }}>
            {/* Degree */}
            <div
              style={{
                fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                fontSize: "10px",
                lineHeight: "1.4",
                color: C.body,
                marginBottom: "1px",
              }}
            >
              <span style={{ fontWeight: 700 }}>{edu.degree}</span>
              {edu.fieldOfStudy && (
                <span style={{ fontWeight: 400 }}> in {edu.fieldOfStudy}</span>
              )}
            </div>

            {/* Institution | Date | GPA */}
            {detailParts.length > 0 && (
              <div
                style={{
                  fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                  fontSize: "9px",
                  fontStyle: "italic",
                  color: C.body,
                }}
              >
                {detailParts.join(" | ")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== Certifications ===================== */
// name bold 10pt + " - issuer (year)" normal 10pt — all in one para
function CertificationsSection({ certifications }: { certifications?: MasterResumeCertification[] }) {
  if (!certifications?.length) return null;

  return (
    <div>
      <SectionTitle title="Certifications" />
      {certifications.map((cert, i) => {
        let detail = "";
        if (cert.issuer) detail += ` - ${cert.issuer}`;
        if (cert.year) detail += ` (${cert.year})`;

        return (
          <div
            key={i}
            style={{
              fontFamily: "'Calibri', 'Segoe UI', sans-serif",
              fontSize: "10px",
              color: C.body,
              marginBottom: "2px",
              lineHeight: "1.4",
            }}
          >
            <span style={{ fontWeight: 700 }}>{cert.name}</span>
            {detail && <span style={{ fontWeight: 400 }}>{detail}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== Projects ===================== */
// title bold 10pt + " (link)" 9pt — then bullets 10pt indented
function ProjectsSection({ projects }: { projects?: MasterResumeProjectOrWork[] }) {
  if (!projects?.length) return null;

  return (
    <div>
      <SectionTitle title="Projects" />
      {projects.map((project, i) => (
        <div key={i} style={{ marginBottom: i < projects.length - 1 ? "6px" : "0" }}>
          {/* Title + link */}
          <div
            style={{
              fontFamily: "'Calibri', 'Segoe UI', sans-serif",
              fontSize: "10px",
              lineHeight: "1.4",
              color: C.body,
              marginBottom: "2px",
            }}
          >
            <span style={{ fontWeight: 700 }}>{project.title}</span>
            {project.link && (
              <span style={{ fontWeight: 400, fontSize: "9px" }}>
                {" "}({project.link})
              </span>
            )}
          </div>

          {project.description?.map((desc, j) => <Bullet key={j} text={desc} />)}
        </div>
      ))}
    </div>
  );
}

/* ===================== Awards ===================== */
function AwardsSection({ awards }: { awards?: MasterResumeAwardAndHonor[] }) {
  if (!awards?.length) return null;

  return (
    <div>
      <SectionTitle title="Awards & Honors" />
      {awards.map((award, i) => {
        let detail = "";
        if (award.issuer) detail += ` – ${award.issuer}`;
        if (award.year) detail += ` (${award.year})`;

        return (
          <div key={i} style={{ marginBottom: "3px" }}>
            <div
              style={{
                fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                fontSize: "10px",
                color: C.body,
                lineHeight: "1.4",
              }}
            >
              <span style={{ fontWeight: 700 }}>{award.title}</span>
              {detail && <span style={{ fontWeight: 400 }}>{detail}</span>}
            </div>
            {award.description?.map((desc, j) => <Bullet key={j} text={desc} />)}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== Publications ===================== */
function PublicationsSection({ publications }: { publications?: MasterResumePublication[] }) {
  if (!publications?.length) return null;

  return (
    <div>
      <SectionTitle title="Publications" />
      {publications.map((pub, i) => (
        <div
          key={i}
          style={{
            fontFamily: "'Calibri', 'Segoe UI', sans-serif",
            fontSize: "10px",
            color: C.body,
            marginBottom: "3px",
            lineHeight: "1.4",
          }}
        >
          <span style={{ fontWeight: 700 }}>{pub.title}</span>
          {pub.publisher && <span>, {pub.publisher}</span>}
          {pub.year && <span style={{ color: C.body }}> ({pub.year})</span>}
          {pub.url && (
            <span style={{ display: "block", fontSize: "9px", fontStyle: "italic" }}>
              {pub.url}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ===================== Volunteer ===================== */
function VolunteerSection({ volunteer }: { volunteer?: MasterResumeVolunteerExperience[] }) {
  if (!volunteer?.length) return null;

  return (
    <div>
      <SectionTitle title="Volunteer Experience" />
      {volunteer.map((vol, i) => {
        const dateStr = formatDateRange(vol.startDate, vol.endDate);
        const location = vol.location ? ` | ${vol.location}` : "";

        return (
          <div key={i} style={{ marginBottom: "6px" }}>
            <div
              style={{
                fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                fontSize: "10px",
                lineHeight: "1.4",
                color: C.body,
                marginBottom: "1px",
              }}
            >
              <span style={{ fontWeight: 700 }}>{vol.role}</span>
              {vol.organization && (
                <>
                  <span> at </span>
                  <span>{vol.organization}</span>
                </>
              )}
            </div>
            {(dateStr || location) && (
              <div
                style={{
                  fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                  fontSize: "9px",
                  fontStyle: "italic",
                  color: C.body,
                  marginBottom: "2px",
                }}
              >
                {dateStr}{location}
              </div>
            )}
            {vol.description?.map((desc, j) => <Bullet key={j} text={desc} />)}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== Languages ===================== */
function LanguagesSection({ languages }: { languages?: MasterResumeLanguage[] }) {
  if (!languages?.length) return null;

  return (
    <div>
      <SectionTitle title="Languages" />
      <p
        style={{
          fontFamily: "'Calibri', 'Segoe UI', sans-serif",
          fontSize: "10px",
          color: C.body,
          margin: "0 0 4px",
          lineHeight: "1.5",
        }}
      >
        {languages
          .map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`)
          .join(" | ")}
      </p>
    </div>
  );
}

/* ===================== Affiliations ===================== */
function AffiliationsSection({ affiliations }: { affiliations?: string[] }) {
  if (!affiliations?.length) return null;

  return (
    <div>
      <SectionTitle title="Professional Affiliations" />
      {affiliations.map((aff, i) => (
        <div
          key={i}
          style={{
            fontFamily: "'Calibri', 'Segoe UI', sans-serif",
            fontSize: "10px",
            color: C.body,
            marginBottom: "1px",
          }}
        >
          • {aff}
        </div>
      ))}
    </div>
  );
}

/* ===================== Additional Sections ===================== */
function AdditionalSections({ sections }: { sections?: MasterResumeAdditionalSection[] }) {
  if (!sections?.length) return null;
  return (
    <>
      {sections.map((section, i) => (
        <div key={i}>
          <SectionTitle title={section.title ?? "Additional"} />
          {section.content?.map((item, j) => (
            <div
              key={j}
              style={{
                fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                fontSize: "10px",
                color: C.body,
                marginBottom: "1px",
              }}
            >
              • {item}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

/* ===================== Main Export ===================== */

export function BlueResumeViewer({
  resumeData,
  wrapInCard = true,
}: BlueResumeViewerProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 16px",
      }}
    >
      {/* A4 page */}
      <div
        style={{
          fontFamily: "'Calibri', 'Segoe UI', sans-serif",
          background: C.page,
          minHeight: "297mm",
          width: "100%",
          maxWidth: "210mm",
          margin: "0 auto",
          padding: "18px 20px 20px",
          boxSizing: "border-box" as const,
          boxShadow: wrapInCard
            ? "0 2px 16px rgba(46, 74, 98, 0.13), 0 1px 3px rgba(46,74,98,0.07)"
            : "none",
          border: wrapInCard ? `1px solid ${C.border}` : "none",
          borderRadius: wrapInCard ? "3px" : "0",
        }}
      >
        <HeaderSection header={resumeData.header} />
        <SummarySection summary={resumeData.summary} />
        <SkillsSection skills={resumeData.coreSkills} />
        <ExperienceSection experiences={resumeData.experience} />
        <EducationSection educations={resumeData.education} />
        <CertificationsSection certifications={resumeData.certifications} />
        <ProjectsSection projects={resumeData.projectsOrWork} />
        <AwardsSection awards={resumeData.awardsAndHonors} />
        <PublicationsSection publications={resumeData.publications} />
        <VolunteerSection volunteer={resumeData.volunteerExperience} />
        <LanguagesSection languages={resumeData.languages} />
        <AffiliationsSection affiliations={resumeData.professionalAffiliations} />
        <AdditionalSections sections={resumeData.additionalSections} />
      </div>
    </div>
  );
}

export default BlueResumeViewer;