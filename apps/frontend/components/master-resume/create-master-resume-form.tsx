"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { masterResumeApi } from "@/lib/api/master-resume";
import type { ApiError } from "@/types/auth";
import type { CreateAndUpdateMasterResumeRequest } from "@/types/master-resume";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExperienceForm {
  role: string;
  organization: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  context: string;
  responsibilities: string;
  achievements: string;
  skillsUsed: string;
}

interface ProjectOrWorkForm {
  title: string;
  type: string;
  description: string;
  outcomes: string;
  skillsUsed: string;
  link: string;
}

interface EducationForm {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  location: string;
  startDate: string;   // was startYear
  endDate: string;     // was endYear
  gradeOrScore: string;
  focusAreas: string;  // newline separated
}

interface CertificationForm {
  name: string;
  issuer: string;
  year: string;
  credentialId: string;
  validUntil: string;
}

interface AwardAndHonorForm {
  title: string;
  issuer: string;
  year: string;
  description: string;
}

interface PublicationForm {
  title: string;
  publisher: string;   // was platform
  year: string;
  url: string;
}

interface VolunteerExperienceForm {
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string; // newline separated → converted to string[]
}

interface LanguageForm {
  language: string;
  proficiency: string;
}

interface AdditionalSectionForm {
  title: string;
  content: string; // newline separated → converted to string[]
}

interface FormState {
  version: string;
  fullName: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  otherLinks: string;
  summary: string;
  technicalSkills: string;
  professionalSkills: string;
  softSkills: string;
  tools: string;
  domainSkills: string;
  professionalAffiliations: string;
  experience: ExperienceForm[];
  projectsOrWork: ProjectOrWorkForm[];
  education: EducationForm[];
  certifications: CertificationForm[];
  awardsAndHonors: AwardAndHonorForm[];
  publications: PublicationForm[];
  volunteerExperience: VolunteerExperienceForm[];
  languages: LanguageForm[];
  additionalSections: AdditionalSectionForm[];
}

const emptyExperience: ExperienceForm = {
  role: "",
  organization: "",
  location: "",
  employmentType: "",
  startDate: "",
  endDate: "",
  context: "",
  responsibilities: "",
  achievements: "",
  skillsUsed: "",
};

const emptyProjectOrWork: ProjectOrWorkForm = {
  title: "",
  type: "",
  description: "",
  outcomes: "",
  skillsUsed: "",
  link: "",
};

const emptyEducation: EducationForm = {
  degree: "",
  fieldOfStudy: "",
  institution: "",
  location: "",
  startDate: "",
  endDate: "",
  gradeOrScore: "",
  focusAreas: "",
};


const emptyCertification: CertificationForm = {
  name: "",
  issuer: "",
  year: "",
  credentialId: "",
  validUntil: "",
};

const emptyAwardAndHonor: AwardAndHonorForm = {
  title: "",
  issuer: "",
  year: "",
  description: "",
};

const emptyPublication: PublicationForm = {
  title: "",
  publisher: "",
  year: "",
  url: "",
};

