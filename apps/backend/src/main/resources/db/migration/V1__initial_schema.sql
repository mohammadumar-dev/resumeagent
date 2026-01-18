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
-- MASTER RESUMES (Canonical User-Owned Source Resume)
-- ============================================================================
-- One master resume per user (today).
-- Future: allow multiple master resumes by dropping UNIQUE constraint.
-- ============================================================================

CREATE TABLE master_resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Ownership
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Canonical resume content used as AI input
    -- This is the SINGLE source of truth for generations
    resume_json JSONB NOT NULL,
    -- Lifecycle & state
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Audit & version safety
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Enforce ONE master resume per user (Phase 1)
    CONSTRAINT uq_master_resume_per_user UNIQUE (user_id)
);

-- Fast lookup of master resume by user
CREATE INDEX idx_master_resumes_user_id
    ON master_resumes(user_id);

-- GIN index for structured querying (skills, sections, metadata)
-- Useful for analytics, admin tools, future search
CREATE INDEX idx_master_resumes_resume_json
    ON master_resumes USING GIN (resume_json);

COMMENT ON TABLE master_resumes IS
'Canonical user-owned resume used as the base input for AI-generated resumes';

COMMENT ON COLUMN master_resumes.resume_json IS
'Full structured resume JSON provided by the user; source of truth for AI agents';

COMMENT ON COLUMN master_resumes.is_active IS
'Soft-state flag allowing future archival or replacement without deletion';

-- ============================================================================
-- RESUME TABLES (Generated)
-- ============================================================================

CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    master_resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE RESTRICT,
    job_title_targeted VARCHAR(150),
    company_targeted VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DELETED')),
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
    source VARCHAR(20) NOT NULL CHECK (source IN ('AI', 'USER_EDIT', 'IMPORT')),
    resume_json JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_resume_version UNIQUE (resume_id, version_number)
);


-- Indexes for resume_versions table
CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id);
CREATE INDEX idx_resume_versions_version ON resume_versions(resume_id, version_number DESC);
CREATE INDEX idx_resume_versions_json ON resume_versions USING GIN (resume_json);
CREATE INDEX idx_resume_versions_resume_id_version ON resume_versions (resume_id, version_number);

COMMENT ON TABLE resume_versions IS 'Full version history with complete resume JSON snapshots for rollback capability';
COMMENT ON COLUMN resume_versions.resume_json IS 'Complete canonical resume data in JSON format';

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
-- REFRESH TOKENS (Session Continuity & Token Rotation)
-- ============================================================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Store ONLY hashed refresh token (never plaintext)
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    -- Token lifecycle
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP,
    -- Rotation & security
    replaced_by_token_id UUID REFERENCES refresh_tokens(id),
    -- Session context (very important for security)
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

-- Indexes for refresh_tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(revoked);
CREATE INDEX idx_refresh_tokens_created_at ON refresh_tokens(created_at DESC);

COMMENT ON TABLE refresh_tokens IS 'Hashed refresh tokens for session continuity, rotation, and revocation';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'Hashed refresh token (bcrypt/argon2). Never store plaintext tokens.';
COMMENT ON COLUMN refresh_tokens.replaced_by_token_id IS 'Used for refresh token rotation and reuse detection';

-- ============================================================================
-- SYSTEM & API LOGS (Centralized Observability & Audit)
-- ============================================================================

CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Log classification
    log_level VARCHAR(10) NOT NULL CHECK (log_level IN ('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'SECURITY')),
    log_type VARCHAR(50) NOT NULL,
    -- Examples:
    -- API_REQUEST, API_RESPONSE, AUTH_FAILURE, ADMIN_ACTION,
    -- SYSTEM_EVENT, EXCEPTION, RATE_LIMIT

    -- Request context
    http_method VARCHAR(10),
    endpoint TEXT,
    status_code INT,

    -- Actor context
    user_id UUID,
    user_role VARCHAR(10),
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Correlation
    request_id UUID,
    trace_id UUID,

    -- Message & payload
    message TEXT NOT NULL,
    metadata JSONB,

    -- Error details (if any)
    error_code VARCHAR(50),
    stack_trace TEXT,

    -- Timing
    execution_time_ms INT,

    -- Lifecycle
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES (Critical for performance)
-- ============================================================================

CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX idx_system_logs_log_level ON system_logs(log_level);
CREATE INDEX idx_system_logs_log_type ON system_logs(log_type);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_status_code ON system_logs(status_code);
CREATE INDEX idx_system_logs_endpoint ON system_logs(endpoint);
CREATE INDEX idx_system_logs_request_id ON system_logs(request_id);
CREATE INDEX idx_system_logs_metadata ON system_logs USING GIN (metadata);

COMMENT ON TABLE system_logs IS 'Centralized system, API, and security logs for auditing and observability';
COMMENT ON COLUMN system_logs.log_type IS 'High-level classification of log event';
COMMENT ON COLUMN system_logs.metadata IS 'Flexible JSON payload for additional structured data';
COMMENT ON COLUMN system_logs.request_id IS 'Correlates logs belonging to same HTTP request';
COMMENT ON COLUMN system_logs.trace_id IS 'Used for distributed tracing or async jobs';

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

CREATE TRIGGER update_master_resumes_updated_at
    BEFORE UPDATE ON master_resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Complete resume view with all sections
CREATE VIEW v_complete_resumes AS
SELECT
    r.id                     AS resume_id,
    r.user_id,
    r.master_resume_id,
    r.job_title_targeted,
    r.company_targeted,
    r.status,
    r.created_at,
    r.updated_at,

    -- User info
    u.full_name              AS user_name,
    u.email                  AS user_email,
    u.plan                   AS user_plan,

    -- Version info
    rv.version_number        AS latest_version,
    rv.source                AS latest_version_source,
    rv.created_at            AS version_created_at,

    -- Canonical resume JSON (what DOCX + FTL consumes)
    rv.resume_json

FROM resumes r
         JOIN users u
              ON r.user_id = u.id

         JOIN LATERAL (
    SELECT rv_inner.*
    FROM resume_versions rv_inner
    WHERE rv_inner.resume_id = r.id
    ORDER BY rv_inner.version_number DESC
        LIMIT 1
) rv ON TRUE;

COMMENT ON VIEW v_complete_resumes IS 'Consolidated view of resumes with header, summary, and metadata';

-- User resume statistics view
CREATE VIEW v_user_resume_stats AS
SELECT
    u.id AS user_id,
    u.full_name,
    u.email,
    u.plan,

    -- Quota tracking
    u.resume_generation_limit,
    u.resume_generation_used,
    (u.resume_generation_limit - u.resume_generation_used) AS remaining_generations,

    -- Resume metrics
    COUNT(DISTINCT r.id)        AS total_generated_resumes,
    COUNT(rv.id)               AS total_resume_versions,
    MAX(r.updated_at)          AS last_resume_update

FROM users u
         LEFT JOIN resumes r
                   ON u.id = r.user_id

         LEFT JOIN resume_versions rv
                   ON r.id = rv.resume_id

GROUP BY
    u.id,
    u.full_name,
    u.email,
    u.plan,
    u.resume_generation_limit,
    u.resume_generation_used;

COMMENT ON VIEW v_user_resume_stats IS 'User statistics including resume counts and generation limits';

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