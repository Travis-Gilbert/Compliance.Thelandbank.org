# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
│  Staff (Clerk auth)              Buyers (JWT token links)   │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│              VERCEL (Hosting + Compute)                      │
│                                                              │
│  ┌──────────────┐    ┌────────────────────────────────┐     │
│  │  Vite + React │    │  Serverless Functions (/api/*) │     │
│  │  SPA Frontend │───▶│  - Token validation            │     │
│  │               │    │  - Buyer submissions           │     │
│  │  Tailwind CSS │    │  - Action queue + email/PDF    │     │
│  └──────────────┘    │  - FM sync + outbox processing │     │
│                       │  - Admin endpoints             │     │
│                       └──────────┬─────────────────────┘     │
│                                  │                           │
│  Env Vars (secrets):             │                           │
│  TOKEN_SECRET                    │                           │
│  DATABASE_URL                    │                           │
│  CLERK_SECRET_KEY                │                           │
│  FILEMAKER_*                     │                           │
│  RESEND_API_KEY                  │                           │
└──────────────────────────────────┼───────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
     ┌──────────────────────┐      ┌──────────────────────────┐
     │    NEON POSTGRES     │      │   FILEMAKER SERVER       │
     │    (Cache + Portal   │◀────▶│   (System of Record)     │
     │     Working DB)      │      │                          │
     │                      │      │  Properties, Buyers,     │
     │  - Properties cache  │      │  Programs, Compliance    │
     │  - Buyer tokens      │      │  History                 │
     │  - Submissions       │      │                          │
     │  - Outbox queue      │      │  Data API:               │
     │  - Audit log         │      │  /fmi/data/v1/databases  │
     │  - Settings          │      │                          │
     └──────────────────────┘      └──────────────────────────┘
```

## Data Flow

### Normal Operation (Read-Only Sync)
```
FileMaker → (scheduled sync) → Neon cache tables
Staff → Portal UI → Neon → Display
Buyer → Token link → Neon → Prefilled form → Submission → Neon
```

### With Writeback Enabled
```
Submission → Neon (immediate) → Outbox queue → (worker) → FileMaker
                                     ↓
                              Retry on failure
                              Portal keeps working
```

## Where Things Live

| Thing | Location |
|-------|----------|
| **Secrets** | Vercel Environment Variables (encrypted at rest) |
| **Application logs** | Vercel Function Logs (runtime) + Vercel Build Logs |
| **Audit trail** | `audit_log` table in Neon Postgres |
| **System of record** | FileMaker Server (properties, buyers, programs, history) |
| **Working database / cache** | Neon Postgres (submissions, tokens, outbox, portal state) |
| **Generated PDFs** | Dev: local `/tmp/letters/` · Prod: Vercel Blob or S3 |
| **Source code** | GitHub `Travisfromyoutube/Compliance.Thelandbank.org` |
| **Deployments** | Vercel — auto-deploy on push to `main` |

## Tech Stack Rationale

| Choice | Why |
|--------|-----|
| Vite + React | Fast DX, SPA keeps UI snappy, team familiarity |
| Vercel | Zero-config deploys, serverless scales to zero, free tier works for POC |
| Neon Postgres | Serverless Postgres, branching for dev, Prisma-compatible |
| Prisma | Type-safe DB access, migration management, schema as code |
| Clerk | Auth without building auth — SSO-ready for GCLBA if needed |
| JWT tokens | Stateless buyer access — no login required, self-contained |
| Tailwind | Utility-first CSS, consistent with existing design system |
| FileMaker Data API | Only supported integration path for FM — REST-based |
| Outbox pattern | Decouples portal from FM availability — portal never goes down because FM is down |