const emptyVolunteer: VolunteerExperienceForm = {
  role: "",
  organization: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

const emptyLanguage: LanguageForm = {
  language: "",
  proficiency: "",
};

const emptyAdditionalSection: AdditionalSectionForm = {
  title: "",
  content: "",
};

const initialState: FormState = {
  version: "v1",
  fullName: "",
  headline: "",
  location: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  portfolio: "",
  website: "",
  otherLinks: "",
  summary: "",
  technicalSkills: "",
  professionalSkills: "",
  softSkills: "",
  tools: "",
  domainSkills: "",
  professionalAffiliations: "",
  experience: [],
  projectsOrWork: [],
  education: [],
  certifications: [],
  awardsAndHonors: [],
  publications: [],
  volunteerExperience: [],
  languages: [],
  additionalSections: [],
};

function splitCsv(value?: string): string[] | undefined {
  if (!value || !value.trim()) return undefined;

  const values = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

function splitLines(value?: string): string[] | undefined {
  if (!value || !value.trim()) return undefined;

  const values = value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

function toNumberOrUndefined(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
}

export function CreateMasterResumeForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    ...initialState,
    email: user?.email ?? "",
    fullName: user?.fullName ?? "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      email: prev.email || user.email || "",
      fullName: prev.fullName || user.fullName || "",
    }));
  }, [user]);

  const canSubmit = useMemo(() => {
    return form.fullName.trim().length > 0;
  }, [form.fullName]);

  const onChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateExperience = (
    index: number,
    field: keyof ExperienceForm,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.experience];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, experience: next };
    });
  };

  const updateProject = (
    index: number,
    field: keyof ProjectOrWorkForm,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.projectsOrWork];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, projectsOrWork: next };
    });
  };

  const updateEducation = (
    index: number,
    field: keyof EducationForm,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.education];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, education: next };
    });
  };

  const updateCertification = (
    index: number,
    field: keyof CertificationForm,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.certifications];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, certifications: next };
    });
  };

  const updateAward = (
    index: number,
    field: keyof AwardAndHonorForm,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.awardsAndHonors];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, awardsAndHonors: next };
    });
  };

  const updatePublication = (
    index: number,
    field: keyof PublicationForm,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.publications];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, publications: next };
    });
  };

  const updateVolunteer = (
    index: number,
    field: keyof VolunteerExperienceForm,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.volunteerExperience];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, volunteerExperience: next };
    });
  };

  const updateLanguage = (
    index: number,
    field: keyof LanguageForm,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.languages];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, languages: next };
    });
  };

  const updateAdditionalSection = (
    index: number,
    field: keyof AdditionalSectionForm,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.additionalSections];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, additionalSections: next };
    });
  };

  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experience: [...prev.experience, { ...emptyExperience }],
    }));
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projectsOrWork: [...prev.projectsOrWork, { ...emptyProjectOrWork }],
    }));
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [...prev.education, { ...emptyEducation }],
    }));
  };

  const addCertification = () => {
    setForm((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { ...emptyCertification }],
    }));
  };

  const addAward = () => {
    setForm((prev) => ({
      ...prev,
      awardsAndHonors: [...prev.awardsAndHonors, { ...emptyAwardAndHonor }],
    }));
  };

  const addPublication = () => {
    setForm((prev) => ({
      ...prev,
      publications: [...prev.publications, { ...emptyPublication }],
    }));
  };

  const addVolunteer = () => {
    setForm((prev) => ({
      ...prev,
      volunteerExperience: [...prev.volunteerExperience, { ...emptyVolunteer }],
    }));
  };

  const addLanguage = () => {
    setForm((prev) => ({
      ...prev,
      languages: [...prev.languages, { ...emptyLanguage }],
    }));
  };

  const addAdditionalSection = () => {
    setForm((prev) => ({
      ...prev,
      additionalSections: [
        ...prev.additionalSections,
        { ...emptyAdditionalSection },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index),
    }));
  };

  const removeProject = (index: number) => {
    setForm((prev) => ({
      ...prev,
      projectsOrWork: prev.projectsOrWork.filter((_, idx) => idx !== index),
    }));
  };

  const removeEducation = (index: number) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index),
    }));
  };

  const removeCertification = (index: number) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== index),
    }));
  };

  const removeAward = (index: number) => {
    setForm((prev) => ({
      ...prev,
      awardsAndHonors: prev.awardsAndHonors.filter((_, idx) => idx !== index),
    }));
  };

  const removePublication = (index: number) => {
    setForm((prev) => ({
      ...prev,
      publications: prev.publications.filter((_, idx) => idx !== index),
    }));
  };

  const removeVolunteer = (index: number) => {
    setForm((prev) => ({
      ...prev,
      volunteerExperience: prev.volunteerExperience.filter(
        (_, idx) => idx !== index,
      ),
    }));
  };

  const removeLanguage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, idx) => idx !== index),
    }));
  };

  const removeAdditionalSection = (index: number) => {
    setForm((prev) => ({
      ...prev,
      additionalSections: prev.additionalSections.filter(
        (_, idx) => idx !== index,
      ),
    }));
  };

  const buildPayload = (): CreateAndUpdateMasterResumeRequest => {
    return {
      metadata: {
        version: form.version || undefined,
      },
      header: {
        fullName: form.fullName || undefined,
        headline: form.headline || undefined,
        location: form.location || undefined,
        email: form.email || user?.email || undefined,
        phone: form.phone || undefined,
        links: {
          linkedin: form.linkedin || undefined,
          github: form.github || undefined,
          portfolio: form.portfolio || undefined,
          website: form.website || undefined,
          other: splitCsv(form.otherLinks),
        },
      },
      summary: form.summary || undefined,
      coreSkills: {
        technical: splitCsv(form.technicalSkills),
        professional: splitCsv(form.professionalSkills),
        soft: splitCsv(form.softSkills),
        tools: splitCsv(form.tools),
        domainSpecific: splitCsv(form.domainSkills),
      },
      experience: form.experience.length
        ? form.experience.map((exp) => ({
          role: exp.role || undefined,
          organization: exp.organization || undefined,
          location: exp.location || undefined,
          employmentType: exp.employmentType || undefined,
          startDate: exp.startDate || undefined,
          endDate: exp.endDate || undefined,
          context: exp.context || undefined,
          responsibilities: splitLines(exp.responsibilities),
          achievements: splitLines(exp.achievements),
          skillsUsed: splitCsv(exp.skillsUsed),
        }))
        : undefined,
      projectsOrWork: form.projectsOrWork.length
        ? form.projectsOrWork.map((project) => ({
          title: project.title || undefined,
          type: project.type || undefined,
          description: splitLines(project.description),
          outcomes: splitLines(project.outcomes),
          skillsUsed: splitCsv(project.skillsUsed),
          link: project.link || undefined,
        }))
        : undefined,
      education: form.education.length
        ? form.education.map((edu) => ({
          degree: edu.degree || undefined,
          fieldOfStudy: edu.fieldOfStudy || undefined,
          institution: edu.institution || undefined,
          location: edu.location || undefined,
          startDate: edu.startDate || undefined,
          endDate: edu.endDate || undefined,
          gradeOrScore: edu.gradeOrScore || undefined,
          focusAreas: splitLines(edu.focusAreas),
        }))
        : undefined,
      certifications: form.certifications.length
        ? form.certifications.map((cert) => ({
          name: cert.name || undefined,
          issuer: cert.issuer || undefined,
          year: toNumberOrUndefined(cert.year),
          credentialId: cert.credentialId || undefined,
          validUntil: cert.validUntil || undefined,
        }))
        : undefined,
      awardsAndHonors: form.awardsAndHonors.length
        ? form.awardsAndHonors.map((award) => ({
          title: award.title || undefined,
          issuer: award.issuer || undefined,
          year: toNumberOrUndefined(award.year),
          description: splitLines(award.description),
        }))
        : undefined,
      publications: form.publications.length
        ? form.publications.map((publication) => ({
          title: publication.title || undefined,
          publisher: publication.publisher || undefined,
          year: toNumberOrUndefined(publication.year),
          url: publication.url || undefined,
        }))
        : undefined,
      volunteerExperience: form.volunteerExperience.length
        ? form.volunteerExperience.map((volunteer) => ({
          role: volunteer.role || undefined,
          organization: volunteer.organization || undefined,
          location: volunteer.location || undefined,
          startDate: volunteer.startDate || undefined,
          endDate: volunteer.endDate || undefined,
          description: splitLines(volunteer.description),
        }))
        : undefined,
      languages: form.languages.length
        ? form.languages.map((lang) => ({
          language: lang.language || undefined,
          proficiency: lang.proficiency || undefined,
        }))
        : undefined,
      professionalAffiliations: splitCsv(form.professionalAffiliations),
      additionalSections: form.additionalSections.length
        ? form.additionalSections.map((section) => ({
          title: section.title || undefined,
          content: splitLines(section.content),
        }))
        : undefined,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("Full name is required.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = buildPayload();
      const response = await masterResumeApi.create(payload);
      toast.success(response.message || "Master resume created successfully.");
      setForm((prev) => ({
        ...initialState,
        email: user?.email ?? "",
        fullName: prev.fullName,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to create master resume.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="
    relative
    border border-border/50
    bg-card/70
    backdrop-blur-xl
    shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]
  "
    >
      <CardHeader>
        <CardTitle>Create Master Resume</CardTitle>
        <CardDescription>
          Fill in your baseline profile once. All fields from the backend DTO are
          supported below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">            <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(event) => onChange("fullName", event.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={form.headline}
                onChange={(event) => onChange("headline", event.target.value)}
                placeholder="Senior Backend Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                placeholder="+1 123 456 7890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(event) => onChange("location", event.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={form.version}
                onChange={(event) => onChange("version", event.target.value)}
                placeholder="v1"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">            <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={form.linkedin}
              onChange={(event) => onChange("linkedin", event.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={form.github}
                onChange={(event) => onChange("github", event.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio</Label>
              <Input
                id="portfolio"
                value={form.portfolio}
                onChange={(event) => onChange("portfolio", event.target.value)}
                placeholder="https://your-portfolio.dev"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(event) => onChange("website", event.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="otherLinks">Other links (comma separated)</Label>
              <Input
                id="otherLinks"
                value={form.otherLinks}
                onChange={(event) => onChange("otherLinks", event.target.value)}
                placeholder="https://x.com/you, https://medium.com/@you"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Professional summary</Label>
            <Textarea
              id="summary"
              value={form.summary}
              onChange={(event) => onChange("summary", event.target.value)}
              placeholder="Short paragraph summarizing your profile"
              rows={4}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">            <div className="space-y-2">
            <Label htmlFor="technicalSkills">
              Technical skills (comma separated)
            </Label>
            <Textarea
              id="technicalSkills"
              value={form.technicalSkills}
              onChange={(event) =>
                onChange("technicalSkills", event.target.value)
              }
              placeholder="Java, Spring Boot, PostgreSQL"
              rows={3}
            />
          </div>
            <div className="space-y-2">
              <Label htmlFor="professionalSkills">
                Professional skills (comma separated)
              </Label>
              <Textarea
                id="professionalSkills"
                value={form.professionalSkills}
                onChange={(event) =>
                  onChange("professionalSkills", event.target.value)
                }
                placeholder="Leadership, Stakeholder Management"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="softSkills">Soft skills (comma separated)</Label>
              <Textarea
                id="softSkills"
                value={form.softSkills}
                onChange={(event) => onChange("softSkills", event.target.value)}
                placeholder="Communication, Collaboration"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tools">Tools (comma separated)</Label>
              <Textarea
                id="tools"
                value={form.tools}
                onChange={(event) => onChange("tools", event.target.value)}
                placeholder="Docker, GitHub Actions, Jira"
                rows={3}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="domainSkills">Domain skills (comma separated)</Label>
              <Textarea
                id="domainSkills"
                value={form.domainSkills}
                onChange={(event) => onChange("domainSkills", event.target.value)}
                placeholder="FinTech, Healthcare, E-commerce"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professionalAffiliations">
              Professional affiliations (comma separated)
            </Label>
            <Textarea
              id="professionalAffiliations"
              value={form.professionalAffiliations}
              onChange={(event) =>
                onChange("professionalAffiliations", event.target.value)
              }
              placeholder="IEEE, ACM, Product School"
              rows={2}
            />
          </div>

          <div
            className="
    relative my-10 h-px w-full
    bg-gradient-to-r
    from-transparent
    via-border/70
    to-transparent
  "
          />
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">Experience</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="
    rounded-full
    px-4
    backdrop-blur-md
    bg-background/60
    border-border/60
    hover:bg-primary/10
    hover:border-primary/30
    transition-all
  "
                onClick={addExperience}>
                <Plus className="mr-2 size-4" />
                Add experience
              </Button>
            </div>

            {form.experience.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No experience entries yet.
              </p>
            ) : (
              form.experience.map((exp, index) => (
                <div key={`exp-${index}`} className="group
    relative
    rounded-2xl
    border border-border/60
    bg-background/60
    backdrop-blur-md
    p-6
    space-y-5
    transition-all duration-200
    hover:border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold tracking-wide text-foreground">Experience {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="
  bg-background/70
  backdrop-blur-sm
  focus-visible:ring-2
  focus-visible:ring-primary/40
  transition-shadow
"
                      onClick={() => removeExperience(index)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={exp.role}
                      onChange={(event) =>
                        updateExperience(index, "role", event.target.value)
                      }
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <Input
                        value={exp.organization}
                        onChange={(event) =>
                          updateExperience(
                            index,
                            "organization",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={exp.location}
                        onChange={(event) =>
                          updateExperience(index, "location", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Employment type</Label>
                      <Input
                        value={exp.employmentType}
                        onChange={(event) =>
                          updateExperience(
                            index,
                            "employmentType",
                            event.target.value,
                          )
                        }
                        placeholder="Full-time, Contract"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start date</Label>
                      <Input
                        type="date"
                        value={exp.startDate}
                        onChange={(event) =>
                          updateExperience(index, "startDate", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End date</Label>
                      <Input
                        type="date"
                        value={exp.endDate}
                        onChange={(event) =>
                          updateExperience(index, "endDate", event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Context</Label>
                    <Textarea
                      value={exp.context}
                      onChange={(event) =>
                        updateExperience(index, "context", event.target.value)
                      }
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Responsibilities (one per line)</Label>
                    <Textarea
                      value={exp.responsibilities}
                      onChange={(event) =>
                        updateExperience(
                          index,
                          "responsibilities",
                          event.target.value,
                        )
                      }
                      rows={3}
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Achievements (one per line)</Label>
                      <Textarea
                        value={exp.achievements}
                        onChange={(event) =>
                          updateExperience(
                            index,
                            "achievements",
                            event.target.value,
                          )
                        }
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Skills used (comma separated)</Label>
                    <Input
                      value={exp.skillsUsed}
                      onChange={(event) =>
                        updateExperience(index, "skillsUsed", event.target.value)
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </section>

          <div
            className="
    relative my-10 h-px w-full
    bg-gradient-to-r
    from-transparent
    via-border/70
    to-transparent
  "
          />
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">Projects or Work</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="
    rounded-full
    px-4
    backdrop-blur-md
    bg-background/60
    border-border/60
    hover:bg-primary/10
    hover:border-primary/30
    transition-all
  "
                onClick={addProject}>
                <Plus className="mr-2 size-4" />
                Add project
              </Button>
            </div>

            {form.projectsOrWork.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No projects added yet.
              </p>
            ) : (
              form.projectsOrWork.map((project, index) => (
                <div key={`project-${index}`} className="group
    relative
    rounded-2xl
    border border-border/60
    bg-background/60
    backdrop-blur-md
    p-6
    space-y-5
    transition-all duration-200
    hover:border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold tracking-wide text-foreground">Project {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="
  bg-background/70
  backdrop-blur-sm
  focus-visible:ring-2
  focus-visible:ring-primary/40
  transition-shadow
"
                      onClick={() => removeProject(index)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={project.title}
                      onChange={(event) =>
                        updateProject(index, "title", event.target.value)
                      }
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Input
                        value={project.type}
                        onChange={(event) =>
                          updateProject(index, "type", event.target.value)
                        }
                        placeholder="Project, Freelance, Case Study"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Link</Label>
                      <Input
                        value={project.link}
                        onChange={(event) =>
                          updateProject(index, "link", event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Description (one per line)</Label>
                    <Textarea
                      value={project.description}
                      onChange={(event) =>
                        updateProject(index, "description", event.target.value)
                      }
                      rows={3}
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Outcomes (one per line)</Label>
                      <Textarea
                        value={project.outcomes}
                        onChange={(event) =>
                          updateProject(index, "outcomes", event.target.value)
                        }
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Skills used (comma separated)</Label>
                    <Input
                      value={project.skillsUsed}
                      onChange={(event) =>
                        updateProject(index, "skillsUsed", event.target.value)
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </section>

          <div
            className="
    relative my-10 h-px w-full
    bg-gradient-to-r
    from-transparent
    via-border/70
    to-transparent
  "
          />
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">Education</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="
    rounded-full
    px-4
    backdrop-blur-md
    bg-background/60
    border-border/60
    hover:bg-primary/10
    hover:border-primary/30
    transition-all
  "
                onClick={addEducation}>
                <Plus className="mr-2 size-4" />
                Add education
              </Button>
            </div>

            {form.education.length === 0 ? (
              <p className="text-sm text-muted-foreground">No education yet.</p>
            ) : (
              form.education.map((edu, index) => (
                <div key={`edu-${index}`} className="group
    relative
    rounded-2xl
    border border-border/60
    bg-background/60
    backdrop-blur-md
    p-6
    space-y-5
    transition-all duration-200
    hover:border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold tracking-wide text-foreground">Education {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="
  bg-background/70
  backdrop-blur-sm
  focus-visible:ring-2
  focus-visible:ring-primary/40
  transition-shadow
"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(event) =>
                        updateEducation(index, "degree", event.target.value)
                      }
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Field of study</Label>
                      <Input
                        value={edu.fieldOfStudy}
                        onChange={(event) =>
                          updateEducation(index, "fieldOfStudy", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(event) =>
                          updateEducation(index, "institution", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={edu.location}
                        onChange={(event) =>
                          updateEducation(index, "location", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start date</Label>
                      <Input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End date</Label>
                      <Input
                        type="date"
                        value={edu.endDate}
                        onChange={(event) =>
                          updateEducation(index, "endDate", event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Grade or score</Label>
                    <Input
                      value={edu.gradeOrScore}
                      onChange={(event) =>
                        updateEducation(
                          index,
                          "gradeOrScore",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Focus areas</Label>
                      <Textarea
                        value={edu.focusAreas}
                        onChange={(event) =>
                          updateEducation(index, "focusAreas", event.target.value)
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          <div
            className="
    relative my-10 h-px w-full
    bg-gradient-to-r
    from-transparent
    via-border/70
    to-transparent
  "
          />
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">Certifications</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="
    rounded-full
    px-4
    backdrop-blur-md
    bg-background/60
    border-border/60
    hover:bg-primary/10
    hover:border-primary/30
    transition-all
  "
                onClick={addCertification}>
                <Plus className="mr-2 size-4" />
                Add certification
              </Button>
            </div>

            {form.certifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No certifications yet.
              </p>
            ) : (
              form.certifications.map((cert, index) => (
                <div key={`cert-${index}`} className="group
    relative
    rounded-2xl
    border border-border/60
    bg-background/60
    backdrop-blur-md
    p-6
    space-y-5
    transition-all duration-200
    hover:border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold tracking-wide text-foreground">Certification {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="
  bg-background/70
  backdrop-blur-sm
  focus-visible:ring-2
  focus-visible:ring-primary/40
  transition-shadow
"
                      onClick={() => removeCertification(index)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={cert.name}
                      onChange={(event) =>
                        updateCertification(index, "name", event.target.value)
                      }
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Issuer</Label>
                      <Input
                        value={cert.issuer}
                        onChange={(event) =>
                          updateCertification(index, "issuer", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={cert.year}
                        onChange={(event) =>
                          updateCertification(index, "year", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Credential ID</Label>
                      <Input
                        value={cert.credentialId}
                        onChange={(event) =>
                          updateCertification(
                            index,
                            "credentialId",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Valid until</Label>
                      <Input
                        type="date"
                        value={cert.validUntil}
                        onChange={(event) =>
                          updateCertification(
                            index,
                            "validUntil",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          <div
            className="
    relative my-10 h-px w-full
    bg-gradient-to-r
    from-transparent
    via-border/70
    to-transparent
  "
          />
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">Awards and honors</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="
    rounded-full
    px-4
    backdrop-blur-md
    bg-background/60
    border-border/60
    hover:bg-primary/10
    hover:border-primary/30
    transition-all
  "
                onClick={addAward}>
                <Plus className="mr-2 size-4" />
                Add award
              </Button>
            </div>

            {form.awardsAndHonors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No awards yet.</p>
            ) : (
              form.awardsAndHonors.map((award, index) => (
                <div key={`award-${index}`} className="group
    relative
    rounded-2xl
    border border-border/60
    bg-background/60
    backdrop-blur-md
    p-6
    space-y-5
    transition-all duration-200
    hover:border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold tracking-wide text-foreground">Award {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="
  bg-background/70
  backdrop-blur-sm
  focus-visible:ring-2
  focus-visible:ring-primary/40
  transition-shadow
"
                      onClick={() => removeAward(index)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={award.title}
                      onChange={(event) =>
                        updateAward(index, "title", event.target.value)
                      }
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Issuer</Label>
                      <Input
                        value={award.issuer}
                        onChange={(event) =>
                          updateAward(index, "issuer", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={award.year}
                        onChange={(event) =>
                          updateAward(index, "year", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={award.description}
                        onChange={(event) =>
                          updateAward(index, "description", event.target.value)
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          <div
            className="
    relative my-10 h-px w-full
    bg-gradient-to-r
    from-transparent
    via-border/70
    to-transparent
  "
          />
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">Publications</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="
    rounded-full
    px-4
    backdrop-blur-md
    bg-background/60
    border-border/60
    hover:bg-primary/10
    hover:border-primary/30
    transition-all
  "
                onClick={addPublication}>
                <Plus className="mr-2 size-4" />
                Add publication
              </Button>
            </div>

            {form.publications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No publications yet.</p>
            ) : (
              form.publications.map((publication, index) => (
                <div key={`publication-${index}`} className="group
    relative
    rounded-2xl
    border border-border/60
    bg-background/60
    backdrop-blur-md
    p-6
    space-y-5
    transition-all duration-200
    hover:border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold tracking-wide text-foreground">Publication {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="
  bg-background/70
  backdrop-blur-sm
  focus-visible:ring-2
  focus-visible:ring-primary/40
  transition-shadow
"
                      onClick={() => removePublication(index)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={publication.title}
                      onChange={(event) =>
                        updatePublication(index, "title", event.target.value)
                      }
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Publisher</Label>
                      <Input
                        value={publication.publisher}
                        onChange={(event) =>
                          updatePublication(
                            index,
                            "publisher",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={publication.year}
                        onChange={(event) =>
                          updatePublication(index, "year", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        value={publication.url}
                        onChange={(event) =>
                          updatePublication(index, "url", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          <div
            className="
    relative my-10 h-px w-full
    bg-gradient-to-r
    from-transparent
    via-border/70
    to-transparent
  "
          />
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">Volunteer experience</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="
    rounded-full
    px-4
    backdrop-blur-md
    bg-background/60
    border-border/60
    hover:bg-primary/10
    hover:border-primary/30
    transition-all
  "
                onClick={addVolunteer}>
                <Plus className="mr-2 size-4" />
                Add volunteer
              </Button>
            </div>

            {form.volunteerExperience.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No volunteer experience yet.
              </p>
            ) : (
              form.volunteerExperience.map((volunteer, index) => (
                <div key={`volunteer-${index}`} className="group
    relative
    rounded-2xl
    border border-border/60
    bg-background/60
    backdrop-blur-md
    p-6
    space-y-5
    transition-all duration-200
    hover:border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold tracking-wide text-foreground">Volunteer {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="
  bg-background/70
  backdrop-blur-sm
  focus-visible:ring-2
  focus-visible:ring-primary/40
  transition-shadow
"
                      onClick={() => removeVolunteer(index)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={volunteer.role}
                      onChange={(event) =>
                        updateVolunteer(index, "role", event.target.value)
                      }
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <Input
                        value={volunteer.organization}
                        onChange={(event) =>
                          updateVolunteer(
                            index,
                            "organization",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={volunteer.location}
                        onChange={(event) =>
                          updateVolunteer(index, "location", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start date</Label>
                      <Input
                        type="date"
                        value={volunteer.startDate}
                        onChange={(event) =>
                          updateVolunteer(index, "startDate", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End date</Label>
                      <Input
                        type="date"
                        value={volunteer.endDate}
                        onChange={(event) =>
                          updateVolunteer(index, "endDate", event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={volunteer.description}
                      onChange={(event) =>
                        updateVolunteer(index, "description", event.target.value)
                      }
                      rows={2}
                    />
                  </div>
                </div>
              ))
            )}
          </section>

          <div
            className="
    relative my-10 h-px w-full
    bg-gradient-to-r
    from-transparent
    via-border/70
    to-transparent
  "
          />
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">Languages</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="
    rounded-full
    px-4
    backdrop-blur-md
    bg-background/60
    border-border/60
    hover:bg-primary/10
    hover:border-primary/30
    transition-all
  "
                onClick={addLanguage}>
                <Plus className="mr-2 size-4" />
                Add language
              </Button>
            </div>

            {form.languages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No languages yet.</p>
            ) : (
              form.languages.map((lang, index) => (
                <div key={`language-${index}`} className="group
    relative
    rounded-2xl
    border border-border/60
    bg-background/60
    backdrop-blur-md
    p-6
    space-y-5
    transition-all duration-200
    hover:border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold tracking-wide text-foreground">Language {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="
  bg-background/70
  backdrop-blur-sm
  focus-visible:ring-2
  focus-visible:ring-primary/40
  transition-shadow
"
                      onClick={() => removeLanguage(index)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2">                    <div className="space-y-2">
                    <Label>Language</Label>
                    <Input
                      value={lang.language}
                      onChange={(event) =>
                        updateLanguage(index, "language", event.target.value)
                      }
                    />
                  </div>
                    <div className="space-y-2">
                      <Label>Proficiency</Label>
                      <Input
                        value={lang.proficiency}
                        onChange={(event) =>
                          updateLanguage(index, "proficiency", event.target.value)
                        }
                        placeholder="Native, Professional"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          <div
            className="
    relative my-10 h-px w-full
    bg-gradient-to-r
    from-transparent
    via-border/70
    to-transparent
  "
          />
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">Additional sections</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="
    rounded-full
    px-4
    backdrop-blur-md
    bg-background/60
    border-border/60
    hover:bg-primary/10
    hover:border-primary/30
    transition-all
  "
                onClick={addAdditionalSection}>
                <Plus className="mr-2 size-4" />
                Add section
              </Button>
            </div>

            {form.additionalSections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No additional sections yet.
              </p>
            ) : (
              form.additionalSections.map((section, index) => (
                <div key={`additional-${index}`} className="group
    relative
    rounded-2xl
    border border-border/60
    bg-background/60
    backdrop-blur-md
    p-6
    space-y-5
    transition-all duration-200
    hover:border-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold tracking-wide text-foreground">Section {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="
  bg-background/70
  backdrop-blur-sm
  focus-visible:ring-2
  focus-visible:ring-primary/40
  transition-shadow
"
                      onClick={() => removeAdditionalSection(index)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={section.title}
                      onChange={(event) =>
                        updateAdditionalSection(index, "title", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={section.content}
                      onChange={(event) =>
                        updateAdditionalSection(
                          index,
                          "content",
                          event.target.value,
                        )
                      }
                      rows={3}
                    />
                  </div>
                </div>
              ))
            )}
          </section>

          <Button
            type="submit"
            disabled={isLoading || !canSubmit}
            className="
    h-11
    rounded-full
    px-8
    gap-2
    bg-primary/90
    text-primary-foreground
    shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)]
    transition-all
    hover:bg-primary
    active:scale-[0.98]
  "
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Create Master Resume
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
