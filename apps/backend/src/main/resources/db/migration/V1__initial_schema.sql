-- ============================================================================
-- Flyway Migration V1: Initial Schema for Resume Agent Database
-- ============================================================================
-- Description: Creates the complete database schema including core tables,
--              security tables, and all necessary indexes and constraints
-- Author: Resume Agent Team
-- Date: 2026-01-06
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE USER TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_role VARCHAR(10) NOT NULL DEFAULT 'USER' CHECK (user_role IN ('USER', 'ADMIN')),
    plan VARCHAR(20) NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO')),
    resume_generation_limit INT NOT NULL DEFAULT 5,
    resume_generation_used INT NOT NULL DEFAULT 0,
    is_email_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_resume_usage CHECK (resume_generation_used >= 0 AND resume_generation_used <= resume_generation_limit)
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(user_role);
CREATE INDEX idx_users_created_at ON users(created_at);

COMMENT ON TABLE users IS 'Core user accounts table with authentication and plan information';
COMMENT ON COLUMN users.resume_generation_limit IS 'Maximum number of resume generations allowed for user plan';
COMMENT ON COLUMN users.resume_generation_used IS 'Number of resume generations used by user';

-- ============================================================================
-- RESUME TABLES
-- ============================================================================

CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title_targeted VARCHAR(150),
    company_targeted VARCHAR(150),
    current_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for resumes table
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_created_at ON resumes(created_at);
CREATE INDEX idx_resumes_job_title ON resumes(job_title_targeted);

COMMENT ON TABLE resumes IS 'Main resume records with targeting information and version tracking';

-- ============================================================================
-- RESUME VERSIONS TABLE (Critical for rollback and version control)
-- ============================================================================

CREATE TABLE resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    resume_json JSONB NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('AI', 'USER', 'IMPORT')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_resume_version UNIQUE (resume_id, version_number)
);

-- Indexes for resume_versions table
CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id);
CREATE INDEX idx_resume_versions_version ON resume_versions(resume_id, version_number DESC);
CREATE INDEX idx_resume_versions_json ON resume_versions USING GIN (resume_json);

COMMENT ON TABLE resume_versions IS 'Full version history with complete resume JSON snapshots for rollback capability';
COMMENT ON COLUMN resume_versions.resume_json IS 'Complete canonical resume data in JSON format';

-- ============================================================================
-- RESUME HEADER
-- ============================================================================

CREATE TABLE resume_header (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(150) NOT NULL,
    headline VARCHAR(200),
    linkedin TEXT,
    github TEXT,
    portfolio TEXT,
    
    CONSTRAINT uq_resume_header UNIQUE (resume_id)
);

-- Index for resume_header table
CREATE INDEX idx_resume_header_resume_id ON resume_header(resume_id);

COMMENT ON TABLE resume_header IS 'Contact information and professional links for resume';

-- ============================================================================
-- RESUME SUMMARY
-- ============================================================================

CREATE TABLE resume_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    
    CONSTRAINT uq_resume_summary UNIQUE (resume_id)
);

-- Index for resume_summary table
CREATE INDEX idx_resume_summary_resume_id ON resume_summary(resume_id);

COMMENT ON TABLE resume_summary IS 'Professional summary section of resume';

-- ============================================================================
-- RESUME SKILLS (Categorized for smart keyword injection)
-- ============================================================================

CREATE TABLE resume_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('LANGUAGES', 'FRAMEWORKS', 'TOOLS', 'CONCEPTS', 'OTHERS')),
    skill VARCHAR(100) NOT NULL
);

-- Indexes for resume_skills table
CREATE INDEX idx_resume_skills_resume_id ON resume_skills(resume_id);
CREATE INDEX idx_resume_skills_category ON resume_skills(category);
CREATE INDEX idx_resume_skills_skill ON resume_skills(skill);

COMMENT ON TABLE resume_skills IS 'Categorized skills for targeted keyword optimization';
COMMENT ON COLUMN resume_skills.category IS 'Skill category: languages, frameworks, tools, concepts, other';

-- ============================================================================
-- RESUME EXPERIENCE
-- ============================================================================

CREATE TABLE resume_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    role VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    employment_type VARCHAR(50) CHECK (employment_type IN ('FULL-TIME', 'PART-TIME', 'CONTRACT', 'INTERN', 'FREELANCE')),
    start_date DATE NOT NULL,
    end_date DATE,
    technologies TEXT[],
    
    CONSTRAINT chk_experience_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes for resume_experience table
CREATE INDEX idx_resume_experience_resume_id ON resume_experience(resume_id);
CREATE INDEX idx_resume_experience_dates ON resume_experience(start_date DESC, end_date DESC NULLS FIRST);

COMMENT ON TABLE resume_experience IS 'Work experience entries with role and company information';
COMMENT ON COLUMN resume_experience.technologies IS 'Array of technologies used in this role';

-- ============================================================================
-- RESUME EXPERIENCE BULLETS
-- ============================================================================

