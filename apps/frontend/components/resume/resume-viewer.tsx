"use client";

import React, { useEffect, useState } from "react";

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

interface ViewMasterResumeResponse {
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

interface ResumeViewerProps {
  resumeData: ViewMasterResumeResponse;
  /** Pass true to render in a scrollable card wrapper (default: true) */
  wrapInCard?: boolean;
}

/* ===================== Helpers ===================== */

const COLOR = {
  primary: "#1A4D2E",
  secondary: "#4F7942",
  text: "#333333",
  lightText: "#666666",
  border: "#d1e8d8",
  bg: "#ffffff",
  headerBg: "#f4faf6",
};

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
  const startStr = formatDate(start);
  const endStr = end ? formatDate(end) : "Present";
  return `${startStr} – ${endStr}`;
}

function ContactSeparator() {
  return (
    <span
      style={{
        color: COLOR.secondary,
        margin: "0 6px",
        fontWeight: 300,
        opacity: 0.7,
      }}
    >
      |
    </span>
  );
}

/* ===================== Sub-components ===================== */

function SectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        borderBottom: `2px solid ${COLOR.primary}`,
        marginBottom: "6px",
        marginTop: "14px",
        paddingBottom: "3px",
      }}
    >
      <span
        style={{
          fontFamily: "'Calibri', 'Segoe UI', sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: COLOR.primary,
          textTransform: "uppercase" as const,
        }}
      >
        {title}
      </span>
    </div>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        marginBottom: "2px",
        paddingLeft: "12px",
      }}
    >
      <span
        style={{
          color: COLOR.secondary,
          marginRight: "6px",
          marginTop: "0px",
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
          color: COLOR.text,
          lineHeight: "1.55",
        }}
      >
        {text}
      </span>
    </div>
  );
}

/* ===================== Section: Header ===================== */

function HeaderSection({ header }: { header?: MasterResumeHeader }) {
  if (!header) return null;

  const contactParts: React.ReactNode[] = [];

  const addPart = (val?: string) => {
    if (!val) return;
    if (contactParts.length > 0) contactParts.push(<ContactSeparator key={`sep-${contactParts.length}`} />);
    contactParts.push(
      <span key={`part-${contactParts.length}`} style={{ color: COLOR.text, fontSize: "9px" }}>
        {val}
      </span>
    );
  };

  addPart(header.email);
  addPart(header.phone);
  addPart(header.location);
  if (header.links?.linkedin) addPart(header.links.linkedin);
  if (header.links?.github) addPart(header.links.github);
  if (header.links?.portfolio) addPart(header.links.portfolio);
  if (header.links?.website) addPart(header.links.website);

  return (
    <div
      style={{
        textAlign: "center",
        paddingBottom: "10px",
        marginBottom: "2px",
        background: COLOR.headerBg,
        borderBottom: `3px solid ${COLOR.primary}`,
        padding: "18px 24px 14px",
        borderRadius: "2px 2px 0 0",
      }}
    >
      {/* Full Name */}
      {header.fullName && (
        <div
          style={{
            fontFamily: "'Calibri', 'Segoe UI', sans-serif",
            fontSize: "28px",
            fontWeight: 700,
            color: COLOR.primary,
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
            marginBottom: "4px",
          }}
        >
          {header.fullName}
        </div>
      )}

      {/* Headline */}
      {header.headline && (
        <div
          style={{
            fontFamily: "'Calibri', 'Segoe UI', sans-serif",
            fontSize: "11px",
            fontStyle: "italic",
            color: COLOR.secondary,
            marginBottom: "8px",
            letterSpacing: "0.02em",
          }}
        >
          {header.headline}
        </div>
      )}

      {/* Contact Line */}
      {contactParts.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "0",
            fontFamily: "'Calibri', 'Segoe UI', sans-serif",
          }}
        >
          {contactParts}
        </div>
      )}
    </div>
  );
}

/* ===================== Section: Summary ===================== */

function SummarySection({ summary }: { summary?: string }) {
  if (!summary) return null;
  return (
    <div>
      <SectionTitle title="Professional Summary" />
      <p
        style={{
          fontFamily: "'Calibri', 'Segoe UI', sans-serif",
          fontSize: "10px",
          color: COLOR.text,
          lineHeight: "1.6",
          margin: "0 0 4px",
        }}
      >
        {summary}
      </p>
    </div>
  );
}

/* ===================== Section: Skills ===================== */

