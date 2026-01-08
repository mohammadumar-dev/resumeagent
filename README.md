# ResumeAgent

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**An AI-Driven Resume Optimization and Generation Platform**

ResumeAgent is a sophisticated backend platform that leverages multi-agent AI architecture to transform generic resumes into job-specific, ATS-optimized documents. Built with modern Java technologies and intelligent AI orchestration, it addresses the critical challenge of resume customization in today's competitive job market.

---

## 📋 Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Multi-Agent Pipeline](#multi-agent-pipeline)
- [Data Model](#data-model)
- [Database Schema](#database-schema)
- [Template System](#template-system)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Roadmap](#project-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

ResumeAgent solves a fundamental problem in modern job applications: **qualified candidates are rejected not due to lack of skills, but because their resumes fail to pass Applicant Tracking Systems (ATS)**.

The platform analyzes a candidate's master resume alongside a target job description, then generates a tailored, ATS-compliant resume using a sophisticated multi-agent AI pipeline. The result is a professionally formatted, editable DOCX document that maximizes the chances of passing ATS filters while maintaining factual accuracy.

### Core Principles

- **Separation of Concerns**: AI generates content, templates handle layout, users control edits
- **Deterministic Output**: AI is never responsible for formatting; layout is controlled by templates
- **Cost-Efficient AI**: Small prompts, structured outputs, minimal token usage
- **User Control**: All outputs are editable with full transparency

---

## ❌ The Problem

### Current Challenges

- **Generic Applications**: Job seekers reuse the same resume for all applications
- **ATS Rejection**: Systems filter out qualified candidates due to missing keywords or poor formatting
- **Time-Consuming**: Manual customization for each job posting is impractical
- **AI Limitations**: Existing tools often produce verbose, unstructured, or factually incorrect content
- **Loss of Control**: Users can't easily edit AI-generated outputs

### What ResumeAgent Addresses

1. ❌ Lack of job-specific tailoring → ✅ Automated, intelligent customization
2. ❌ Poor ATS compatibility → ✅ Structured, keyword-optimized output
3. ❌ No structured resume representation → ✅ Canonical JSON data model
4. ❌ High AI costs → ✅ Efficient, model-agnostic token usage
5. ❌ Limited user control → ✅ Fully editable DOCX outputs

---

## ⚡ Key Features

### For Job Seekers

- 📄 **Job-Specific Resumes**: Generate tailored resumes from a single master document
- 🎯 **ATS Optimization**: Ensure keyword alignment and format compatibility
- ✏️ **Fully Editable**: Receive professional DOCX files you can customize
- 🔒 **Privacy-Aware**: Your data stays secure and under your control
- 📊 **Version Tracking**: Maintain multiple resume versions for different roles

### For Developers

- 🏗️ **Modular Architecture**: Clean separation between AI logic and business rules
- 🔌 **Model-Agnostic**: Support for OpenAI, Claude, Llama, and local models via Ollama
- 💰 **Cost-Efficient**: Optimized prompting with minimal token consumption
- 🛠️ **Extensible**: Easy to add new agents, templates, or features
- 📦 **Open Source Ready**: MIT-licensed with comprehensive documentation

### Technical Highlights

- **Multi-Agent Pipeline**: Specialized agents for parsing, analysis, matching, rewriting, and optimization
- **Canonical Data Model**: Structured JSON representation ensures consistency
- **Template-Based Rendering**: FreeMarker + DOCX for professional outputs
- **PostgreSQL Backend**: Robust data persistence with version control
- **Spring Boot REST API**: Modern, scalable backend architecture

---

## 🏛️ Architecture

ResumeAgent employs a **layered, pipeline-based architecture** that separates concerns and maximizes maintainability.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│              (Postman / Next.js Frontend)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Spring Boot REST API                        │
│           (Controllers, DTOs, Validation)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Resume Pipeline Service                        │
│        (Orchestrates Multi-Agent Workflow)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│            Multi-Agent AI Processing                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Resume     │  │ Job Desc     │  │  Matching    │       │
│  │   Parser     │→ │  Analyzer    │→ │   Agent      │       │
│  └──────────────┘  └──────────────┘  └──────┬───────┘       │
│                                             │               │
│  ┌──────────────┐  ┌──────────────┐         │               │
│  │ ATS          │  │  Resume      │  ◀──────┘               │
│  │ Optimizer    │← │  Rewriter    │                         │
│  └──────┬───────┘  └──────────────┘                         │
└─────────┼───────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────┐
│           Structured Resume JSON                            │
│        (Canonical Data Representation)                      │
└─────────┬───────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────┐
│         Template Renderer                                   │
│     (FreeMarker + docx4j / Apache POI)                      │
└─────────┬───────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────┐
│       Final Editable Resume (DOCX)                          │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Single Responsibility**: Each agent handles one specific task
2. **Immutable Data Flow**: Agents transform data without side effects
3. **Template Independence**: Resume JSON can render to any format
4. **Testability**: Each layer can be tested independently
5. **Extensibility**: New agents or templates can be added without refactoring

---

## 🔧 Technology Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 21 (LTS) | Core language with modern concurrency features |
| **Spring Boot** | 3.x | REST API, dependency injection, auto-configuration |
| **Spring AI** | Latest | Unified AI model abstraction |
| **Spring Data JPA** | Latest | Data persistence layer |
| **Hibernate** | Latest | ORM and entity management |

### AI & LLM Integration

| Service | Purpose |
|---------|---------|
| **OpenRouter** | Model aggregation (OpenAI, Claude, Llama, Groq) |
| **Spring AI OpenAI** | Direct OpenAI integration |
| **Ollama** | Local LLM support for offline/privacy-focused scenarios |

### Database

| Technology | Purpose |
|-----------|---------|
| **PostgreSQL** | 15+ | Primary data store |
| **Liquibase** | Schema versioning and migrations |
| **Flyway** | Alternative migration tool (optional) |

### Document Generation

| Technology | Purpose |
|-----------|---------|
| **FreeMarker** | Template engine for dynamic content |
| **docx4j** | DOCX manipulation and generation |
| **Apache POI** | Alternative DOCX library |

### Frontend (Planned)

| Technology | Purpose |
|-----------|---------|
| **Next.js** | React-based frontend framework |
| **Shadcn UI** | Component library |
| **TypeScript** | Type-safe frontend development |

---

## 🤖 Multi-Agent Pipeline

ResumeAgent uses a **sequential multi-agent architecture** where each agent performs a specialized task. This design ensures accuracy, maintainability, and debuggability.

### Pipeline Flow

```
Master Resume + Job Description
        ↓
    ┌─────────────────────┐
    │  Resume Parser      │ → Extracts structured data from resume
    └─────────┬───────────┘
              ↓
    ┌─────────────────────┐
    │  Job Description    │ → Analyzes job requirements
    │  Analyzer           │
    └─────────┬───────────┘
              ↓
    ┌─────────────────────┐
    │  Matching Agent     │ → Compares skills and requirements
    └─────────┬───────────┘
              ↓
    ┌─────────────────────┐
    │  Resume Rewriter    │ → Tailors content to job
    └─────────┬───────────┘
              ↓
    ┌─────────────────────┐
    │  ATS Optimizer      │ → Ensures ATS compatibility
    └─────────┬───────────┘
              ↓
    Structured Resume JSON
```

### Agent Descriptions

#### 1. Resume Parser Agent

**Purpose**: Extract structured data from the master resume

**Input**: Raw resume text (PDF, DOCX, or plain text)

**Output**:
```json
{
  "skills": ["Java", "Spring Boot", "PostgreSQL"],
  "experience": [{...}],
  "projects": [{...}],
  "education": [{...}]
}
```

**Responsibilities**:
- Extract facts only—no rewriting
- Identify sections and categorize content
- Preserve original wording and achievements

---

#### 2. Job Description Analyzer Agent

**Purpose**: Understand job requirements and expectations

**Input**: Job description text

**Output**:
```json
{
  "requiredSkills": ["Java", "Microservices", "AWS"],
  "preferredSkills": ["Docker", "Kubernetes"],
  "keywords": ["RESTful APIs", "Agile", "CI/CD"],
  "seniorityLevel": "Mid-Level",
  "companyValues": ["Innovation", "Teamwork"]
}
```

**Responsibilities**:
- Extract technical requirements
- Identify industry-specific keywords
- Determine seniority level and expectations

---

#### 3. Matching Agent

**Purpose**: Compare resume data with job requirements

**Input**:
- Parsed resume
- Job analysis

**Output**:
```json
{
  "matchedSkills": ["Java", "Spring Boot"],
  "missingSkills": ["AWS", "Kubernetes"],
  "matchScore": 75,
  "focusAreas": ["Emphasize microservices experience", "Highlight teamwork"]
}
```

**Note**: This agent uses **deterministic logic**, not AI, ensuring consistent and explainable matching.

---

#### 4. Resume Rewrite Agent

**Purpose**: Rewrite resume content using job-specific language

**Rules**:
- ✅ Rephrase existing facts
- ✅ Emphasize matched skills
- ✅ Use job description terminology
- ❌ Never fabricate experience
- ❌ Never add skills not present in original resume

**Output**: Enhanced resume text (still unformatted)

---

#### 5. ATS Optimization Agent

**Purpose**: Ensure resume passes ATS filters

**Responsibilities**:
- Inject critical keywords naturally
- Use clean section headings
- Avoid tables, graphics, and complex formatting
- Ensure plain text compatibility
- Validate file structure

**Output**: ATS-ready resume content

---

## 📊 Data Model

ResumeAgent uses a **canonical JSON structure** as the single source of truth. This structure is:

- ✅ ATS-compatible
- ✅ Template-independent
- ✅ Versionable
- ✅ User-editable
- ✅ AI-safe (prevents hallucinations)

### Root Resume Structure

```json
{
  "metadata": {},
  "header": {},
  "summary": "",
  "skills": {},
  "experience": [],
  "projects": [],
  "education": [],
  "certifications": [],
  "achievements": [],
  "publications": [],
  "links": {},
  "additional": {}
}
```

### Key Sections

#### 1. Metadata (Internal Use Only)

```json
{
  "metadata": {
    "resumeId": "uuid",
    "userId": "uuid",
    "generatedAt": "2026-01-01T18:30:00Z",
    "jobTitleTargeted": "Backend Developer",
    "companyTargeted": "Infosys",
    "aiModelsUsed": ["meta-llama/llama-3.3-70b-instruct"],
    "version": 3,
    "language": "en",
    "atsOptimized": true
  }
}
```

---

#### 2. Header Section

```json
{
  "header": {
    "fullName": "Mohammad Umar Shaikh",
    "location": "Pune, India",
    "phone": "+91 9607056810",
    "email": "mohammadumar.dev@gmail.com",
    "headline": "Software Developer | Java & Spring Boot",
    "links": {
      "linkedin": "https://linkedin.com/in/shaikh-mohammad-umar",
      "github": "https://github.com/mohammadumar-dev",
      "portfolio": null
    }
  }
}
```

---

#### 3. Professional Summary

```json
{
  "summary": "Software Developer with 1+ year of experience building scalable backend systems and REST APIs using Java and Spring Boot. Strong foundation in database design, concurrency, and system architecture. Experienced in Agile development, production deployments, and performance optimization."
}
```

---

#### 4. Skills Section (Categorized)

```json
{
  "skills": {
    "languages": ["Java", "Python", "JavaScript", "TypeScript", "SQL"],
    "frameworks": ["Spring Boot", "Spring Security", "JPA / Hibernate"],
    "databases": ["PostgreSQL", "MySQL"],
    "cloud_devops": ["Docker", "AWS (basic)", "Kubernetes (basic)"],
    "tools": ["Git", "GitHub", "Postman", "IntelliJ IDEA", "Maven", "Flyway"],
    "concepts": [
      "REST APIs", "Microservices", "Service-Oriented Architecture",
      "Multithreading", "Concurrency", "OOP", "Design Patterns",
      "System Design", "Database Optimization", "SDLC", "Agile Methodologies"
    ]
  }
}
```

**Benefits**:
- Enables smart keyword injection
- Prevents duplication
- Allows flexible rendering (grouped or flat)

---

#### 5. Professional Experience

```json
{
  "experience": [
    {
      "role": "Software Developer",
      "company": "Data Innovation Technologies Pvt Ltd",
      "location": "Pune, India",
      "employmentType": "Full-time",
      "startDate": "2025-03",
      "endDate": "Present",
      "technologies": ["Java", "Spring Boot", "PostgreSQL", "JPA", "Docker"],
      "responsibilities": [
        "Developed scalable backend APIs using Java and Spring Boot serving production traffic.",
        "Designed PostgreSQL schemas and optimized complex queries using JPA and Hibernate.",
        "Participated in architectural discussions evaluating trade-offs in distributed systems.",
        "Conducted code reviews and mentored junior developers on Spring best practices."
      ],
      "achievements": [
        "Improved API response time by 30% through query optimization.",
        "Reduced production bugs by introducing structured exception handling."
      ]
    }
  ]
}
```

---

#### 6. Projects Section

```json
{
  "projects": [
    {
      "name": "PathLab – Pathology Laboratory Management System",
      "type": "Enterprise Backend System",
      "technologies": ["Java", "Spring Boot", "PostgreSQL", "JPA", "JWT", "Docker", "Flyway"],
      "description": "End-to-end laboratory information management system with role-based access and workflow automation.",
      "highlights": [
        "Implemented JWT-based authentication and RBAC for Admin, Lab Tech, Doctor, and Patient roles.",
        "Optimized database queries and applied caching to improve performance by 40%.",
        "Integrated email notifications and PDF generation using Freemarker.",
        "Applied optimistic and pessimistic locking strategies for concurrent transactions."
      ]
    }
  ]
}
```

---

#### 7. Education

```json
{
  "education": [
    {
      "degree": "Bachelor of Engineering",
      "field": "Computer Engineering",
      "institution": "University Name",
      "location": "India",
      "startYear": 2020,
      "endYear": 2024
    }
  ]
}
```

---

#### 8. Additional Sections

```json
{
  "certifications": [{...}],
  "achievements": ["Solved 300+ DSA problems on coding platforms"],
  "publications": [{...}],
  "additional": {
    "openSource": ["Contributor to ResumeAgent"],
    "languagesSpoken": ["English", "Hindi"]
  }
}
```

---

## 🗄️ Database Schema

ResumeAgent uses a **normalized PostgreSQL schema** designed for scalability, version control, and data integrity.

### Entity Relationship Overview

```
users (1) ──── (M) resumes (1) ──── (M) resume_versions
                     │
                     ├──── (1) resume_header
                     ├──── (1) resume_summary
                     ├──── (M) resume_skills
                     ├──── (M) resume_experience ──── (M) resume_experience_bullets
                     ├──── (M) resume_projects ──── (M) resume_project_highlights
                     ├──── (M) resume_education
                     ├──── (M) resume_certifications
                     ├──── (M) resume_achievements
                     ├──── (M) resume_publications
                     ├──── (M) resume_additional_sections
                     └──── (1) resume_metadata
```

### Core Tables

#### 1. `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | User ID |
| `full_name` | VARCHAR(150) | User full name |
| `email` | VARCHAR(150) | Login / contact |
| `password_hash` | VARCHAR(255) | Password |
| `user_role` | VARCHAR(10) | USER / ADMIN |
| `plan` | VARCHAR(20) | FREE / PRO (future) |
| `resume_generation_limit` | INT | Allowed generations |
| `resume_generation_used` | INT | Used so far |
| `password_hash` | VARCHAR(255) | Hashed password |
| `is_email_active` | BOOLEAN | Email verification status |
| `created_at` | TIMESTAMP | Account creation |
| `updated_at` | TIMESTAMP | Last update |

---  

#### 2. `resumes`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Resume ID |
| `user_id` | UUID (FK) | Owner |
| `job_title_targeted` | VARCHAR(150) | Target role |
| `company_targeted` | VARCHAR(150) | Target company |
| `current_version` | INT | Active version |
| `created_at` | TIMESTAMP | Created |
| `updated_at` | TIMESTAMP | Updated |

---

#### 3. `resume_versions`

**Critical for rollback and version control**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Version ID |
| `resume_id` | UUID (FK) | Parent resume |
| `version_number` | INT | Version number |
| `resume_json` | JSONB | Full canonical resume JSON |
| `source` | VARCHAR(50) | AI / USER / IMPORT |
| `created_at` | TIMESTAMP | Created |

**Note**: This table alone enables full version history and rollback capabilities.

---

#### 4. `resume_header`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Row ID |
| `resume_id` | UUID (FK) | Resume |
| `full_name` | VARCHAR(150) | Name |
| `location` | VARCHAR(150) | City, country |
| `phone` | VARCHAR(50) | Phone |
| `email` | VARCHAR(150) | Email |
| `headline` | VARCHAR(200) | Short title |
| `linkedin` | TEXT | LinkedIn URL |
| `github` | TEXT | GitHub URL |
| `portfolio` | TEXT | Portfolio URL |

---

#### 5. `resume_summary`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Row ID |
| `resume_id` | UUID (FK) | Resume |
| `summary_text` | TEXT | Professional summary |

---

#### 6. `resume_skills`

**Categorized skills for smart keyword injection**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Row ID |
| `resume_id` | UUID (FK) | Resume |
| `category` | VARCHAR(50) | languages / frameworks / tools / concepts |
| `skill` | VARCHAR(100) | Skill name |

**Example rows**:
```
| id | resume_id | category  | skill       |
|----|-----------|-----------|-------------|
| 1  | abc-123   | languages | Java        |
| 2  | abc-123   | frameworks| Spring Boot |
| 3  | abc-123   | tools     | Docker      |
```

---

#### 7. `resume_experience`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Experience ID |
| `resume_id` | UUID (FK) | Resume |
| `role` | VARCHAR(150) | Job title |
| `company` | VARCHAR(150) | Company |
| `location` | VARCHAR(150) | Location |
| `employment_type` | VARCHAR(50) | Full-time / Intern |
| `start_date` | DATE | Start |
| `end_date` | DATE | End or NULL |
| `technologies` | TEXT[] | Tech stack |

---

#### 8. `resume_experience_bullets`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Bullet ID |
| `experience_id` | UUID (FK) | Parent experience |
| `bullet_type` | VARCHAR(50) | responsibility / achievement |
| `content` | TEXT | Bullet text |

**Why separate bullets?**
- Enables individual bullet reordering
- Allows type-based filtering (responsibilities vs achievements)
- Simplifies AI rewriting of specific bullets

---

#### 9. `resume_projects`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Project ID |
| `resume_id` | UUID (FK) | Resume |
| `name` | VARCHAR(200) | Project name |
| `type` | VARCHAR(100) | Project type |
| `description` | TEXT | Short description |
| `technologies` | TEXT[] | Tech stack |

---

#### 10. `resume_project_highlights`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Highlight ID |
| `project_id` | UUID (FK) | Project |
| `content` | TEXT | Highlight bullet |

---

#### 11. `resume_education`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Education ID |
| `resume_id` | UUID (FK) | Resume |
| `degree` | VARCHAR(150) | Degree |
| `field` | VARCHAR(150) | Field |
| `institution` | VARCHAR(200) | College |
| `location` | VARCHAR(150) | Location |
| `start_year` | INT | Start |
| `end_year` | INT | End |

---

#### 12. `resume_certifications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Certification ID |
| `resume_id` | UUID (FK) | Resume |
| `name` | VARCHAR(200) | Cert name |
| `issuer` | VARCHAR(200) | Issuer |
| `year` | INT | Year |

---

#### 13. `resume_achievements`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Achievement ID |
| `resume_id` | UUID (FK) | Resume |
| `content` | TEXT | Achievement |

---

#### 14. `resume_publications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Publication ID |
| `resume_id` | UUID (FK) | Resume |
| `title` | VARCHAR(200) | Title |
| `platform` | VARCHAR(100) | Medium, Blog |
| `url` | TEXT | Link |

---

#### 15. `resume_additional_sections`

**Extension point for custom sections**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Row ID |
| `resume_id` | UUID (FK) | Resume |
| `section_name` | VARCHAR(100) | Custom section |
| `content` | TEXT | Value |

**Example**:
```
| section_name      | content                                    |
|-------------------|--------------------------------------------|
| openSource        | Contributor to ResumeAgent                 |
| languagesSpoken   | English, Hindi                             |
| volunteer         | Taught programming to underprivileged kids |
```

---

#### 16. `resume_metadata`

| Column | Type | Description |
|--------|------|-------------|
| `resume_id` | UUID (PK/FK) | Resume |
| `generated_at` | TIMESTAMP | AI generation |
| `language` | VARCHAR(20) | Language |
| `ats_optimized` | BOOLEAN | ATS flag |
| `ai_models_used` | TEXT[] | Models |
| `pipeline_version` | VARCHAR(20) | Pipeline version |

---

#### 17. `resume_agent_logs` (Optional but Powerful)

**Enables debugging, auditing, and research**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Log ID |
| `user_id` | UUID (FK → users.id) | Who |
| `resume_id` | UUID (FK) | Resume |
| `agent_name` | VARCHAR(100) | Parser / Matcher / Rewriter |
| `tokens_input` | INT | Prompt tokens |
| `created_at` | TIMESTAMP | Time |

**Use cases**:
- Debug AI agent behavior
- Analyze prompt effectiveness
- Improve AI training
- Audit AI decisions

---

### Security & Authentication Tables

#### 18. `email_verification_tokens`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Token record ID |
| `user_id` | UUID (FK) | Associated user |
| `token` | VARCHAR(255) | Secure random token (hashed) |
| `expires_at` | TIMESTAMP | Token expiry time |
| `used` | BOOLEAN | Whether token is used |
| `created_at` | TIMESTAMP | Creation time |
| `used_at` | TIMESTAMP | Verification timestamp |

---

#### 19. `password_reset_tokens`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Token ID |
| `user_id` | UUID (FK) | Associated user |
| `token` | VARCHAR(255) | Secure reset token (hashed) |
| `expires_at` | TIMESTAMP | Expiration time |
| `used` | BOOLEAN | Whether token was used |
| `created_at` | TIMESTAMP | Created |
| `used_at` | TIMESTAMP | When reset completed |
| `ip_address` | VARCHAR(45) | Request IP (optional) |
| `user_agent` | TEXT | Browser/device (optional) |

---

#### 20. `password_history`

**Prevents password reuse for security**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Record ID |
| `user_id` | UUID (FK) | User |
| `password_hash` | VARCHAR(255) | Hashed password |
| `created_at` | TIMESTAMP | When password was set |

---

#### 21. `refresh_tokens`

| Column                 | Type         | Description                                           |
| ---------------------- | ------------ | ----------------------------------------------------- |
| `id`                   | UUID (PK)    | Refresh token ID                                      |
| `user_id`              | UUID (FK)    | Associated user                                       |
| `token_hash`           | VARCHAR(255) | Hashed refresh token (bcrypt/argon2, never plaintext) |
| `expires_at`           | TIMESTAMP    | Token expiration time                                 |
| `revoked`              | BOOLEAN      | Whether the token has been revoked                    |
| `revoked_at`           | TIMESTAMP    | When the token was revoked                            |
| `replaced_by_token_id` | UUID (FK)    | Token that replaced this one during rotation          |
| `ip_address`           | VARCHAR(45)  | IP address where token was issued                     |
| `user_agent`           | TEXT         | Browser / device user agent                           |
| `created_at`           | TIMESTAMP    | Token creation timestamp                              |
| `last_used_at`         | TIMESTAMP    | Last time the token was used                          |

---

### Why This Schema Works

✅ **Normalized**: Eliminates data redundancy  
✅ **Scalable**: Handles millions of resumes efficiently  
✅ **Versionable**: Full history tracking with rollback  
✅ **Extensible**: Easy to add new sections or fields  
✅ **ATS-Friendly**: Structure mirrors resume logic  
✅ **Debuggable**: Agent logs enable troubleshooting  
✅ **Secure**: Proper token management and password handling

---

## 📝 Template System

ResumeAgent uses **DOCX templates with FreeMarker (FTL) placeholders** to ensure professional, ATS-compatible output.

### Why DOCX + FreeMarker?

| Benefit | Explanation |
|---------|-------------|
| ✅ **Universally Accepted** | DOCX is the industry standard |
| ✅ **Fully Editable** | Users can customize in Microsoft Word, Google Docs, LibreOffice |
| ✅ **ATS-Friendly** | Simple structure passes ATS parsers |
| ✅ **Template Flexibility** | Multiple templates for different industries |
| ✅ **Version Control** | Templates can be tracked in Git |

### Template Architecture

```
templates/
├── classic/
│   ├── template.docx          # DOCX with FTL placeholders
│   └── preview.jpg            # Template preview
├── modern/
│   ├── template.docx
│   └── preview.jpg
└── ats-optimized/
    ├── template.docx
    └── preview.jpg
```

### FreeMarker Placeholder Example

```xml
<!-- Inside template.docx (simplified XML) -->
<w:p>
  <w:r>
    <w:t>${header.fullName}</w:t>
  </w:r>
</w:p>

<w:p>
  <w:r>
    <w:t>${header.location} | ${header.phone} | ${header.email}</w:t>
  </w:r>
</w:p>

<!-- Professional Summary -->
<w:p>
  <w:r>
    <w:t>${summary}</w:t>
  </w:r>
</w:p>

<!-- Experience Loop -->
<#list experience as exp>
  <w:p>
    <w:r>
      <w:t>${exp.role} – ${exp.company}</w:t>
    </w:r>
  </w:p>
  
  <#list exp.responsibilities as bullet>
    <w:p>
      <w:r>
        <w:t>• ${bullet}</w:t>
      </w:r>
    </w:p>
  </#list>
</#list>
```

### Rendering Process

1. **Load Template**: Read DOCX template file
2. **Parse JSON**: Convert resume JSON to FreeMarker data model
3. **Inject Data**: Replace placeholders with actual content
4. **Generate DOCX**: Use docx4j or Apache POI to create final file
5. **Return to User**: Provide download link

### Template Rules

**ATS Compatibility Guidelines:**

- ✅ Use plain text (no text boxes or WordArt)
- ✅ Use standard fonts (Arial, Calibri, Times New Roman)
- ✅ Use simple bullet points
- ✅ Avoid tables for layout
- ✅ Use clear section headers
- ❌ No images or graphics
- ❌ No headers/footers with critical info
- ❌ No columns or complex layouts

---

## 🚀 Getting Started

### Prerequisites

- **Java 21** (LTS)
- **Maven** 3.8+
- **PostgreSQL** 15+
- **Node.js** 18+ (for frontend)
- **Docker** (optional, for containerization)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/resume-agent.git
cd resume-agent
```

#### 2. Configure Database

Create a PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE resume_agent;
CREATE USER resume_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE resume_agent TO resume_user;
```

#### 3. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/resume_agent
spring.datasource.username=resume_user
spring.datasource.password=your_password

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

# Liquibase
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml

# AI Configuration
spring.ai.openai.api-key=${OPENAI_API_KEY}
# OR
openrouter.api-key=${OPENROUTER_API_KEY}

# Server Configuration
server.port=8080
```

#### 4. Set Environment Variables

```bash
export OPENAI_API_KEY=your_openai_key
# OR
export OPENROUTER_API_KEY=your_openrouter_key
```

#### 5. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run

# OR build Docker image
docker build -t resume-agent:latest .
docker run -p 8080:8080 resume-agent:latest
```

#### 6. Access the API

```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "version": "1.0.0"
}
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:8080/api/v1
```

### Endpoints

#### 1. Generate Resume

**POST** `/resumes/generate`

**Request Body:**
```json
{
  "masterResume": "base64_encoded_or_text",
  "jobDescription": "Job description text",
  "userId": "uuid",
  "targetJobTitle": "Backend Developer",
  "targetCompany": "Infosys"
}
```

**Response:**
```json
{
  "resumeId": "uuid",
  "downloadUrl": "/api/v1/resumes/uuid/download",
  "status": "SUCCESS",
  "metadata": {
    "generatedAt": "2026-01-03T10:30:00Z",
    "atsOptimized": true,
    "aiModel": "meta-llama/llama-3.3-70b-instruct"
  }
}
```

---

#### 2. Download Resume

**GET** `/resumes/{resumeId}/download`

**Response**: DOCX file download

---

#### 3. Get Resume Versions

**GET** `/resumes/{resumeId}/versions`

**Response:**
```json
{
  "resumeId": "uuid",
  "currentVersion": 3,
  "versions": [
    {
      "versionNumber": 1,
      "createdAt": "2026-01-01T10:00:00Z",
      "source": "AI"
    },
    {
      "versionNumber": 2,
      "createdAt": "2026-01-02T14:30:00Z",
      "source": "USER"
    },
    {
      "versionNumber": 3,
      "createdAt": "2026-01-03T09:15:00Z",
      "source": "AI"
    }
  ]
}
```

---

#### 4. Rollback to Version

**POST** `/resumes/{resumeId}/rollback`

**Request Body:**
```json
{
  "versionNumber": 2
}
```

---

#### 5. Get User Resumes

**GET** `/users/{userId}/resumes`

**Response:**
```json
{
  "userId": "uuid",
  "resumes": [
    {
      "resumeId": "uuid",
      "jobTitle": "Backend Developer",
      "company": "Infosys",
      "createdAt": "2026-01-01T10:00:00Z",
      "currentVersion": 2
    }
  ]
}
```
---

## 📞 Contact & Support

**Author**: Mohammad Umar Shaikh

- 📧 Email: [mohammadumar.dev@gmail.com](mailto:mohammadumar.dev@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/shaikh-mohammad-umar](https://linkedin.com/in/shaikh-mohammad-umar)
- 🐙 GitHub: [github.com/mohammadumar-dev](https://github.com/mohammadumar-dev)

**Project Repository**: [github.com/your-username/resume-agent](https://github.com/your-username/resume-agent)

### Support

- 🐛 **Bug Reports**: Open an issue with the `bug` label
- 💡 **Feature Requests**: Open an issue with the `enhancement` label
- ❓ **Questions**: Use GitHub Discussions or open an issue with the `question` label

---

## 🙏 Acknowledgments

- **Spring Team** for the excellent Spring Boot and Spring AI frameworks
- **OpenAI, Anthropic, Meta** for powerful LLM APIs
- **FreeMarker Team** for the template engine
- **Apache POI & docx4j** contributors for DOCX manipulation libraries
- **PostgreSQL Community** for a robust database system
- **Open Source Community** for inspiration and tools

---

## 📊 Project Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
![Version](https://img.shields.io/badge/version-1.0.0--alpha-blue)
![Issues](https://img.shields.io/github/issues/your-username/resume-agent)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

---

## 🔮 Vision

ResumeAgent aims to become the **industry-standard open-source platform** for AI-driven resume optimization. Our goal is to empower job seekers worldwide with technology that:

- Levels the playing field in competitive job markets
- Eliminates ATS-related rejections for qualified candidates
- Provides transparency and control over AI-generated content
- Remains accessible, affordable, and privacy-focused

**Join us in building the future of job applications!**

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/mohammadumar-dev">Mohammad Umar Shaikh | Yunus Bagewadi</a>
</p>

<p align="center">
  <sub>⭐ Star this repo if you find it helpful!</sub>
</p>