CREATE TABLE resume_experience_bullets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experience_id UUID NOT NULL REFERENCES resume_experience(id) ON DELETE CASCADE,
    bullet_type VARCHAR(50) NOT NULL CHECK (bullet_type IN ('RESPONSIBILITY' , 'ACHIEVEMENT')),
    content TEXT NOT NULL
);

-- Indexes for resume_experience_bullets table
CREATE INDEX idx_experience_bullets_experience_id ON resume_experience_bullets(experience_id);
CREATE INDEX idx_experience_bullets_type ON resume_experience_bullets(bullet_type);

COMMENT ON TABLE resume_experience_bullets IS 'Individual bullet points for experience entries, separated for flexible reordering and AI rewriting';
COMMENT ON COLUMN resume_experience_bullets.bullet_type IS 'Type of bullet: responsibility or achievement';

-- ============================================================================
-- RESUME PROJECTS
-- ============================================================================

CREATE TABLE resume_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    technologies TEXT[]
);

-- Indexes for resume_projects table
CREATE INDEX idx_resume_projects_resume_id ON resume_projects(resume_id);

COMMENT ON TABLE resume_projects IS 'Project entries with description and tech stack';

-- ============================================================================
-- RESUME PROJECT HIGHLIGHTS
-- ============================================================================

CREATE TABLE resume_project_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES resume_projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);

-- Index for resume_project_highlights table
CREATE INDEX idx_project_highlights_project_id ON resume_project_highlights(project_id);

COMMENT ON TABLE resume_project_highlights IS 'Highlight bullets for individual projects';

-- ============================================================================
-- RESUME EDUCATION
-- ============================================================================

CREATE TABLE resume_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    degree VARCHAR(150) NOT NULL,
    field VARCHAR(150),
    institution VARCHAR(200) NOT NULL,
    location VARCHAR(150),
    start_year INT,
    end_year INT,
    
    CONSTRAINT chk_education_years CHECK (start_year IS NULL OR end_year IS NULL OR end_year >= start_year)
);

-- Indexes for resume_education table
CREATE INDEX idx_resume_education_resume_id ON resume_education(resume_id);
CREATE INDEX idx_resume_education_years ON resume_education(end_year DESC NULLS FIRST);

COMMENT ON TABLE resume_education IS 'Educational background including degrees and institutions';

-- ============================================================================
-- RESUME CERTIFICATIONS
-- ============================================================================

CREATE TABLE resume_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    issuer VARCHAR(200) NOT NULL,
    year INT
);

-- Index for resume_certifications table
CREATE INDEX idx_resume_certifications_resume_id ON resume_certifications(resume_id);
CREATE INDEX idx_resume_certifications_year ON resume_certifications(year DESC);

COMMENT ON TABLE resume_certifications IS 'Professional certifications with issuing organization';

-- ============================================================================
-- RESUME ACHIEVEMENTS
-- ============================================================================

CREATE TABLE resume_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);

-- Index for resume_achievements table
CREATE INDEX idx_resume_achievements_resume_id ON resume_achievements(resume_id);

COMMENT ON TABLE resume_achievements IS 'Notable achievements and awards';

-- ============================================================================
-- RESUME PUBLICATIONS
-- ============================================================================

CREATE TABLE resume_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    platform VARCHAR(100),
    url TEXT
);

-- Index for resume_publications table
CREATE INDEX idx_resume_publications_resume_id ON resume_publications(resume_id);

COMMENT ON TABLE resume_publications IS 'Published articles, blog posts, and papers';

-- ============================================================================
-- RESUME ADDITIONAL SECTIONS (Extension point for custom sections)
-- ============================================================================

CREATE TABLE resume_additional_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL
);

-- Indexes for resume_additional_sections table
CREATE INDEX idx_resume_additional_sections_resume_id ON resume_additional_sections(resume_id);
CREATE INDEX idx_resume_additional_sections_name ON resume_additional_sections(section_name);

COMMENT ON TABLE resume_additional_sections IS 'Flexible extension point for custom resume sections like volunteer work, languages spoken, etc.';

-- ============================================================================
-- RESUME METADATA
-- ============================================================================

CREATE TABLE resume_metadata (
    resume_id UUID PRIMARY KEY REFERENCES resumes(id) ON DELETE CASCADE,
    generated_at TIMESTAMP,
    language VARCHAR(20) DEFAULT 'en',
    ats_optimized BOOLEAN DEFAULT TRUE,
    ai_models_used TEXT[],
    pipeline_version VARCHAR(20)
);

COMMENT ON TABLE resume_metadata IS 'Technical metadata about resume generation and processing';
COMMENT ON COLUMN resume_metadata.ai_models_used IS 'Array of AI models used in generation pipeline';

-- ============================================================================
-- RESUME AGENT LOGS (Debugging and auditing)
-- ============================================================================

