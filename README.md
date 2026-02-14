# GCLBA Compliance Portal

Compliance management system for the **Genesee County Land Bank Authority** (Flint, MI). Tracks property buyers across four programs through graduated enforcement levels, milestone schedules, and automated communications.

**Live:** [compliance.thelandbank.org](https://compliance.thelandbank.org)

---

## Purpose

The GCLBA sells properties through four programs — **Featured Homes**, **Ready4Rehab (R4R)**, **Demolition**, and **VIP** — each with different compliance timelines and requirements. Buyers must meet rehabilitation milestones, submit progress reports, and maintain communication with staff.

This portal replaces manual spreadsheet/FileMaker tracking with:

- **Automated compliance monitoring** — deterministic rule engine calculates due dates, overdue status, and next required actions per property
- **Graduated enforcement** — five levels (0: Compliant through 4: Legal Remedies) with templated communications at each stage
- **Buyer self-service** — token-based portal where buyers submit progress reports and upload photos without needing login credentials
- **Staff action queue** — grouped compliance actions with one-click email send and mail merge
- **FileMaker integration** — bidirectional sync with the existing FileMaker database via Data API

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 18, React Router 6 | Two-surface app: admin portal + buyer form |
| **Styling** | Tailwind CSS 3 | Custom civic design tokens (green/blue palette) |
| **Build** | Vite 5 | Manual vendor chunks for caching |
| **Database** | PostgreSQL (Neon) | Serverless Postgres with Prisma ORM |
| **ORM** | Prisma 6 | 10 models, `db push` workflow |
| **API** | Vercel Serverless Functions | 14 endpoints in `api/` directory |
| **Auth** | Clerk | JWT-based, with ADMIN_API_KEY fallback and prototype mode |
| **Email** | Resend | Mock fallback when API key not set |
| **File Storage** | Vercel Blob | Buyer photo/document uploads |
| **Maps** | Leaflet + react-leaflet 4 | Compliance map with enforcement-level markers |
| **Diagrams** | React Flow (@xyflow/react) | Interactive architecture diagram |
| **Monitoring** | Sentry | Client + server error tracking |
| **Rate Limiting** | Upstash Redis | Per-endpoint API rate limiting |
| **Analytics** | Vercel Analytics + SpeedInsights | Performance monitoring |
| **Validation** | Zod | API input validation schemas |
| **Hosting** | Vercel Pro | Turbo Build (30 cores), edge middleware, cron jobs |
| **CI/CD** | GitHub Actions | Lint, typecheck, test, audit on push/PR |

---

## Project Architecture

### Two-Surface Application

```
┌─────────────────────────────────────────────────────┐
│  Admin Portal (/, /properties, /compliance, etc.)   │
│  ├── Layout.jsx (sidebar nav, keyboard shortcuts)   │
│  ├── ProtectedRoute (Clerk auth)                    │
│  └── 14 pages (Dashboard, Properties, ActionQueue…) │
├─────────────────────────────────────────────────────┤
│  Buyer Portal (/submit)                             │
│  ├── Standalone (no sidebar, no auth)               │
│  └── Token-based access via signed URL              │
├─────────────────────────────────────────────────────┤
│  API Layer (Vercel Serverless)                      │
│  ├── 14 endpoints in api/                           │
│  ├── Edge Middleware (auth gating)                  │
│  └── Cron job (hourly compliance check)             │
├─────────────────────────────────────────────────────┤
│  Database (Neon PostgreSQL + Prisma)                │
│  └── 10 models, 100+ fields on Property             │
├─────────────────────────────────────────────────────┤
│  External Integrations                              │
│  ├── FileMaker Data API (bidirectional sync)        │
│  ├── Resend (transactional email)                   │
│  └── Vercel Blob (file storage)                     │
└─────────────────────────────────────────────────────┘
```

### State Management

`PropertyContext.jsx` uses React's `useReducer` as the central state store:
- Initializes from mock data (40 properties), then fetches from API on mount
- All mutations dispatch locally AND fire-and-forget PATCH to the API
- Local state is source of truth during the session

### Compliance Engine

Deterministic and rule-based:
- `complianceRules.js` defines per-program schedules (days from close), grace periods, required uploads
- `computeDueNow.js` walks the schedule, checks completed actions, returns current status
- Four enforcement actions: ATTEMPT_1, ATTEMPT_2, WARNING, DEFAULT_NOTICE

### Database Schema

10 Prisma models:

| Model | Purpose |
|-------|---------|
| **Buyer** | Contact info, LC forfeit/revert flags, FM status |
| **Program** | Rule key, schedule JSON, grace days, required docs |
| **Property** | 100+ fields: parcel, compliance dates, FM sync, physical details, enforcement |
| **Submission** | Buyer progress/final/monthly reports with form data JSON |
| **Document** | File metadata with Vercel Blob URLs |
| **Communication** | Email/letter log with template, action, status, timestamps |
| **EmailTemplate** | Templated variants per compliance action |
| **AccessToken** | Time-limited buyer portal access tokens |
| **SyncMetadata** | FileMaker sync status tracking |
| **Note** | Property activity log (internal/external visibility) |

### API Endpoints

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/properties` | GET | List properties with filters |
| `/api/properties/[id]` | GET, PATCH | Single property read/update |
| `/api/compliance` | GET | Compliance timing calculations |
| `/api/submissions` | GET, POST | Buyer submission intake + admin list |
| `/api/communications` | GET, POST | Communication log CRUD |
| `/api/templates` | GET, POST, PUT | Email template management |
| `/api/email` | POST | Send single/batch email via Resend |
| `/api/export` | GET | FileMaker-compatible JSON export |
| `/api/filemaker` | GET, POST | FM sync/push (`?action=status\|sync\|push`) |
| `/api/tokens` | GET, POST, DELETE | Access token management + buyer verification |
| `/api/upload` | POST | Vercel Blob file uploads |
| `/api/notes` | GET, POST | Property notes/activity log |
| `/api/cron/compliance-check` | GET | Hourly compliance monitoring (weekdays) |

---

## Security Features

### Authentication & Authorization

- **Clerk JWT authentication** for admin portal (staff access)
- **ADMIN_API_KEY fallback** for API scripts and testing
- **Prototype mode** when no auth is configured (development only; fails closed in production unless `ALLOW_PROTOTYPE_AUTH=true`)
- **Token-based buyer access** — time-limited, per-property signed URLs (no public browsing)
- **Edge Middleware** (`middleware.js`) gates all `/api/*` routes, with explicit public paths for buyer endpoints

### Transport & Storage Security

- **HTTPS enforced** by Vercel (TLS 1.2+, automatic certificates)
- **HSTS** with 2-year max-age, includeSubDomains, preload
- **Data at rest** encrypted by Neon (AES-256) and Vercel (environment variables)
- **Secrets** stored exclusively in Vercel environment variables, never in code

### HTTP Security Headers

Configured in `vercel.json`:
- `Content-Security-Policy` — strict CSP with allowlisted domains for Clerk, Cloudflare, Vercel, Google Fonts
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, microphone, geolocation disabled

### Input Validation & Injection Prevention

- **Zod schemas** validate all API inputs (`src/lib/schemas.js`)
- **Prisma parameterized queries** prevent SQL injection
- **React default escaping** prevents XSS (no `dangerouslySetInnerHTML`)
- **File upload validation** — type-checked (images/PDFs only), size-limited

### Rate Limiting

- **Upstash Redis** per-endpoint rate limiting
- Token validation: 10 requests/min/IP
- Buyer submissions: 5 requests/min/IP

### Monitoring & Audit

- **Sentry** error tracking (client via `@sentry/react`, server via `@sentry/node`)
- **Structured logging** with configurable log levels
- **Communication audit trail** — every email/letter logged with recipient, template, timestamp
- **Note system** — append-only activity log per property with internal/external visibility
- **Vercel Analytics** + **SpeedInsights** for performance monitoring

### Incident Response

- Token compromise: revoke all active tokens via admin UI
- Data breach: disable FM writeback, assess via audit log
- Primary owner: Travis (Real Estate Development Manager)
- Escalation: GCLBA IT department

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database ([Neon](https://neon.tech) recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/Travisfromyoutube/Compliance.Thelandbank.org.git
cd Compliance.Thelandbank.org

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database connection strings

# Push database schema
npm run db:push

# Seed initial data (optional)
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon pooled connection string |
| `DIRECT_URL` | Yes | Neon direct connection (for Prisma) |
| `VITE_CLERK_PUBLISHABLE_KEY` | No | Clerk frontend auth key |
| `CLERK_SECRET_KEY` | No | Clerk backend auth key |
| `ADMIN_API_KEY` | No | Static API key fallback |
| `RESEND_API_KEY` | No | Email sending (mock mode without it) |
| `APP_URL` | No | Base URL for email links |
| `UPSTASH_REDIS_REST_URL` | No | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Rate limiting |
| `FM_SERVER_URL` | No | FileMaker Data API host |
| `FM_DATABASE` | No | FileMaker database name |
| `FM_USERNAME` | No | FileMaker API credentials |
| `FM_PASSWORD` | No | FileMaker API credentials |
| `SENTRY_DSN` | No | Server-side error monitoring |
| `VITE_SENTRY_DSN` | No | Client-side error monitoring |
| `LOG_LEVEL` | No | Logging verbosity (debug/info/warn/error) |

The portal works with only `DATABASE_URL` and `DIRECT_URL` set. All other integrations (auth, email, FM sync, monitoring, rate limiting) gracefully degrade when their respective keys are absent.

### Development Commands

```bash
npm run dev          # Vite dev server (localhost:5173, frontend only)
npm run build        # prisma generate && vite build
npm run preview      # Preview production build
npm run db:push      # Push schema changes to Neon
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio GUI
```

For full-stack local development (frontend + API): use `vercel dev` (Vercel CLI).

### Deployment

```bash
git push origin main
npx vercel@50.15.0 --prod
```

Vercel Pro with Turbo Build (30 cores). Cron job runs compliance checks hourly on weekdays (8 AM - 6 PM ET).

---

## Project Structure

```
├── api/                        # Vercel serverless functions (14 endpoints)
│   ├── properties.js           # Property list
│   ├── properties/[id].js      # Single property CRUD
│   ├── compliance.js           # Compliance timing
│   ├── submissions.js          # Buyer submissions
│   ├── communications.js       # Communication log
│   ├── templates.js            # Email templates
│   ├── email.js                # Email sending
│   ├── export.js               # FM-compatible export
│   ├── filemaker.js            # FM sync/push (?action= router)
│   ├── tokens.js               # Access tokens (?action= router)
│   ├── upload.js               # Vercel Blob uploads
│   ├── notes.js                # Property notes
│   ├── _cors.js                # CORS/security helper
│   └── cron/
│       └── compliance-check.js # Hourly compliance cron
├── prisma/
│   ├── schema.prisma           # Database schema (10 models)
│   └── seed.js                 # Database seeder
├── src/
│   ├── main.jsx                # Entry point, routing, auth wrapping
│   ├── index.css               # Global styles, grid background
│   ├── components/
│   │   ├── Layout.jsx          # Admin shell (sidebar, nav, shortcuts)
│   │   ├── PropertyDetailDrawer.jsx
│   │   ├── EmailPreview.jsx
│   │   ├── ui/                 # Reusable UI (Card, DataTable, StatusPill…)
│   │   ├── buyer/              # Buyer form components
│   │   ├── howItWorks/         # React Flow diagram components
│   │   └── bridge/             # FM Bridge window chrome
│   ├── config/
│   │   ├── complianceRules.js  # Per-program enforcement schedules
│   │   └── filemakerFieldMap.js # FM ↔ Portal field mapping
│   ├── context/
│   │   └── PropertyContext.jsx # Central state (useReducer + API sync)
│   ├── data/
│   │   ├── mockData.js         # 40 demo properties + enum exports
│   │   ├── mockDataGenerator.js # Seeded PRNG generator
│   │   ├── programPolicies.js  # GCLBA program policies
│   │   └── emailTemplates.js   # Default email templates
│   ├── hooks/
│   │   ├── usePageTitle.js     # Document title per page
│   │   └── useApiClient.js     # API client wrapper
│   ├── icons/
│   │   └── iconMap.js          # 60+ semantic icon mappings (Lucide)
│   ├── lib/
│   │   ├── db.js               # Prisma client singleton
│   │   ├── auth.js             # Clerk JWT + API key auth
│   │   ├── computeDueNow.js    # Client compliance timing
│   │   ├── computeDueNow.server.js # Server batch timing
│   │   ├── emailSender.js      # Resend + mock fallback
│   │   ├── filemakerClient.js  # FM Data API client
│   │   ├── filemakerExport.js  # FM export formatter
│   │   ├── programTypeMapper.js # Program name conversions
│   │   ├── templateRenderer.js # Email variable interpolation
│   │   ├── rateLimit.js        # Upstash Redis rate limiting
│   │   ├── schemas.js          # Zod validation schemas
│   │   ├── sentry.js           # Sentry wrapper
│   │   ├── logger.js           # Structured logging
│   │   ├── tokenGenerator.js   # Access token generation
│   │   ├── uploadFile.js       # Browser upload helper
│   │   └── validate.js         # Validation error handling
│   ├── pages/                  # 16 page components
│   │   ├── Dashboard.jsx       # Overview + stats (eager)
│   │   ├── Properties.jsx      # Property table (eager)
│   │   ├── PropertyDetail.jsx  # Single property view
│   │   ├── BuyerSubmission.jsx # Buyer form (standalone)
│   │   ├── Compliance.jsx      # Compliance overview
│   │   ├── ActionQueue.jsx     # Staff action workflow
│   │   ├── BatchEmail.jsx      # Bulk email sending
│   │   ├── CommunicationLog.jsx
│   │   ├── TemplateManager.jsx
│   │   ├── UpcomingMilestones.jsx
│   │   ├── AuditTrail.jsx
│   │   ├── ComplianceMap.jsx   # Leaflet map
│   │   ├── Reports.jsx
│   │   ├── Settings.jsx
│   │   └── HowItWorks.jsx     # React Flow architecture diagram
│   └── utils/
│       └── milestones.js       # Dashboard stat calculations
├── docs/                       # Design docs, plans, specs
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── SECURITY.md
│   ├── feature-spec.md
│   ├── FM-PORTAL-TASKS.md
│   └── plans/                  # Dated design/implementation plans
├── middleware.js                # Vercel Edge Middleware (API auth)
├── vercel.json                 # Deployment config (headers, cron, rewrites)
├── tailwind.config.js          # Design tokens
├── vite.config.js              # Build config with vendor chunks
├── CLAUDE.md                   # AI assistant instructions
├── DESIGN-SPEC.md              # Visual design specification
└── .github/
    ├── workflows/ci.yml        # CI pipeline
    └── dependabot.yml          # Dependency updates
```

---

## Domain Concepts

### Programs

| Program | Cadence | Typical Timeline |
|---------|---------|------------------|
| Featured Homes | Milestones | Rehab deadlines from closing date |
| Ready4Rehab (R4R) | Milestones | Scope approval → permit → rehab completion |
| Demolition | Milestones | Demo permit → final certification |
| VIP | Monthly/Quarterly | Renovation or new build tracking |

### Enforcement Levels

| Level | Name | Trigger |
|-------|------|---------|
| 0 | Compliant | All milestones on track |
| 1 | Notice | First missed milestone |
| 2 | Warning | Second attempt, continued non-compliance |
| 3 | Default | Formal default notice |
| 4 | Legal Remedies | Escalation to legal |

### Compliance Statuses

On Track, Due Soon, Overdue, Completed, In Cure Period, In Default

---

## FileMaker Integration

The portal integrates with the GCLBA's existing FileMaker database:

- **Field map** (`filemakerFieldMap.js`): 50+ confirmed field mappings between Prisma and FM
- **TBD_ pattern**: Undiscovered FM field names get `TBD_` prefix; auto-skipped during writes
- **Sync flow**: `GET /api/filemaker?action=sync` pulls FM records and upserts to PostgreSQL
- **Push flow**: `POST /api/filemaker?action=push` writes portal changes back to FM
- **Parcel ID normalization**: Strips dashes/spaces for consistent matching across systems
- **Status**: Awaiting production FM credentials; field map and sync infrastructure are complete

---

## Contributing

1. Create a feature branch from `main`
2. Make changes following the conventions in `CLAUDE.md`
3. Test locally with `npm run dev` (frontend) or `vercel dev` (full stack)
4. Verify build: `npm run build`
5. Push and create a pull request

---

## License

Private. Genesee County Land Bank Authority.
