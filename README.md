# HireFlow – Enterprise-Grade Recruitment & Applicant Tracking SaaS Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node: v22](https://img.shields.io/badge/Node-v22+-green.svg)](https://nodejs.org/)
[![React: 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript: 5](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Database: PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

**HireFlow** is a modern, enterprise-grade multi-tenant SaaS Recruitment & Applicant Tracking System (ATS). It streamlines the end-to-end recruitment lifecycle for organizations, hiring managers, and candidates—from posting openings and managing an 8-stage interactive Kanban pipeline to conflict-free interview scheduling and actionable analytics.

---

## 🌟 Key Highlights & Modules

- **Multi-Tenant Architecture**: Complete database isolation across organizations with role-based access control (Super Admin, Recruiter, Hiring Manager, Candidate).
- **Interactive ATS Kanban Pipeline**: 8 recruitment stages (`Applied`, `Screening`, `Shortlisted`, `Interview`, `Assessment`, `Offered`, `Hired`, `Rejected`) with atomic transactional audit history and recruiter notes.
- **Conflict-Free Interview Scheduling**: Intelligent interviewer scheduling that prevents calendar collisions, generates video meeting links, and collects structured scorecards.
- **Candidate Self-Service Portal**: Upload and replace resumes (PDF, DOC, DOCX), maintain verified skills taxonomy, track application progress in real-time, and attend interviews.
- **Real-Time WebSocket Notifications**: Instant notification alerts powered by `Socket.IO` paired with persistent PostgreSQL storage.
- **Recruitment Analytics**: Visualized conversion funnels, daily application trends, and job performance charts built with `Recharts`.
- **Super Administrator Control Center**: Platform-wide telemetry, organization suspension/activation, user moderation, and audit logs.
- **API Documentation**: Fully documented REST API with interactive Swagger UI at `/api-docs`.

---

## 🏗️ Project Structure

```
hireflow/
├── frontend/                     # React 18 + Vite + TypeScript Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Reusable design system (Button, Input, Card, Modal, etc.)
│   │   │   ├── layout/           # Sidebar, Header, Navbar, DashboardLayout
│   │   │   └── common/           # StatCard, EmptyState, Skeletons
│   │   ├── contexts/             # AuthContext, SocketContext
│   │   ├── pages/
│   │   │   ├── public/           # Landing, About, Pricing, Public Jobs, Job Details
│   │   │   ├── auth/             # Login, Register, Forgot/Reset Password
│   │   │   ├── recruiter/        # Dashboard, Jobs, Applications, Kanban, Interviews, Analytics, Team
│   │   │   ├── candidate/        # Overview, Profile, Applications, Interviews
│   │   │   └── admin/            # Platform Overview, Orgs, Users, Jobs, Logs, Health
│   │   ├── routes/               # AppRoutes & ProtectedRoute role guards
│   │   ├── services/             # Axios API client with token refresh interceptors
│   │   └── types/                # Domain TypeScript interfaces
│   ├── .env.example
│   └── vite.config.ts
│
├── backend/                      # Node.js + Express + TypeScript API Gateway
│   ├── prisma/
│   │   ├── schema.prisma         # 17 normalized relational models & enums
│   │   └── seed.ts               # Comprehensive development seed dataset
│   ├── src/
│   │   ├── config/               # Prisma client, Swagger, App configuration
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Core business logic
│   │   ├── routes/               # Express router modules
│   │   ├── middleware/           # Auth, RBAC, Upload, ErrorHandler, RateLimiter
│   │   ├── validators/           # Zod schema validators
│   │   ├── sockets/              # Socket.IO real-time event handlers
│   │   ├── utils/                # Token generation, Response helpers, Logger
│   │   ├── app.ts                # Express application setup
│   │   └── server.ts             # HTTP & Socket.IO server initialization
│   ├── uploads/                  # Upload directory for resumes and logos
│   ├── tests/                    # Jest automated integration tests
│   └── .env.example
│
├── docs/                         # Architecture & API documentation
│   ├── API_DOCUMENTATION.md      # Complete REST API reference
│   ├── DATABASE_SCHEMA.md        # Relational ERD & model definitions
│   ├── SETUP_GUIDE.md            # Installation & environment instructions
│   └── ARCHITECTURE.md           # Multi-tenant and security architecture
│
├── docker-compose.yml            # Docker stack configuration
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Configure Environment Variables
Copy the `.env.example` files in both `backend` and `frontend`:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Supply your PostgreSQL connection string in `backend/.env` (e.g. `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hireflow_db?schema=public`).

### 2. Initialize Database & Seed Demo Data
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Start Backend & Frontend
In Terminal 1 (Backend):
```bash
cd backend
npm install
npm run dev
```
- API Base: `http://localhost:5000/api/v1`
- Swagger UI: `http://localhost:5000/api-docs`

In Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔑 Demo Login Accounts

All demo accounts use password: `Password123!`

| Role | Email | Password | Scope |
|---|---|---|---|
| **Super Admin** | `admin@hireflow.io` | `Password123!` | Platform-wide |
| **Recruiter (Admin)** | `recruiter@acme.com` | `Password123!` | Acme Corporation |
| **Hiring Manager** | `manager@acme.com` | `Password123!` | Acme Corporation |
| **Candidate** | `alex.rivera@example.com` | `Password123!` | Job Seeker |

---

## 📖 Documentation Links

- [Setup Guide](file:///w:/rakesh/HireFlow/docs/SETUP_GUIDE.md)
- [API Documentation](file:///w:/rakesh/HireFlow/docs/API_DOCUMENTATION.md)
- [Database Schema](file:///w:/rakesh/HireFlow/docs/DATABASE_SCHEMA.md)
- [System Architecture](file:///w:/rakesh/HireFlow/docs/ARCHITECTURE.md)

