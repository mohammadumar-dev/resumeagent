# Flyway Migration V1 - Resume Agent Database

## Overview
This migration creates the complete initial schema for the Resume Agent application, including:
- Core user management and authentication
- Resume data with full version control
- Detailed resume sections (experience, education, skills, etc.)
- Security tables for email verification and password reset
- Audit logging for AI agent operations
- Performance-optimized indexes

## Prerequisites
- PostgreSQL 12+ (recommended: 14+)
- Flyway CLI or Flyway integration in your application
- UUID extension support (`uuid-ossp`)

## Migration File
- **File**: `V1__initial_schema.sql`
- **Version**: 1
- **Description**: Initial schema creation

## Database Objects Created

### Core Tables (17)
1. `users` - User accounts with plan and generation limits
2. `resumes` - Main resume records
3. `resume_versions` - Full version history with JSON snapshots
4. `resume_header` - Contact information and links
5. `resume_summary` - Professional summary
6. `resume_skills` - Categorized skills (languages, frameworks, tools, concepts)
7. `resume_experience` - Work experience entries
8. `resume_experience_bullets` - Individual bullet points for experiences
9. `resume_projects` - Project entries
10. `resume_project_highlights` - Project highlight bullets
11. `resume_education` - Educational background
12. `resume_certifications` - Professional certifications
13. `resume_achievements` - Notable achievements
14. `resume_publications` - Published works
15. `resume_additional_sections` - Custom/flexible sections
16. `resume_metadata` - Technical metadata about generation
17. `resume_agent_logs` - AI agent operation audit trail

### Security Tables (3)
18. `email_verification_tokens` - Email verification workflow
19. `password_reset_tokens` - Password reset workflow
20. `password_history` - Password reuse prevention

### Views (2)
- `v_complete_resumes` - Consolidated resume information
- `v_user_resume_stats` - User statistics and limits

### Functions & Triggers
- `update_updated_at_column()` - Auto-update timestamps
- Triggers on `users` and `resumes` tables

## Running the Migration

### Using Flyway CLI
```bash
flyway -url=jdbc:postgresql://localhost:5432/resume_agent \
       -user=your_username \
       -password=your_password \
       migrate
```

### Using Flyway with Spring Boot
Add to `application.properties`:
```properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
```

Place the SQL file in `src/main/resources/db/migration/`

### Using Flyway with Docker
```bash
docker run --rm \
  -v $(pwd)/migrations:/flyway/sql \
  flyway/flyway \
  -url=jdbc:postgresql://host.docker.internal:5432/resume_agent \
  -user=your_username \
  -password=your_password \
  migrate
```

## Post-Migration Steps

### 1. Update Admin Password
The migration creates a default admin user. **Change this password immediately**:
```sql
UPDATE users 
SET password_hash = 'your_bcrypt_hashed_password'
WHERE email = 'admin@resumeagent.com';
```

### 2. Configure Password Hashing
Ensure your application uses bcrypt for password hashing with appropriate cost factor (10-12 recommended).

### 3. Token Security
Implement secure token generation:
- Use cryptographically secure random strings
- Hash tokens before storage
- Set appropriate expiration times (e.g., 24 hours for email verification, 1 hour for password reset)

### 4. Cleanup Jobs
Set up scheduled jobs to clean up expired tokens:
```sql
-- Clean up expired email verification tokens (run daily)
DELETE FROM email_verification_tokens 
WHERE expires_at < CURRENT_TIMESTAMP AND used = FALSE;

-- Clean up expired password reset tokens (run daily)
DELETE FROM password_reset_tokens 
WHERE expires_at < CURRENT_TIMESTAMP AND used = FALSE;

-- Clean up old password history (keep last 5 passwords)
DELETE FROM password_history 
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
        FROM password_history
    ) t WHERE t.rn > 5
);
```

## Key Features

### Version Control System
The `resume_versions` table provides complete version history:
- Stores full resume JSON for each version
- Enables rollback to any previous version
- Tracks source (AI, USER, IMPORT)
- Efficient JSONB storage with GIN indexing

### Categorized Skills
Skills are organized by category for smart ATS optimization:
```sql
-- Example: Adding skills
INSERT INTO resume_skills (resume_id, category, skill) VALUES
  ('resume-uuid', 'languages', 'Java'),
  ('resume-uuid', 'frameworks', 'Spring Boot'),
  ('resume-uuid', 'tools', 'Docker'),
  ('resume-uuid', 'concepts', 'Microservices');
```

### Flexible Experience Bullets
Separate table for experience bullets enables:
- Individual bullet reordering
- Type-based filtering (responsibilities vs achievements)
- AI rewriting of specific bullets without touching the whole experience

### Extension Points
`resume_additional_sections` provides flexibility for custom sections:
```sql
-- Example: Adding custom sections
INSERT INTO resume_additional_sections (resume_id, section_name, content) VALUES
  ('resume-uuid', 'openSource', 'Contributor to ResumeAgent'),
  ('resume-uuid', 'languagesSpoken', 'English (Native), Hindi (Fluent), Spanish (Intermediate)'),
  ('resume-uuid', 'volunteer', 'Taught programming to underprivileged kids');
```