CREATE TABLE resume_agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    agent_name VARCHAR(100) NOT NULL,
    tokens_input INT,
    tokens_output INT,
    execution_time_ms INT,
    status VARCHAR(20) CHECK (status IN ('SUCCESS', 'FAILURE', 'PARTIAL')),
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for resume_agent_logs table
CREATE INDEX idx_agent_logs_user_id ON resume_agent_logs(user_id);
CREATE INDEX idx_agent_logs_resume_id ON resume_agent_logs(resume_id);
CREATE INDEX idx_agent_logs_agent_name ON resume_agent_logs(agent_name);
CREATE INDEX idx_agent_logs_created_at ON resume_agent_logs(created_at DESC);

COMMENT ON TABLE resume_agent_logs IS 'Audit trail for AI agent operations with performance metrics';
COMMENT ON COLUMN resume_agent_logs.tokens_input IS 'Number of input tokens used in AI operation';
COMMENT ON COLUMN resume_agent_logs.tokens_output IS 'Number of output tokens generated';

-- ============================================================================
-- SECURITY & AUTHENTICATION TABLES
-- ============================================================================

-- Email Verification Tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
);

-- Indexes for email_verification_tokens table
CREATE INDEX idx_email_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_expires ON email_verification_tokens(expires_at);

COMMENT ON TABLE email_verification_tokens IS 'Secure tokens for email verification with expiration';

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Indexes for password_reset_tokens table
CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);

COMMENT ON TABLE password_reset_tokens IS 'Secure tokens for password reset with IP and user agent tracking';

-- Password History
CREATE TABLE password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for password_history table
CREATE INDEX idx_password_history_user_id ON password_history(user_id);
CREATE INDEX idx_password_history_created_at ON password_history(created_at DESC);

COMMENT ON TABLE password_history IS 'Password history to prevent password reuse for enhanced security';

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Complete resume view with all sections
CREATE VIEW v_complete_resumes AS
SELECT 
    r.id AS resume_id,
    r.user_id,
    r.job_title_targeted,
    r.company_targeted,
    r.current_version,
    r.created_at,
    r.updated_at,
    u.full_name AS user_name,
    u.email AS user_email,
    h.full_name AS resume_name,
    h.email AS resume_email,
    h.phone,
    h.location,
    h.headline,
    s.summary_text,
    rm.language,
    rm.ats_optimized
FROM resumes r
JOIN users u ON r.user_id = u.id
LEFT JOIN resume_header h ON r.id = h.resume_id
LEFT JOIN resume_summary s ON r.id = s.resume_id
LEFT JOIN resume_metadata rm ON r.id = rm.resume_id;

COMMENT ON VIEW v_complete_resumes IS 'Consolidated view of resumes with header, summary, and metadata';

-- User resume statistics view
CREATE VIEW v_user_resume_stats AS
SELECT 
    u.id AS user_id,
    u.full_name,
    u.email,
    u.plan,
    u.resume_generation_limit,
    u.resume_generation_used,
    (u.resume_generation_limit - u.resume_generation_used) AS remaining_generations,
    COUNT(DISTINCT r.id) AS total_resumes,
    COUNT(DISTINCT rv.id) AS total_versions,
    MAX(r.updated_at) AS last_resume_update
FROM users u
LEFT JOIN resumes r ON u.id = r.user_id
LEFT JOIN resume_versions rv ON r.id = rv.resume_id
GROUP BY u.id, u.full_name, u.email, u.plan, u.resume_generation_limit, u.resume_generation_used;

COMMENT ON VIEW v_user_resume_stats IS 'User statistics including resume counts and generation limits';

-- -- ============================================================================
-- -- SEED DATA (Optional - for development/testing)
-- -- ============================================================================
--
-- -- Insert default admin user (password should be changed immediately in production)
-- -- Password: 'Admin123!' (hashed with bcrypt)
-- INSERT INTO users (id, full_name, email, password_hash, user_role, plan, resume_generation_limit, is_email_active)
-- VALUES (
--     uuid_generate_v4(),
--     'System Administrator',
--     'admin@resumeagent.com',
--     '$2a$10$abcdefghijklmnopqrstuvwxyz123456789',  -- Replace with actual bcrypt hash
--     'ADMIN',
--     'PRO',
--     999,
--     TRUE
-- ) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- PERFORMANCE OPTIMIZATION NOTES
-- ============================================================================

-- Consider adding these for high-traffic scenarios:
-- 1. Partitioning resume_agent_logs by created_at (monthly or quarterly)
-- 2. Archiving old resume_versions to separate cold storage
-- 3. Adding materialized views for analytics dashboards
-- 4. Implementing connection pooling at application layer
-- 5. Using read replicas for reporting queries

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- 1. All tokens should be hashed before storage
-- 2. Implement row-level security (RLS) policies if using PostgreSQL RLS
-- 3. Regular cleanup of expired tokens
-- 4. Audit logging for sensitive operations
-- 5. Encryption at rest for sensitive columns (password_hash, tokens)

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
