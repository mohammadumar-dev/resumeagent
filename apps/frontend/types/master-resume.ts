import type { CommonResponse } from "@/types/auth"

/* ===================== Nested Types ===================== */

export interface MasterResumeMetadata {
  version?: string
}

export interface MasterResumeLinks {
  linkedin?: string
  github?: string
  portfolio?: string
  website?: string
  other?: string[]
}

export interface MasterResumeHeader {
  fullName?: string
  headline?: string
  location?: string
  email?: string
  phone?: string
  links?: MasterResumeLinks
}

export interface MasterResumeCoreSkills {
  technical?: string[]
  professional?: string[]
  soft?: string[]
  tools?: string[]
  domainSpecific?: string[]
}

/* ===================== Experience ===================== */

export interface MasterResumeExperience {
  role?: string
  organization?: string
  location?: string
  employmentType?: string
  startDate?: string   // ISO string for LocalDate
  endDate?: string     // ISO string for LocalDate
  responsibilities?: string[]
  context?: string
  achievements?: string[]
  skillsUsed?: string[]
}

/* ===================== Projects ===================== */

export interface MasterResumeProjectOrWork {
  title?: string
  type?: string
  link?: string
  description?: string[]
  outcomes?: string[]
  skillsUsed?: string[]
}

/* ===================== Education ===================== */

export interface MasterResumeEducation {
  degree?: string
  fieldOfStudy?: string
  institution?: string
  location?: string
  startDate?: string   // ISO string (LocalDate)
  endDate?: string     // ISO string (LocalDate)
  gradeOrScore?: string
  focusAreas?: string[]
}

/* ===================== Certifications ===================== */

export interface MasterResumeCertification {
  name?: string
  issuer?: string
  year?: number
  credentialId?: string
  validUntil?: string  // ISO string (LocalDate)
}

/* ===================== Awards ===================== */

export interface MasterResumeAwardAndHonor {
  title?: string
  issuer?: string
  year?: number
  description?: string[]   // IMPORTANT: now array
}

/* ===================== Publications ===================== */

export interface MasterResumePublication {
  title?: string
  publisher?: string
  year?: number
  url?: string
}

/* ===================== Volunteering ===================== */

export interface MasterResumeVolunteerExperience {
  role?: string
  organization?: string
  location?: string
  startDate?: string
  endDate?: string
  description?: string[]   // IMPORTANT: now array
}

/* ===================== Languages ===================== */

export interface MasterResumeLanguage {
  language?: string
  proficiency?: string
}

/* ===================== Additional Sections ===================== */

export interface MasterResumeAdditionalSection {
  title?: string
  content?: string[]   // IMPORTANT: now array
}

/* ===================== Main Request ===================== */

export interface CreateAndUpdateMasterResumeRequest {
  metadata?: MasterResumeMetadata
  header?: MasterResumeHeader
  summary?: string
  coreSkills?: MasterResumeCoreSkills
  experience?: MasterResumeExperience[]
  projectsOrWork?: MasterResumeProjectOrWork[]
  education?: MasterResumeEducation[]
  certifications?: MasterResumeCertification[]
  awardsAndHonors?: MasterResumeAwardAndHonor[]
  publications?: MasterResumePublication[]
  volunteerExperience?: MasterResumeVolunteerExperience[]
  languages?: MasterResumeLanguage[]
  professionalAffiliations?: string[]
  additionalSections?: MasterResumeAdditionalSection[]
}

export interface ViewMasterResumeResponse {
  metadata?: MasterResumeMetadata
  header?: MasterResumeHeader
  summary?: string
  coreSkills?: MasterResumeCoreSkills
  experience?: MasterResumeExperience[]
  projectsOrWork?: MasterResumeProjectOrWork[]
  education?: MasterResumeEducation[]
  certifications?: MasterResumeCertification[]
  awardsAndHonors?: MasterResumeAwardAndHonor[]
  publications?: MasterResumePublication[]
  volunteerExperience?: MasterResumeVolunteerExperience[]
  languages?: MasterResumeLanguage[]
  professionalAffiliations?: string[]
  additionalSections?: MasterResumeAdditionalSection[]
}
/* ===================== Response ===================== */

export interface MasterResumeViewResponse {
  resumeJson: ViewMasterResumeResponse
}

export type MasterResumeCommonResponse = CommonResponse