### AI Agent Logging
Track all AI operations for debugging and optimization:
```sql
-- Example: Logging an AI operation
INSERT INTO resume_agent_logs 
  (user_id, resume_id, agent_name, tokens_input, tokens_output, execution_time_ms, status) 
VALUES 
  ('user-uuid', 'resume-uuid', 'ExperienceRewriter', 1500, 2000, 3400, 'success');
```

## Performance Considerations

### Indexes
All foreign keys have indexes for efficient joins.
Additional indexes on:
- Frequently queried date columns
- Categorical fields (user_role, plan, category)
- JSONB column with GIN index for fast JSON queries

### Query Optimization Tips
```sql
-- Efficient resume retrieval with all sections
SELECT r.*, rv.resume_json
FROM resumes r
JOIN resume_versions rv ON r.id = rv.resume_id AND rv.version_number = r.current_version
WHERE r.user_id = 'user-uuid';

-- Efficient skill lookup by category
SELECT skill 
FROM resume_skills 
WHERE resume_id = 'resume-uuid' AND category = 'languages';

-- Count user's resume generations efficiently
SELECT resume_generation_used, resume_generation_limit 
FROM users 
WHERE id = 'user-uuid';
```

### Scaling Recommendations
For high-traffic production environments:
1. **Partitioning**: Partition `resume_agent_logs` by month
2. **Archiving**: Move old `resume_versions` to cold storage after 6-12 months
3. **Caching**: Cache user plan information and generation limits
4. **Read Replicas**: Use read replicas for analytics and reporting
5. **Connection Pooling**: Implement connection pooling (e.g., PgBouncer)

## Security Best Practices

### 1. Row-Level Security (Optional)
For multi-tenant isolation:
```sql
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_resumes_policy ON resumes
  FOR ALL TO app_user
  USING (user_id = current_setting('app.current_user_id')::UUID);
```

### 2. Token Management
- Always hash tokens before storage using secure algorithms
- Set appropriate expiration times
- Invalidate tokens after use
- Log all token usage for security auditing

### 3. Password Security
- Use bcrypt with cost factor 10-12
- Store only hashed passwords, never plaintext
- Prevent password reuse using `password_history`
- Implement password strength requirements at application layer

### 4. Data Encryption
Consider encrypting sensitive columns:
- Password hashes (hashed, not encrypted)
- Email verification tokens
- Password reset tokens
- Potentially sensitive resume content

## Monitoring Queries

### Check Migration Status
```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

### Database Size
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Active User Statistics
```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_email_active = TRUE) as verified_users,
    COUNT(*) FILTER (WHERE plan = 'PRO') as pro_users,
    COUNT(*) FILTER (WHERE user_role = 'ADMIN') as admin_users
FROM users;
```

### Resume Generation Usage
```sql
SELECT 
    plan,
    AVG(resume_generation_used) as avg_used,
    AVG(resume_generation_limit) as avg_limit,
    AVG(CAST(resume_generation_used AS FLOAT) / resume_generation_limit * 100) as avg_usage_percent
FROM users
GROUP BY plan;
```

## Troubleshooting

### Migration Fails
1. Check PostgreSQL version compatibility
2. Ensure uuid-ossp extension is available
3. Verify user has CREATE privileges
4. Check for conflicting objects

### Performance Issues
1. Run `ANALYZE` on all tables after initial load
2. Monitor slow queries using `pg_stat_statements`
3. Check index usage with `pg_stat_user_indexes`
4. Consider vacuuming large tables

### Rollback
Flyway doesn't support automatic rollback for versioned migrations.
To rollback manually:
```sql
-- Drop all tables (WARNING: This will delete all data)
DROP VIEW IF EXISTS v_user_resume_stats CASCADE;
DROP VIEW IF EXISTS v_complete_resumes CASCADE;
DROP TABLE IF EXISTS password_history CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
DROP TABLE IF EXISTS resume_agent_logs CASCADE;
DROP TABLE IF EXISTS resume_metadata CASCADE;
DROP TABLE IF EXISTS resume_additional_sections CASCADE;
DROP TABLE IF EXISTS resume_publications CASCADE;
DROP TABLE IF EXISTS resume_achievements CASCADE;
DROP TABLE IF EXISTS resume_certifications CASCADE;
DROP TABLE IF EXISTS resume_education CASCADE;
DROP TABLE IF EXISTS resume_project_highlights CASCADE;
DROP TABLE IF EXISTS resume_projects CASCADE;
DROP TABLE IF EXISTS resume_experience_bullets CASCADE;
DROP TABLE IF EXISTS resume_experience CASCADE;
DROP TABLE IF EXISTS resume_skills CASCADE;
DROP TABLE IF EXISTS resume_summary CASCADE;
DROP TABLE IF EXISTS resume_header CASCADE;
DROP TABLE IF EXISTS resume_versions CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## Support
For issues or questions:
- Check Flyway documentation: https://flywaydb.org/documentation/
- Review PostgreSQL logs for errors
- Consult your DBA for production deployments

## Version History
- **V1** (2026-01-06): Initial schema creation with complete resume management system

---
**Note**: This is a production-ready schema. Ensure you follow security best practices and perform thorough testing before deploying to production.