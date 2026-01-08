# 🔐 Security & Authentication Architecture

## Overview

This document describes the authentication and security architecture of the ResumeAgent platform. The system is designed with production-grade security principles, prioritizing:

- **User privacy**
- **Strong cryptographic guarantees**
- **Minimal attack surface**
- **Scalability for future paid plans**
- **Full administrative control**
- **Zero dependency on third-party authentication providers**

The authentication model is based on JWT, secure cookies, HTTPS-only communication, and stateless backend design.

---

## Core Security Principles

The system is built on the following principles:

1. **Backend is stateless** – No session storage on the server
2. **Browser is stateful** – Client maintains authentication state via cookies
3. **Tokens are short-lived** – Minimize exposure window
4. **Secrets are never exposed to JavaScript** – HttpOnly cookies prevent XSS
5. **Every layer assumes compromise is possible** – Defense in depth
6. **Security decisions are enforced server-side only** – Never trust the client

---

## Authentication Model Summary

| Component | Approach |
|-----------|----------|
| **Authentication** | Email + Password |
| **Session Management** | JWT (Access + Refresh tokens) |
| **Token Storage** | HTTP-Only Secure Cookies |
| **Transport Security** | HTTPS Only |
| **Authorization** | Role-based (USER / ADMIN) |
| **CSRF Protection** | SameSite cookies + CSRF tokens |
| **Rate Limiting** | IP + User based |
| **Password Storage** | Strong hashing (bcrypt / Argon2) |
| **Email Verification** | Mandatory |
| **Admin Controls** | Block, delete, audit users |

---

## Stateless Authentication Design

The backend **does not store sessions**. Instead:

- Each request carries **cryptographically verifiable proof of identity**
- Authentication state is derived entirely from **signed JWTs**
- The database is used only for **refresh token validation and audit**, not sessions

**This allows:**
- Horizontal scalability
- No sticky sessions
- Simpler infrastructure
- Better fault tolerance

---

## JWT Token Strategy

### Why JWT?

JWTs provide:
- **Cryptographic integrity** – Tamper-proof signatures
- **Stateless verification** – No database lookup per request
- **Minimal runtime overhead** – Fast validation
- **Easy role propagation** – Claims embedded in token

However, JWTs **cannot be revoked easily**, so strict design rules apply.

### Two-Token Model (Mandatory)

The system uses two different JWTs to balance security and usability.

#### 1. Access Token

**Purpose:** Authenticate normal API requests

**Characteristics:**
- Short lifespan (5–15 minutes)
- Sent automatically via secure cookie
- Validated on every protected request

**Risk Profile:**
- If stolen, damage is limited due to short expiry

#### 2. Refresh Token

**Purpose:** Issue new access tokens

**Characteristics:**
- Longer lifespan (7–30 days)
- Stored only as a **hashed value** in database
- **Single-use** – consumed on refresh
- **Rotated** on every refresh

**Security Advantage:**
- Enables session continuity without long-lived access tokens
- Detects token reuse attacks

---

## Token Storage Strategy

### Why Cookies (not localStorage)?

JWTs are stored in **HTTP-only cookies**, not browser storage.

**This protects against:**
- Cross-Site Scripting (XSS)
- Token exfiltration via JavaScript

### Cookie Security Flags

All authentication cookies are configured with:

| Flag | Purpose |
|------|---------|
| `HttpOnly` | JavaScript cannot access |
| `Secure` | HTTPS only |
| `SameSite=Strict` or `Lax` | CSRF protection |
| Path scoping | Refresh token sent only to refresh endpoint |

---

## Login Workflow

```
1. User submits email and password
2. Backend verifies:
   - Password hash
   - Email verification status
   - Account not blocked or deleted
3. Backend issues:
   - Access token
   - Refresh token
4. Tokens are sent as secure cookies
5. Frontend stores no credentials
```

**At this point:**
- The browser automatically authenticates future requests
- Frontend does not manage session state manually

---

## Refresh Token Rotation Workflow

Refresh tokens are **single-use**.

**Flow:**

```
1. Browser calls /auth/refresh
2. Backend:
   - Verifies token signature
   - Checks token hash in database
   - Deletes old token
   - Issues new access + refresh tokens
   - Stores new refresh token hash
```

**If a used token is reused:**
- All active sessions are revoked
- User must re-authenticate

