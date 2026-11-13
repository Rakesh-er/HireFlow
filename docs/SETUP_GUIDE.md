# HireFlow Setup & Deployment Guide

This guide walks through configuring, initializing, and running the **HireFlow** platform in development and production environments.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher (or via Docker Compose)
- **Docker & Docker Compose** (Optional, for containerized deployment)

---

## 2. Environment Variables Configuration

Before launching the platform, prepare your `.env` configuration files:

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and supply your database connection string and secrets:

```env
# Application Settings
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:5000/api/v1

# PostgreSQL Database Connection URL
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hireflow_db?schema=public

# Security Secrets (Generate secure random 64-character strings for production)
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=your_cookie_encryption_secret_here

# File Storage
STORAGE_PROVIDER=local
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

# Optional Integrations (Fallback to local console in development)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@hireflow.io

REDIS_URL=
```

### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=HireFlow
VITE_APP_ENV=development
```

---

## 3. Database Initialization & Seeding

After creating your PostgreSQL database (e.g. `hireflow_db`), run the following commands from the `backend/` directory:

```bash
cd backend

# 1. Generate the Prisma Client types
npx prisma generate

# 2. Apply migrations to initialize the schema
npx prisma migrate dev --name init

# 3. Seed demo accounts, sample jobs, candidates, and applications
npx prisma db seed
```

### Resetting the Database (Development)
If you ever need to reset the database during development:
```bash
npx prisma migrate reset
```

### Exploring Data visually with Prisma Studio
```bash
npx prisma studio
```
Prisma Studio opens at `http://localhost:5555`.

---

## 4. Default Development Credentials

The seed script creates the following pre-configured demo accounts (Default password: `Password123!`):

| Role | Email | Password | Organization |
|---|---|---|---|
| **Super Admin** | `admin@hireflow.io` | `Password123!` | Platform Level |
| **Recruiter / HR Admin** | `recruiter@acme.com` | `Password123!` | Acme Corporation |
| **Hiring Manager** | `manager@acme.com` | `Password123!` | Acme Corporation |
| **Candidate 1** | `alex.rivera@example.com` | `Password123!` | N/A |
| **Candidate 2** | `elena.rostova@example.com` | `Password123!` | N/A |

---

## 5. Running the Application Independently

### Launch Backend Server
```bash
cd backend
npm install
npm run dev
```
- API Base: `http://localhost:5000`
- Swagger Documentation: `http://localhost:5000/api-docs`
- Health Telemetry: `http://localhost:5000/health`

### Launch Frontend Application
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
- Frontend UI: `http://localhost:5173`

---

## 6. Running with Docker Compose

To spin up the entire stack (PostgreSQL, Redis, Backend, Frontend) with a single command:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