function SkillsSection({ skills }: { skills?: MasterResumeCoreSkills }) {
  if (!skills) return null;

  const rows: { label: string; values: string[] }[] = [];
  if (skills.technical?.length) rows.push({ label: "Technical", values: skills.technical });
  if (skills.tools?.length) rows.push({ label: "Tools & Technologies", values: skills.tools });
  if (skills.professional?.length) rows.push({ label: "Professional", values: skills.professional });
  if (skills.soft?.length) rows.push({ label: "Soft Skills", values: skills.soft });
  if (skills.domainSpecific?.length) rows.push({ label: "Domain", values: skills.domainSpecific });

  if (!rows.length) return null;

  return (
    <div>
      <SectionTitle title="Skills" />
      <div
        style={{
          display: "table",
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "4px",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "table-row",
            }}
          >
            <div
              style={{
                display: "table-cell",
                width: "18%",
                paddingBottom: "3px",
                paddingRight: "8px",
                verticalAlign: "top",
                fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                color: COLOR.secondary,
                whiteSpace: "nowrap",
              }}
            >
              {row.label}:
            </div>
            <div
              style={{
                display: "table-cell",
                width: "82%",
                paddingBottom: "3px",
                verticalAlign: "top",
                fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                fontSize: "10px",
                color: COLOR.text,
                lineHeight: "1.5",
              }}
            >
              {row.values.join(", ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== Section: Experience ===================== */

function ExperienceSection({ experiences }: { experiences?: MasterResumeExperience[] }) {
  if (!experiences?.length) return null;

  return (
    <div>
      <SectionTitle title="Experience" />
      {experiences.map((exp, i) => {
        const bullets =
          exp.achievements?.length ? exp.achievements : exp.responsibilities ?? [];
        const dateRange = formatDateRange(exp.startDate, exp.endDate);
        const locationInfo = exp.location ? ` | ${exp.location}` : "";
        const empType = exp.employmentType ? ` · ${exp.employmentType}` : "";

        return (
          <div
            key={i}
            style={{
              marginBottom: i < experiences.length - 1 ? "10px" : "0",
            }}
          >
            {/* Role at Company */}
            <div
              style={{
                fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                fontSize: "11px",
                lineHeight: "1.4",
                marginBottom: "1px",
              }}
            >
              <span style={{ fontWeight: 700, color: COLOR.text }}>
                {exp.role}
              </span>
              {exp.organization && (
                <>
                  <span style={{ color: COLOR.text, fontWeight: 400 }}> at </span>
                  <span
                    style={{
                      fontStyle: "italic",
                      color: COLOR.text,
                      fontWeight: 400,
                    }}
                  >
                    {exp.organization}
                  </span>
                </>
              )}
              {empType && (
                <span style={{ color: COLOR.lightText, fontSize: "9px" }}>
                  {empType}
                </span>
              )}
            </div>

            {/* Date / Location */}
            {(dateRange || locationInfo) && (
              <div
                style={{
                  fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                  fontSize: "9px",
                  fontStyle: "italic",
                  color: COLOR.secondary,
                  marginBottom: "3px",
                }}
              >
                {dateRange}
                {locationInfo}
              </div>
            )}

            {/* Bullets */}
            {bullets.map((b, j) => (
              <BulletPoint key={j} text={b} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== Section: Education ===================== */

function EducationSection({ educations }: { educations?: MasterResumeEducation[] }) {
  if (!educations?.length) return null;

  return (
    <div>
      <SectionTitle title="Education" />
      {educations.map((edu, i) => {
        const details: string[] = [];
        if (edu.institution) details.push(edu.institution);
        if (edu.location) details[details.length - 1] += `, ${edu.location}`;
        const dateRange = formatDateRange(edu.startDate, edu.endDate);
        if (dateRange) details.push(dateRange);
        if (edu.gradeOrScore) details.push(edu.gradeOrScore);

        return (
          <div
            key={i}
            style={{ marginBottom: i < educations.length - 1 ? "8px" : "0" }}
          >
            {/* Degree */}
            <div
              style={{
                fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                fontSize: "11px",
                lineHeight: "1.4",
                marginBottom: "1px",
              }}
            >
              <span style={{ fontWeight: 700, color: COLOR.text }}>
                {edu.degree}
              </span>
              {edu.fieldOfStudy && (
                <span style={{ color: COLOR.text, fontWeight: 400 }}>
                  {" "}in {edu.fieldOfStudy}
                </span>
              )}
            </div>

            {/* Details */}
            {details.length > 0 && (
              <div
                style={{
                  fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                  fontSize: "9px",
                  fontStyle: "italic",
                  color: COLOR.secondary,
                }}
              >
                {details.join(" | ")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== Section: Certifications ===================== */

function CertificationsSection({
  certifications,
}: {
  certifications?: MasterResumeCertification[];
}) {
  if (!certifications?.length) return null;

  return (
    <div>
      <SectionTitle title="Certifications" />
      {certifications.map((cert, i) => (
        <div
          key={i}
          style={{
            marginBottom: "3px",
            fontFamily: "'Calibri', 'Segoe UI', sans-serif",
            fontSize: "10px",
          }}
        >
          <span style={{ fontWeight: 700, color: COLOR.text }}>
            {cert.name}
          </span>
          {cert.issuer && (
            <span style={{ color: COLOR.text }}> – {cert.issuer}</span>
          )}
          {cert.year && (
            <span style={{ color: COLOR.lightText }}> ({cert.year})</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ===================== Section: Projects ===================== */

function ProjectsSection({ projects }: { projects?: MasterResumeProjectOrWork[] }) {
  if (!projects?.length) return null;

  return (
    <div>
      <SectionTitle title="Projects" />
      {projects.map((project, i) => (
        <div
          key={i}
          style={{ marginBottom: i < projects.length - 1 ? "8px" : "0" }}
        >
          {/* Title + Link */}
          <div
            style={{
              fontFamily: "'Calibri', 'Segoe UI', sans-serif",
              fontSize: "11px",
              lineHeight: "1.4",
              marginBottom: "2px",
            }}
          >
            <span style={{ fontWeight: 700, color: COLOR.text }}>
              {project.title}
            </span>
            {project.link && (
              <span style={{ color: COLOR.secondary, fontSize: "9px" }}>
                {" "}({project.link})
              </span>
            )}
          </div>

          {/* Description bullets */}
          {project.description?.map((desc, j) => (
            <BulletPoint key={j} text={desc} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ===================== Section: Awards ===================== */

function AwardsSection({ awards }: { awards?: MasterResumeAwardAndHonor[] }) {
  if (!awards?.length) return null;

  return (
    <div>
      <SectionTitle title="Awards & Honors" />
      {awards.map((award, i) => (
        <div
          key={i}
          style={{ marginBottom: "4px" }}
        >
          <div
            style={{
              fontFamily: "'Calibri', 'Segoe UI', sans-serif",
              fontSize: "10px",
            }}
          >
            <span style={{ fontWeight: 700, color: COLOR.text }}>
              {award.title}
            </span>
            {award.issuer && (
              <span style={{ color: COLOR.text }}> – {award.issuer}</span>
            )}
            {award.year && (
              <span style={{ color: COLOR.lightText }}> ({award.year})</span>
            )}
          </div>
          {award.description?.map((desc, j) => (
            <BulletPoint key={j} text={desc} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ===================== Section: Publications ===================== */

function PublicationsSection({ publications }: { publications?: MasterResumePublication[] }) {
  if (!publications?.length) return null;

  return (
    <div>
      <SectionTitle title="Publications" />
      {publications.map((pub, i) => (
        <div
          key={i}
          style={{
            marginBottom: "4px",
            fontFamily: "'Calibri', 'Segoe UI', sans-serif",
            fontSize: "10px",
          }}
        >
          <span style={{ fontWeight: 700, color: COLOR.text }}>{pub.title}</span>
          {pub.publisher && <span style={{ color: COLOR.text }}>, {pub.publisher}</span>}
          {pub.year && <span style={{ color: COLOR.lightText }}> ({pub.year})</span>}
          {pub.url && (
            <span style={{ color: COLOR.secondary, display: "block", fontSize: "9px" }}>
              {pub.url}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ===================== Section: Volunteer ===================== */

function VolunteerSection({ volunteer }: { volunteer?: MasterResumeVolunteerExperience[] }) {
  if (!volunteer?.length) return null;

  return (
    <div>
      <SectionTitle title="Volunteer Experience" />
      {volunteer.map((vol, i) => {
        const dateRange = formatDateRange(vol.startDate, vol.endDate);
        return (
          <div key={i} style={{ marginBottom: "8px" }}>
            <div
              style={{
                fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                fontSize: "11px",
                lineHeight: "1.4",
              }}
            >
              <span style={{ fontWeight: 700, color: COLOR.text }}>{vol.role}</span>
              {vol.organization && (
                <>
                  <span style={{ color: COLOR.text }}> at </span>
                  <span style={{ fontStyle: "italic", color: COLOR.text }}>
                    {vol.organization}
                  </span>
                </>
              )}
            </div>
            {(dateRange || vol.location) && (
              <div
                style={{
                  fontFamily: "'Calibri', 'Segoe UI', sans-serif",
                  fontSize: "9px",
                  fontStyle: "italic",
                  color: COLOR.secondary,
                  marginBottom: "3px",
                }}
              >
                {dateRange}
                {vol.location && ` | ${vol.location}`}
              </div>
            )}
            {vol.description?.map((desc, j) => (
              <BulletPoint key={j} text={desc} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ===================== Section: Languages ===================== */

function LanguagesSection({ languages }: { languages?: MasterResumeLanguage[] }) {
  if (!languages?.length) return null;

  return (
    <div>
      <SectionTitle title="Languages" />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          fontFamily: "'Calibri', 'Segoe UI', sans-serif",
          fontSize: "10px",
          marginBottom: "4px",
        }}
      >
        {languages.map((lang, i) => (
          <div key={i}>
            <span style={{ fontWeight: 700, color: COLOR.text }}>{lang.language}</span>
            {lang.proficiency && (
              <span style={{ color: COLOR.lightText }}> ({lang.proficiency})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== Section: Professional Affiliations ===================== */

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
            color: COLOR.text,
            marginBottom: "2px",
          }}
        >
          • {aff}
        </div>
      ))}
    </div>
  );
}

/* ===================== Section: Additional Sections ===================== */

function AdditionalSectionsComponent({
  sections,
}: {
  sections?: MasterResumeAdditionalSection[];
}) {
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
                color: COLOR.text,
                marginBottom: "2px",
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

/* ===================== Skeleton Loader ===================== */

function ResumeSkeleton() {
  const skLine = (w: string, h = "10px", mb = "6px") => (
    <div
      style={{
        width: w,
        height: h,
        background: "linear-gradient(90deg, #e8f4ec 25%, #d1e8d8 50%, #e8f4ec 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        borderRadius: "3px",
        marginBottom: mb,
      }}
    />
  );

  return (
    <div style={{ padding: "24px" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {/* Header skeleton */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {skLine("40%", "28px", "8px")}
        {skLine("30%", "12px", "8px")}
        {skLine("60%", "9px")}
      </div>
      {/* Section skeletons */}
      {[1, 2, 3].map((s) => (
        <div key={s} style={{ marginBottom: "16px" }}>
          {skLine("20%", "12px", "8px")}
          {skLine("90%")}
          {skLine("85%")}
          {skLine("70%")}
        </div>
      ))}
    </div>
  );
}

/* ===================== Main Component ===================== */

export function ResumeViewer({
  resumeData,
  wrapInCard = true,
}: ResumeViewerProps) {
  const resumeContent = (
    <div
      className="resume-page-wrapper"
      style={{
        fontFamily: "'Calibri', 'Segoe UI', sans-serif",
        background: COLOR.bg,
        minHeight: "297mm",
        width: "100%",
        maxWidth: "210mm",
        margin: "0 auto",
        boxShadow: wrapInCard
          ? "0 4px 24px rgba(26, 77, 46, 0.10), 0 1px 4px rgba(26,77,46,0.06)"
          : "none",
        border: wrapInCard ? `1px solid ${COLOR.border}` : "none",
        borderRadius: wrapInCard ? "4px" : "0",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <HeaderSection header={resumeData.header} />

      {/* Body */}
      <div style={{ padding: "10px 18px 18px" }}>
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
        <AdditionalSectionsComponent sections={resumeData.additionalSections} />
      </div>
    </div>
  );

  return (
    <>
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 16px",
      }}
    >
        {resumeContent}
        </div>
    </>
  );
}

/* ===================== Async Wrapper (with fetch) ===================== */

interface ResumeViewerPageProps {
  resumeId: string;
  apiClient: {
    get: <T>(url: string) => Promise<T>;
  };
}

interface MasterResumeViewResponse {
  resumeJson: ViewMasterResumeResponse;
}

export function ResumeViewerPage({
  resumeId,
  apiClient,
}: ResumeViewerPageProps) {
  const [resumeData, setResumeData] = useState<ViewMasterResumeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiClient
      .get<MasterResumeViewResponse>(`/api/resume/view/${resumeId}`)
      .then((res) => {
        if (!cancelled) {
          setResumeData(res.resumeJson);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load resume."
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resumeId, apiClient]);

  if (loading) {
    return (
      <div
        style={{
          background: "#f0f7f3",
          minHeight: "100vh",
          padding: "24px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "210mm",
            margin: "0 auto",
            background: "#fff",
            borderRadius: "4px",
            border: `1px solid ${COLOR.border}`,
            boxShadow: "0 4px 24px rgba(26, 77, 46, 0.08)",
          }}
        >
          <ResumeSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "#f0f7f3",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: `1px solid #fca5a5`,
            borderRadius: "8px",
            padding: "24px 32px",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              marginBottom: "8px",
            }}
          >
            ⚠️
          </div>
          <div
            style={{
              fontFamily: "'Calibri', 'Segoe UI', sans-serif",
              fontSize: "14px",
              color: "#991b1b",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            Failed to load resume
          </div>
          <div
            style={{
              fontFamily: "'Calibri', 'Segoe UI', sans-serif",
              fontSize: "12px",
              color: COLOR.lightText,
            }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!resumeData) return null;

  return (
    <ResumeViewer
      resumeData={resumeData}
    />
  );
}

export default ResumeViewer;