**This prevents:**
- Token replay
- Silent session hijacking
- Long-term compromise

---

## Logout Behavior

Logout is handled by:

1. Deleting refresh token from database
2. Clearing authentication cookies
3. Allowing access token to expire naturally

**No session invalidation is required** because the system is stateless.

---

## Authorization Model

### Roles

- `USER` – Standard authenticated user
- `ADMIN` – Full platform control

### Enforcement Rules

- Authorization checks occur **server-side only**
- Frontend role checks are **informational only**
- All sensitive actions require backend authorization

### Admin Capabilities

Admins can:
- View all users
- Block or unblock users
- Soft-delete accounts
- View AI usage logs
- Reset user quotas
- Audit resume generation activity

---

## Password Security

### Password Storage

- Passwords are **never stored in plaintext**
- Strong hashing algorithm used (**bcrypt / Argon2**)
- Unique salt per password

### Password History

- Previous password hashes are stored
- Prevents reuse of recent passwords
- Enforced during password changes

---

## Email Verification

Email verification is **mandatory**.

**Purpose:**
- Prevent fake account creation
- Reduce bot abuse
- Ensure reliable communication

**Unverified accounts:**
- Cannot generate resumes
- Cannot use AI credits

---

## Password Reset Security

Password reset uses:

- Cryptographically secure random tokens
- Tokens stored **hashed**
- Short expiration window (e.g., 1 hour)
- **Single-use enforcement**
- Optional IP and user-agent logging

---

## CSRF Protection

Because cookies are used, **CSRF is a real concern**.

**Mitigations:**
- `SameSite` cookie policy
- CSRF tokens for sensitive operations (state-changing actions)
- Strict origin checks

---

## Rate Limiting & Abuse Prevention

Rate limits apply to:

- Login attempts
- Password resets
- Resume generation
- Token refresh

**This prevents:**
- Brute force attacks
- Credential stuffing
- AI credit abuse

---

## HTTPS Enforcement

- HTTPS is **mandatory** in all environments
- Secure cookies require HTTPS
- Backend rejects non-HTTPS traffic in production
- Reverse proxy headers are validated

---

## Logging & Auditing

The system logs:

- Failed login attempts
- Token misuse
- Admin actions
- AI usage per user
- Resume generation pipeline activity

**Sensitive data such as:**
- Passwords
- Tokens
- Resume content

**is never logged by default.**

---

## Frontend Security Responsibility

The frontend:

- **Never sees tokens** – stored in HttpOnly cookies
- **Never stores credentials** – no localStorage/sessionStorage
- **Reacts only to HTTP status codes** – 401, 403, etc.
- **Does not implement security logic** – UI hints only

**All enforcement happens in the backend.**

---

## Why This Approach Is Production-Grade

This architecture provides:

✅ **Strong cryptographic guarantees** – JWT signatures, bcrypt/Argon2  
✅ **Minimal attack surface** – HttpOnly cookies, HTTPS only  
✅ **Vendor independence** – No third-party auth dependencies  
✅ **High scalability** – Stateless backend, no session storage  
✅ **Clear auditability** – Comprehensive logging  
✅ **Long-term maintainability** – Simple, well-understood patterns

It is comparable to authentication systems used by:
- Financial platforms
- Enterprise SaaS products
- Security-focused applications

---

## Future Extensions (Planned)

- Paid plans with quota enforcement
- Device/session management
- MFA (Multi-Factor Authentication, optional)
- Advanced anomaly detection
- Admin dashboards

**All future features can be added without redesigning authentication.**

---

## Final Note

> **Security is not a feature — it is an architecture decision.**

This authentication design is intentionally **conservative, explicit, and defensive**.

It is built not just to work, but to **withstand abuse, mistakes, and future growth**.

---

## Quick Reference

### Token Lifespans
- Access Token: **5–15 minutes**
- Refresh Token: **7–30 days**

### Critical Endpoints
- `POST /auth/login` – Issues tokens
- `POST /auth/refresh` – Rotates tokens
- `POST /auth/logout` – Clears tokens
- `POST /auth/reset-password` – Initiates reset

### Security Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### Cookie Configuration
```javascript
{
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: <token_expiry>,
  path: '/auth' // for refresh token
}
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-08  
**Maintained By:** Security Engineering Team