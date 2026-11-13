# HireFlow Platform Architecture

## 1. High-Level System Architecture

HireFlow is structured as an enterprise-grade multi-tenant SaaS application with clean separation between the React frontend client, Express API gateway, and PostgreSQL persistent storage.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│                                                             │
│   React 18 + Vite + TypeScript + Tailwind + TanStack Query   │
│   - Candidate Portal        - Recruiter Workspace           │
│   - Public Careers Hub      - Super Admin Control Center    │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP REST Requests           │ Socket.IO
               │ (JSON / Multipart)           │ Real-Time Events
┌──────────────▼──────────────────────────────┴───────────────┐
│                      Express Backend                        │
│                                                             │
│   - Helmet & CORS Security Headers                          │
│   - Rate Limiting Middleware                                │
│   - JWT & Refresh Token Auth Middleware                     │
│   - Multi-Tenant Organization Scope Verification            │
│   - Centralized Zod Request Validation                      │
│   - Controllers & Business Logic Services                   │
│   - Swagger OpenAPI Documentation Engine                    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐ ┌─────────────▼───────────────┐
│       Database Layer        │ │       Storage Layer         │
│  PostgreSQL via Prisma ORM  │ │  Local Disk / S3 Storage    │
│  - Multi-tenant Isolation   │ │  - Resume Uploads & Preview │
│  - Relational Foreign Keys  │ │  - Company Logos            │
│  - Atomic Transactions      │ │  - MIME & Size Verification │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Multi-Tenant Data Isolation Strategy

1. **Logical Organization Scoping**:
   - Every sensitive operational entity (`Job`, `Application`, `Interview`, `Invitation`, `OrganizationMember`) is explicitly keyed to an `organizationId`.
2. **Server-Side Enforcement**:
   - The `requireOrgMember` middleware validates that the authenticated user belongs to an active organization.
   - Database queries in controllers and services automatically scope conditions using `where: { organizationId: req.user.organizationId }`.
   - Attempts to access or modify records belonging to other tenants return HTTP 404/403 errors, preventing data leaks across organizations.
3. **Super Admin Universality**:
   - Users with the `SUPER_ADMIN` role have platform-level visibility across all organizations for health monitoring, moderation, and billing audits.

---

## 3. Authentication & Token Lifecycle

- **Access Token**: Short-lived (15 minutes) signed JSON Web Token containing identity claims (`sub`, `email`, `role`, `organizationId`).
- **Refresh Token**: Cryptographically random 40-byte hex token. The SHA-256 hash of the token is stored in PostgreSQL with a 7-day expiration.
- **Cookie Security**: Refresh tokens are transmitted in `HttpOnly`, `SameSite=Lax`, and `Secure` (production) cookies, immune to JavaScript XSS theft.
- **Rotation**: On every refresh token exchange, the old token is revoked (`revokedAt = now()`) and a fresh pair is minted. Any re-use of an expired or revoked token invalidates the entire session chain.

---

## 4. ATS Kanban Stage Transition Engine

1. Candidates progress across 8 distinct stages:
   `APPLIED` ➔ `SCREENING` ➔ `SHORTLISTED` ➔ `INTERVIEW` ➔ `ASSESSMENT` ➔ `OFFERED` ➔ `HIRED` / `REJECTED`
2. All stage mutations are executed inside an **atomic PostgreSQL transaction** (`prisma.$transaction`):
   - Updates `application.status`.
   - Records an immutable `ApplicationStageHistory` row with `previousStage`, `newStage`, `changedBy`, and recruiter `notes`.
   - Dispatches a real-time event to the candidate via `Socket.IO` and logs a persistent in-app notification.

---

## 5. Storage Abstraction Layer

The file management system uses an abstract interface (`StorageProvider`) implemented by `LocalStorageProvider`:
- Sanitizes file extensions and prevents directory traversal attacks.
- Validates MIME types (restricting resumes to PDF, DOC, DOCX; logos to PNG, JPEG, WEBP, SVG).
- Limits file sizes to configurable thresholds (default 10MB).
- Easily swapped for Amazon S3 or Google Cloud Storage by implementing the `StorageProvider` interface.

