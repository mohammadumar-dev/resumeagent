"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ViewMasterResumeResponse } from "@/types/master-resume";

interface Props {
  resume: ViewMasterResumeResponse;
}

export default function ViewMasterResume({ resume }: Props) {
  if (!resume) return null;

  const show = (value: unknown) => {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  };

  const hasListContent = (items?: string[] | null) =>
    !!items?.some((item) => show(item));

  const getListItems = (items?: string[] | null) => {
    const filtered = items?.filter((item) => show(item));
    return filtered?.length ? filtered : undefined;
  };

  const header = resume.header;
  const headerLinks = header?.links;
  const headerOtherLinks = headerLinks?.other?.filter((link) => show(link));
  const headerHasLinks =
    !!headerLinks &&
    (show(headerLinks.linkedin) ||
      show(headerLinks.github) ||
      show(headerLinks.portfolio) ||
      show(headerLinks.website) ||
      !!headerOtherLinks?.length);
  const headerHasContacts =
    show(header?.location) || show(header?.email) || show(header?.phone);
  const showHeader =
    !!header &&
    (show(header?.fullName) ||
      show(header?.headline) ||
      headerHasContacts ||
      headerHasLinks);

  const coreSkills = resume.coreSkills;
  const technicalSkills = getListItems(coreSkills?.technical);
  const professionalSkills = getListItems(coreSkills?.professional);
  const softSkills = getListItems(coreSkills?.soft);
  const toolsSkills = getListItems(coreSkills?.tools);
  const domainSpecificSkills = getListItems(coreSkills?.domainSpecific);
  const hasCoreSkills =
    !!(
      technicalSkills ||
      professionalSkills ||
      softSkills ||
      toolsSkills ||
      domainSpecificSkills
    );

  const experiences =
    resume.experience?.filter((exp) =>
      show(exp.role) ||
      show(exp.organization) ||
      show(exp.location) ||
      show(exp.employmentType) ||
      show(exp.context) ||
      show(exp.startDate) ||
      show(exp.endDate) ||
      hasListContent(exp.responsibilities) ||
      hasListContent(exp.achievements) ||
      hasListContent(exp.skillsUsed)
    ) ?? [];
  const experienceHasContent = experiences.length > 0;

  const projects =
    resume.projectsOrWork?.filter((project) =>
      show(project.title) ||
      show(project.type) ||
      show(project.link) ||
      hasListContent(project.description) ||
      hasListContent(project.outcomes) ||
      hasListContent(project.skillsUsed)
    ) ?? [];
  const projectHasContent = projects.length > 0;

  const education =
    resume.education?.filter((edu) =>
      show(edu.degree) ||
      show(edu.institution) ||
      show(edu.location) ||
      show(edu.startDate) ||
      show(edu.endDate) ||
      show(edu.gradeOrScore) ||
      hasListContent(edu.focusAreas)
    ) ?? [];
  const educationHasContent = education.length > 0;

  const certifications =
    resume.certifications?.filter((c) =>
      show(c.name) ||
      show(c.issuer) ||
      show(c.year) ||
      show(c.credentialId) ||
      show(c.validUntil)
    ) ?? [];
  const certificationsHasContent = certifications.length > 0;

  const awards =
    resume.awardsAndHonors?.filter((a) =>
      show(a.title) ||
      show(a.issuer) ||
      show(a.year) ||
      hasListContent(a.description)
    ) ?? [];
  const awardsHasContent = awards.length > 0;

  const publications =
    resume.publications?.filter((p) =>
      show(p.title) ||
      show(p.publisher) ||
      show(p.year) ||
      show(p.url)
    ) ?? [];
  const publicationsHasContent = publications.length > 0;

  const volunteerExperience =
    resume.volunteerExperience?.filter((v) =>
      show(v.role) ||
      show(v.organization) ||
      show(v.location) ||
      show(v.startDate) ||
      show(v.endDate) ||
      hasListContent(v.description)
    ) ?? [];
  const volunteerHasContent = volunteerExperience.length > 0;

  const displayedLanguages = resume.languages
    ?.map((language) => {
      const languageLabelParts: string[] = [];
      if (show(language.language)) {
        languageLabelParts.push(language.language!.trim());
      }
      if (show(language.proficiency)) {
        languageLabelParts.push(language.proficiency!.trim());
      }
      return languageLabelParts.join(" — ");
    })
    .filter((label) => show(label));

  const affiliations = resume.professionalAffiliations?.filter((item) =>
    show(item)
  );

  const additionalSections =
    resume.additionalSections
      ?.map((section) => {
        const title = section.title?.trim();
        const content = getListItems(section.content);
        if (!title || !content) return null;
        return { title, content };
      })
      .filter(
        (section): section is { title: string; content: string[] } =>
          !!section
      ) ?? [];

  return (
    <div className="
  relative
  mx-auto
  max-w-5xl
  space-y-10
  px-4
  sm:px-6
  lg:px-8
  py-10
">
      {/* ================= HEADER ================= */}
      {showHeader && (
        <Card>
          <CardHeader>
            {show(header?.fullName) && <CardTitle>{header?.fullName}</CardTitle>}
            {show(header?.headline) && (
              <p className="text-sm text-muted-foreground">{header?.headline}</p>
            )}
          </CardHeader>

          {(headerHasContacts || headerHasLinks) && (
            <CardContent className="space-y-1 text-sm">
              {headerHasContacts && (
                <>
                  {show(header?.location) && <p>{header?.location}</p>}
                  {show(header?.email) && <p>{header?.email}</p>}
                  {show(header?.phone) && <p>{header?.phone}</p>}
                </>
              )}

              {headerHasLinks && headerLinks && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {show(headerLinks.linkedin) && (
                    <ExternalLink href={headerLinks.linkedin!} label="LinkedIn" />
                  )}
                  {show(headerLinks.github) && (
                    <ExternalLink href={headerLinks.github!} label="GitHub" />
                  )}
                  {show(headerLinks.portfolio) && (
                    <ExternalLink href={headerLinks.portfolio!} label="Portfolio" />
                  )}
                  {show(headerLinks.website) && (
                    <ExternalLink href={headerLinks.website!} label="Website" />
                  )}
                  {headerOtherLinks?.map((link, i) => (
                    <ExternalLink key={i} href={link} label={`Link ${i + 1}`} />
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* ================= SUMMARY ================= */}
      {show(resume.summary) && (
        <Section title="Professional Summary">
          <p>{resume.summary}</p>
        </Section>
      )}

      {/* ================= CORE SKILLS ================= */}
      {hasCoreSkills && (
        <Section title="Core Skills">
          <SkillBlock label="Technical" items={technicalSkills} />
          <SkillBlock label="Professional" items={professionalSkills} />
          <SkillBlock label="Soft Skills" items={softSkills} />
          <SkillBlock label="Tools" items={toolsSkills} />
          <SkillBlock label="Domain Specific" items={domainSpecificSkills} />
        </Section>
      )}

      {/* ================= EXPERIENCE ================= */}
      {experienceHasContent && (
        <Section title="Experience">
          {experiences.map((exp, i) => {
            const responsibilities = getListItems(exp.responsibilities);
            const achievements = getListItems(exp.achievements);
            const skillsUsed = getListItems(exp.skillsUsed);

            return (
              <div key={i} className="
  space-y-3
  pb-6
  border-b
  border-border/50
  last:border-0
"
              >
                {(show(exp.role) || show(exp.organization)) && (
                  <h4 className="font-medium">
                    {show(exp.role) && exp.role}
                    {show(exp.role) && show(exp.organization) && " — "}
                    {show(exp.organization) && exp.organization}
                  </h4>
                )}

                {(show(exp.location) || show(exp.startDate)) && (
                  <p className="text-sm text-muted-foreground">
                    {show(exp.location) && exp.location}
                    {show(exp.startDate) && ` | ${exp.startDate}`}
                    {exp.endDate ? ` - ${exp.endDate}` : exp.startDate ? " - Present" : ""}
                  </p>
                )}

                {show(exp.employmentType) && (
                  <p className="text-sm italic">{exp.employmentType}</p>
                )}

                {show(exp.context) && <p>{exp.context}</p>}

                <BulletList items={responsibilities} />

                {achievements && (
                  <>
                    <h5 className="font-medium">Achievements</h5>
                    <BulletList items={achievements} />
                  </>
                )}

                {skillsUsed && <TagBlock label="Skills Used" items={skillsUsed} />}
              </div>
            );
          })}
        </Section>
      )}

      {/* ================= PROJECTS ================= */}
      {projectHasContent && (
        <Section title="Projects & Work">
          {projects.map((project, i) => {
            const description = getListItems(project.description);
            const outcomes = getListItems(project.outcomes);
            const projectSkills = getListItems(project.skillsUsed);

            return (
              <div key={i} className="
  space-y-3
  pb-6
  border-b
  border-border/50
  last:border-0
"
              >
                {show(project.title) && (
                  <h4 className="font-medium">
                    {project.title}
                    {show(project.type) && ` (${project.type})`}
                  </h4>
                )}

                {show(project.link) && (
                  <ExternalLink href={project.link!} label={project.link!} />
                )}

                <BulletList items={description} />
                <BulletList items={outcomes} />

                {projectSkills && (
                  <TagBlock label="Skills Used" items={projectSkills} />
                )}
              </div>
            );
          })}
        </Section>
      )}

      {/* ================= EDUCATION ================= */}
      {educationHasContent && (
        <Section title="Education">
          {education.map((edu, i) => {
            const focusAreas = getListItems(edu.focusAreas);

            return (
              <div key={i} className="space-y-1">
                {show(edu.degree) && <h4 className="font-medium">{edu.degree}</h4>}

                {(show(edu.institution) || show(edu.startDate)) && (
                  <p className="text-sm text-muted-foreground">
                    {show(edu.institution) && edu.institution}
                    {show(edu.startDate) && ` | ${edu.startDate}`}
                    {edu.endDate ? ` - ${edu.endDate}` : edu.startDate ? " - Present" : ""}
                  </p>
                )}

                {show(edu.gradeOrScore) && <p>{edu.gradeOrScore}</p>}
                <BulletList items={focusAreas} />
              </div>
            );
          })}
        </Section>
      )}

      {/* ================= CERTIFICATIONS ================= */}
      {certificationsHasContent && (
        <Section title="Certifications">
          {certifications.map((c, i) => (
            <div key={i}>
              {show(c.name) ? (
                <p>
                  {c.name}
                  {show(c.year) && ` (${c.year})`}
                </p>
              ) : show(c.year) ? (
                <p className="text-sm text-muted-foreground">{c.year}</p>
              ) : null}
              {show(c.issuer) && <p className="text-sm">{c.issuer}</p>}
              {show(c.credentialId) && (
                <p className="text-sm text-muted-foreground">{c.credentialId}</p>
              )}
              {show(c.validUntil) && (
                <p className="text-sm text-muted-foreground">{c.validUntil}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ================= AWARDS ================= */}
      {awardsHasContent && (
        <Section title="Awards & Honors">
          {awards.map((a, i) => {
            const description = getListItems(a.description);
            return (
              <div key={i}>
                {show(a.title) ? (
                  <p>
                    {a.title}
                    {show(a.year) && ` (${a.year})`}
                  </p>
                ) : show(a.year) ? (
                  <p className="text-sm text-muted-foreground">{a.year}</p>
                ) : null}
                {show(a.issuer) && <p className="text-sm">{a.issuer}</p>}
                <BulletList items={description} />
              </div>
            );
          })}
        </Section>
      )}

      {/* ================= PUBLICATIONS ================= */}
      {publicationsHasContent && (
        <Section title="Publications">
          {publications.map((p, i) => (
            <div key={i}>
              {show(p.title) && <p>{p.title}</p>}
              {show(p.publisher) && <p className="text-sm">{p.publisher}</p>}
              {show(p.year) && <p className="text-sm">{p.year}</p>}
              {show(p.url) && <ExternalLink href={p.url!} label="View Publication" />}
            </div>
          ))}
        </Section>
      )}

      {/* ================= VOLUNTEER ================= */}
      {volunteerHasContent && (
        <Section title="Volunteer Experience">
          {volunteerExperience.map((v, i) => {
            const description = getListItems(v.description);
            return (
              <div key={i}>
                {show(v.role) && <p>{v.role}</p>}
                {show(v.organization) && <p className="text-sm">{v.organization}</p>}
                {show(v.location) && <p className="text-sm">{v.location}</p>}
                <BulletList items={description} />
              </div>
            );
          })}
        </Section>
      )}

      {/* ================= LANGUAGES ================= */}
      {displayedLanguages?.length ? (
        <Section title="Languages">
          <BulletList items={displayedLanguages} />
        </Section>
      ) : null}

      {/* ================= AFFILIATIONS ================= */}
      {affiliations?.length ? (
        <Section title="Professional Affiliations">
          <BulletList items={affiliations} />
        </Section>
      ) : null}

      {/* ================= ADDITIONAL ================= */}
      {additionalSections.length ? (
        <>
          {additionalSections.map((section, i) => (
            <Section key={i} title={section.title}>
              <BulletList items={section.content} />
            </Section>
          ))}
        </>
      ) : null}
    </div>
  );
}

/* ================= Reusable ================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
	  return (
	    <Card
	      className="
	        group
	        relative
	        overflow-hidden
	        isolate
	        border
	        bg-card/85
	        shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]
	        transition-all
	        hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]
	      "
	    >
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        <div className="mt-2 h-px w-12 bg-primary/40 transition-all group-hover:w-20" />
      </CardHeader>

      <CardContent className="space-y-4 text-sm leading-relaxed">
        {children}
      </CardContent>
    </Card>
  );
}

function BulletList({ items }: { items?: string[] | null }) {
  if (!items?.length) return null;

  return (
    <ul className="space-y-2 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1 size-1.5 rounded-full bg-primary/60 shrink-0" />
          <span className="text-muted-foreground">{item}</span>
        </li>
      ))}
    </ul>

  );
}

function TagBlock({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </h5>

	      <div className="flex flex-wrap gap-2">
	        {items.map((item, i) => (
	          <span
	            key={i}
	            className="
	              rounded-full
	              bg-muted/60
	              px-3 py-1
	              text-xs
	              transition-colors
	              hover:bg-muted
	            "
	          >
	            {item}
          </span>
        ))}
      </div>
    </div>
  );
}


function SkillBlock({
  label,
  items,
}: {
  label: string;
  items?: string[] | null;
}) {
  if (!items?.length) return null;

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </h5>

	      <div className="flex flex-wrap gap-2">
	        {items.map((skill, i) => (
	          <span
	            key={i}
	            className="
	              rounded-full
	              border
	              border-border/60
	              bg-background/60
	              px-3 py-1
	              text-xs
	              transition-colors
	              hover:bg-primary/10
	              hover:border-primary/30
	            "
	          >
	            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      className="
    inline-flex
    items-center
    gap-1
    text-sm
    font-medium
    text-primary
    hover:underline
  "
    >
      {label}
    </a>
  );
}
