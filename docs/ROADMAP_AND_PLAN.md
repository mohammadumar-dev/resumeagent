# ResumeAgent – Revised Development Roadmap & Plan

**Timeline:** ~25 days (Now → 30 Jan 2026)

---

## 0. Strategic Reframe (Very Important)

With the current schema, **ResumeAgent** is officially:

- Multi-tenant SaaS  
- Usage-metered  
- Admin-governed  
- Audit-ready  

**Revised priority order:**

1. Identity & access control (USER / ADMIN)  
2. Resume pipeline (core value)  
3. Usage limits & protection  
4. Rendering & downloads  
5. Frontend UX  
6. Hosting & production readiness  

> We do **not** build everything at once.

---

## 1. High-Level Phase Breakdown

| Phase | Days | Focus | Outcome |
|------|------|-------|---------|
| Phase 0 | Day 1 | Repo, infra, hosting decisions | Stable foundation |
| Phase 1 | Day 2–5 | Auth + User/Admin system | Secure access |
| Phase 2 | Day 6–10 | Resume core + DB integration | Resume persistence |
| Phase 3 | Day 11–15 | AI multi-agent pipeline | Core intelligence |
| Phase 4 | Day 16–18 | DOCX rendering | Real output |
| Phase 5 | Day 19–22 | Frontend (USER + ADMIN) | Usable product |
| Phase 6 | Day 23–25 | Hosting, limits, polish | Production-ready |

---

## 2. Phase 0 – Foundation & Hosting Decisions (Day 1)

### Goals
- Lock infrastructure early (avoid migration pain)
- Avoid overengineering

### Decisions (Recommended)
- **Frontend:** Vercel (Next.js native support)
- **Backend:** Render or Railway (Railway preferred for Postgres apps)
- **Database:** Neon (PostgreSQL, serverless, free-tier friendly)

### Repo Structure
```
resume-agent/
 ├─ backend/        (Spring Boot)
 ├─ frontend/       (Next.js + shadcn)
 ├─ docs/
 ├─ infra/
```

### Deliverables
- GitHub repository created
- Spring Boot app runs locally
- Next.js app deployed to Vercel
- Neon DB connected (even if unused)

---

## 3. Phase 1 – Authentication, Roles & Security (Day 2–5)

This phase protects **AI cost, data, and system abuse**.

### Day 2 – User Entity & Auth Base
- Implement `users` table
- BCrypt password hashing
- JWT-based authentication
- Login & register APIs

### Day 3 – Roles & Guards
- USER vs ADMIN roles
- Method-level authorization
- Blocked user enforcement
- Email verification check

### Day 4 – Email Verification & Password Reset
- `email_verification_tokens`
- `password_reset_tokens`
- Expiry + one-time use
- Email sending mocked/logged

### Day 5 – Admin Foundations
Admin APIs:
```
GET    /admin/users
PATCH  /admin/users/{id}/block
PATCH  /admin/users/{id}/role
```

**End of Phase 1**
- Secure multi-user system
- Admin governance in place
- No resume logic yet — by design

---

## 4. Phase 2 – Resume Core & Database Integration (Day 6–10)

### Day 6 – Resume Lifecycle
- Integrate `resumes` table
- One resume per job/company
- Ownership enforcement

### Day 7 – Resume Versions (Critical)
- `resume_versions` table
- Canonical JSON stored in `JSONB`
- Version increment logic
- Full rollback support

### Day 8 – Resume Metadata
- `resume_metadata`
- Track pipeline version, models, ATS flag

### Day 9 – Resume Subsections (Partial Persistence)
Persist:
- `resume_header`
- `resume_summary`
- `resume_skills`

Other sections remain JSON-only initially.

### Day 10 – User APIs
```
POST /resumes
POST /resumes/{id}/generate
GET  /resumes
GET  /resumes/{id}/versions
```

**End of Phase 2**
- Resume data structured
- Versioning stable
- Database is source of truth

---

## 5. Phase 3 – Multi-Agent AI Pipeline (Day 11–15)

### Day 11 – Pipeline Orchestrator
- Sequential execution
- Shared context object
- Failure isolation

### Day 12 – Resume Parser Agent
- Input: raw resume text
- Output: structured JSON
- No rewriting, no assumptions

### Day 13 – JD Analyzer + Matching Agent
- JD Analyzer (AI)
- Matching Agent (pure Java logic)
- Output: matched & missing skills

### Day 14 – Rewrite + ATS Agents
- Rewrite with constraints
- ATS cleanup
- Heading normalization

### Day 15 – Agent Logging
- `resume_agent_logs`
- Token counts, model used, agent name
- Enables debugging & cost analysis

**End of Phase 3**
- Modular, auditable AI
- No hallucination-driven behavior

---

## 6. Phase 4 – DOCX Rendering System (Day 16–18)

### Day 16 – Template Design
- Single clean DOCX template
- No tables, icons, or graphics
- FreeMarker placeholders only

### Day 17 – Renderer Service
- Inject JSON → DOCX
- Validate editability in Word

### Day 18 – Download API
```
GET /resumes/{id}/download?version=X
```

**End of Phase 4**
- ATS-friendly resumes
- Editable DOCX output
- Recruiter-approved formatting

---

## 7. Phase 5 – Frontend (USER + ADMIN) (Day 19–22)

### USER Features
- Auth (login/register)
- Resume + JD input
- Generate resume
- Download DOCX
- View versions

### ADMIN Features
- User list
- Block/unblock users
- View usage limits

### Tech
- Next.js (App Router)
- shadcn UI
- Server actions or API calls

> **Rule:** No AI logic in frontend. Ever.

---

## 8. Phase 6 – Usage Limits, Hosting & Polish (Day 23–25)

### Usage Protection
- Enforce `resume_generation_limit`
- Increment `resume_generation_used`
- Reject excess requests

### Hosting
- Backend → Render / Railway
- Database → Neon
- Frontend → Vercel
- Environment secrets locked

### Open-Source Polish
- README (architecture + diagrams)
- Sample resumes
- API documentation
- Contribution guide

---

## 9. MVP vs Deferred Scope

### MVP (Must Ship)
- Auth + roles
- Resume pipeline
- DOCX generation
- Usage limits
- Admin controls

### Deferred
- Payments
- Multiple templates
- Resume comparison UI
- Cover letters

---

**Final State:**  
Deployable • Secure • Cost-aware • **ResumeAgent v1.0**
