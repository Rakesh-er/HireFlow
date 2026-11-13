# HireFlow REST API Documentation

Base URL: `/api/v1`  
Interactive Swagger UI: `http://localhost:5000/api-docs`

---

## Response Format Standards

### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Response (HTTP 400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "success": false,
  "message": "Specific error description",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## 1. Authentication & Security Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| `POST` | `/auth/register` | Register new candidate or recruiter | No | Public |
| `POST` | `/auth/login` | Authenticate user & issue tokens | No | Public |
| `POST` | `/auth/logout` | Revoke refresh token & clear cookies | No | Public |
| `POST` | `/auth/refresh` | Rotate refresh token & issue new access token | No | Public (via Cookie) |
| `POST` | `/auth/forgot-password` | Generate reset token & send instructions | No | Public |
| `POST` | `/auth/reset-password` | Verify token & update password | No | Public |
| `POST` | `/auth/verify-email` | Verify email address token | No | Public |
| `GET` | `/auth/me` | Retrieve authenticated profile | Yes | Any |
| `PATCH` | `/auth/change-password` | Update current account password | Yes | Any |
| `PATCH` | `/auth/profile` | Update profile (name, phone, avatar) | Yes | Any |

---

## 2. Organization Management

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| `POST` | `/organizations` | Create a new organization tenant | Yes | Any |
| `GET` | `/organizations/current` | Get active organization profile & subscription | Yes | Org Member |
| `PATCH` | `/organizations/current` | Update organization details | Yes | Org Owner / Admin |
| `GET` | `/organizations/members` | List members & roles | Yes | Org Member |
| `POST` | `/organizations/invitations` | Invite a teammate via email | Yes | Org Owner / Admin |
| `POST` | `/organizations/invitations/accept` | Accept teammate invitation token | Yes | Any |
| `PATCH` | `/organizations/members/:id` | Update member permission role | Yes | Org Owner / Admin |
| `DELETE` | `/organizations/members/:id` | Remove member from organization | Yes | Org Owner / Admin |

---

## 3. Job Openings & Public Careers Board

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| `GET` | `/public/jobs` | Search & filter published jobs | No | Public |
| `GET` | `/public/jobs/:slug` | View published job posting by slug | No | Public |
| `POST` | `/jobs` | Create a job opening requisition | Yes | Recruiter / Admin |
| `GET` | `/jobs` | List organization's jobs with filters | Yes | Recruiter / Hiring Manager |
| `GET` | `/jobs/:id` | Get job opening specifications | Yes | Recruiter / Hiring Manager |
| `PATCH` | `/jobs/:id` | Update job requisition details | Yes | Recruiter / Admin |
| `DELETE` | `/jobs/:id` | Delete job opening | Yes | Recruiter / Admin |
| `PATCH` | `/jobs/:id/publish` | Publish job to public board | Yes | Recruiter / Admin |
| `PATCH` | `/jobs/:id/close` | Close job opening | Yes | Recruiter / Admin |
| `GET` | `/jobs/:id/applications` | List candidate applications for job | Yes | Recruiter / Hiring Manager |

---

## 4. Candidate Applications & ATS Pipeline

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| `POST` | `/applications` | Candidate submits job application | Yes | Candidate |
| `GET` | `/applications` | List applications (filter by job, stage, search) | Yes | Recruiter / Hiring Manager |
| `GET` | `/applications/kanban` | Grouped 8-stage ATS Kanban board view | Yes | Recruiter / Hiring Manager |
| `GET` | `/applications/:id` | Full application detail with history & feedback | Yes | Recruiter / Hiring Manager |
| `PATCH` | `/applications/:id/status` | Advance or move application stage | Yes | Recruiter / Hiring Manager |
| `POST` | `/applications/:id/notes` | Add internal recruiter evaluation note | Yes | Recruiter / Hiring Manager |
| `POST` | `/applications/:id/withdraw` | Candidate withdraws application | Yes | Candidate (Owner) |
| `GET` | `/candidates/me/applications` | List current candidate's applications | Yes | Candidate |

---

## 5. Candidate Profiles & Resume Upload

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| `GET` | `/candidates` | Search candidate talent pool | Yes | Recruiter / Hiring Manager |
| `GET` | `/candidates/:id` | Get candidate profile by ID | Yes | Recruiter / Hiring Manager |
| `GET` | `/candidates/profile/me` | Get current candidate profile | Yes | Candidate |
| `PATCH` | `/candidates/profile` | Update candidate bio, experience, targets | Yes | Candidate |
| `POST` | `/candidates/resume` | Upload / replace resume (PDF/DOC/DOCX) | Yes | Candidate |
| `PUT` | `/candidates/skills` | Replace / update skills taxonomy | Yes | Candidate |

---

## 6. Interview Management & Scorecards

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| `POST` | `/interviews` | Schedule interview with conflict check | Yes | Recruiter / Hiring Manager |
| `GET` | `/interviews` | List scheduled interviews | Yes | Recruiter / Hiring Manager |
| `GET` | `/interviews/:id` | Get interview details | Yes | Recruiter / Hiring Manager |
| `PATCH` | `/interviews/:id` | Reschedule or update interview | Yes | Recruiter / Hiring Manager |
| `DELETE` | `/interviews/:id` | Cancel interview | Yes | Recruiter / Hiring Manager |
| `POST` | `/interviews/:id/feedback` | Submit candidate scorecard & rating | Yes | Recruiter / Hiring Manager |
| `GET` | `/interviews/:id/feedback` | List feedback scorecards for interview | Yes | Recruiter / Hiring Manager |

---

## 7. Real-Time Notifications

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| `GET` | `/notifications` | List user's persistent notifications | Yes | Any |
| `PATCH` | `/notifications/:id/read` | Mark single notification as read | Yes | Any |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read | Yes | Any |
| `DELETE` | `/notifications/:id` | Delete notification | Yes | Any |

---

## 8. Analytics & Super Admin

| Method | Endpoint | Description | Auth Required | Roles |
|---|---|---|---|---|
| `GET` | `/analytics/recruiter/overview` | Recruitment funnel & trends | Yes | Recruiter / Hiring Manager |
| `GET` | `/analytics/recruiter/jobs` | Job requisition performance metrics | Yes | Recruiter / Hiring Manager |
| `GET` | `/analytics/candidate/overview` | Candidate application status counts | Yes | Candidate |
| `GET` | `/analytics/admin/overview` | Platform-wide SaaS metrics | Yes | Super Admin |
| `GET` | `/admin/organizations` | List all organizations across platform | Yes | Super Admin |
| `PATCH` | `/admin/organizations/:id/status`| Suspend or activate organization | Yes | Super Admin |
| `GET` | `/admin/users` | List all registered accounts | Yes | Super Admin |
| `PATCH` | `/admin/users/:id/status` | Deactivate or activate user account | Yes | Super Admin |
| `GET` | `/admin/jobs` | Monitor all platform job listings | Yes | Super Admin |
| `GET` | `/admin/activity-logs` | Platform audit logs | Yes | Super Admin |
| `GET` | `/admin/system-health` | Diagnostic telemetry (DB, Uptime, Memory) | Yes | Super Admin |

