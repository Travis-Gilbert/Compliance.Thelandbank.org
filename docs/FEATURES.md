# Feature Specifications

> Read this file before implementing any feature.
> Each feature has: Goal, Requirements, Data Model, API Routes, UI, Acceptance Tests.

---

## Feature 1: Token-Based Buyer Portal

### Goal
Each buyer gets a unique, time-limited link per property. The link opens a prefilled
form. No login required. No public browsing. The buyer can only see and update their
own compliance data.

This is the killer feature that makes people say "why would I ever use FileMaker for this?"

### Data Model (Prisma additions)

```prisma
model BuyerToken {
  id           String   @id @default(cuid())
  token        String   @unique          // HMAC or JWT — store hash if HMAC
  propertyId   String
  buyerId      String
  programSlug  String                    // featured_homes | r4r | vip
  reportMonth  String                    // e.g. "2025-02"
  expiresAt    DateTime
  usedAt       DateTime?                 // null until first submission
  oneTimeUse   Boolean  @default(false)  // config flag
  createdAt    DateTime @default(now())
  createdBy    String                    // staff user who generated it
  property     Property @relation(fields: [propertyId], references: [id])
  buyer        Buyer    @relation(fields: [buyerId], references: [id])
}

model BuyerSubmission {
  id           String   @id @default(cuid())
  tokenId      String
  propertyId   String
  buyerId      String
  data         Json                      // { progressNotes, permitStatus, ... }
  submittedAt  DateTime @default(now())
  ipAddress    String?
  token        BuyerToken @relation(fields: [tokenId], references: [id])
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String                       // token_validated | submission_created | email_sent ...
  actor     String                       // staff email or buyer token ID
  target    String?                      // property ID, token ID, etc.
  metadata  Json?
  createdAt DateTime @default(now())
}
```

### API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/buyer/validate-token?token=X` | Validate token, return prefilled data |
| POST | `/api/buyer/submit` | Save submission, log in audit |
| POST | `/api/admin/generate-tokens` | Staff generates token links for buyer/property pairs |
| GET | `/api/admin/tokens` | List active tokens with status |

### Token Generation Logic

```
1. Accept: { buyerId, propertyId, programSlug, reportMonth, expiresInDays? }
2. Generate signed JWT with payload: { sub: buyerId, pid: propertyId, exp: now + 14d }
   - Sign with TOKEN_SECRET env var (min 32 chars, random)
3. Store record in BuyerToken table
4. Return URL: https://compliance-thelandbank-org.vercel.app/submit?token=<jwt>
```

### Token Validation Logic

```
1. Decode JWT — reject if invalid signature or expired
2. Look up BuyerToken by decoded claims — reject if not found or already used (if oneTimeUse)
3. Fetch buyer + property + program data from DB (later: from FM cache)
4. Return prefilled form data
5. Log to audit_log: action=token_validated
```

### UI: `/submit` Page

- Full-screen form, no nav (buyer doesn't need portal navigation)
- Pre-filled read-only fields: buyer name, property address, program, reporting month
- Editable fields: progress notes (textarea), permit status (select), inspection status (select), file uploads
- Submit button → POST to `/api/buyer/submit`
- Success screen: "Thank you. Your update has been recorded."
- Error states: invalid token, expired token, already used — each with a friendly message

### Security Controls

- Rate limit `/api/buyer/validate-token` — 10 requests per minute per IP
- CORS must not be wildcard — whitelist portal domain only
- Token endpoint must reject missing/malformed/expired tokens with 401
- All submissions logged with IP address
- JWT secret: minimum 32 characters, stored in Vercel env vars only

### Acceptance Tests (Manual)

1. ✅ Valid token → opens prefilled form with correct buyer/property data
2. ✅ Invalid token (random string) → shows "Invalid link" error page
3. ✅ Expired token → shows "This link has expired" error page
4. ✅ Submission saves to `buyer_submissions` table with correct data
5. ✅ Submission creates `audit_log` entry
6. ✅ No token in URL → shows "No access" error page
7. ✅ One-time-use token after use → shows "Already submitted" error
8. ✅ Admin can generate tokens for a list of buyer/property pairs
9. ✅ Build succeeds (`npm run build`)

### Environment Variables

```
TOKEN_SECRET=<random-32+-char-string>
```

---

## Feature 2: Action Queue (Compliance Workflow Engine)

### Goal
Transform the Action Queue from a display page into a workflow engine that drives
real compliance work. Staff should be able to see WHY a property is non-compliant,
send an email in one click, generate a letter in one click, and track SLA deadlines.

### Compliance Reason Engine (Server-Side)

Compute these reasons for each property and return them with the queue API:

| Reason Code | Logic |
|-------------|-------|
| `missing_photos` | No photo uploads in current reporting period |
| `overdue_report` | No buyer submission after report_due_date |
| `no_email` | Buyer record has no email address |
| `missing_documents` | Required docs (permit, inspection) not uploaded |
| `no_recent_contact` | last_contacted_at is null or > 30 days ago |

Return as array: `reasons: ["missing_photos", "overdue_report"]`

### Data Model Additions

```prisma
// Add to Property model (or create PropertyCompliance)
model Property {
  // ... existing fields ...
  lastContactedAt    DateTime?
  nextActionDueAt    DateTime?
  letterGeneratedAt  DateTime?
}
```

### API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/queue` | Return properties with compliance status + reasons |
| POST | `/api/queue/send-email` | Send templated email, log, update lastContactedAt |
| POST | `/api/queue/generate-letter` | Generate PDF letter, store, log, update letterGeneratedAt |

### One-Click Email

```
1. Accept: { propertyIds: string[] }
2. For each property:
   a. Fetch buyer email + property + compliance data
   b. Render email from template (merge: name, address, program, status, next steps)
   c. Send via Resend/Postmark
   d. Create audit_log: action=email_sent
   e. Update property.lastContactedAt = now()
3. Return: { sent: number, failed: number, errors: [] }
```

### One-Click Letter Generation

```
1. Accept: { propertyIds: string[] }
2. For each property:
   a. Fetch buyer + property + compliance data
   b. Render PDF from template with merge fields:
      - Buyer name, property address, program name
      - Current compliance status, specific deficiencies
      - Required next steps, deadline
      - GCLBA contact information
   c. Store PDF: dev → local `/tmp/letters/`, prod → consider Vercel Blob or S3
   d. Create audit_log: action=letter_generated
   e. Update property.letterGeneratedAt = now()
3. Return: { generated: number, paths: [] }
```

### SLA Clock Display

For each property in the queue, show:

- **Days since last contact**: `daysSince(property.lastContactedAt)`
  - Green: 0-14 days
  - Yellow: 15-29 days
  - Red: 30+ days
  - Gray: never contacted
- **Next action due**: `property.nextActionDueAt` formatted as date
- **Last contacted**: human-readable date

### UI Requirements

- Checkboxes for multi-select (existing pattern)
- "Send Email" button — disabled if nothing selected — confirmation before send
- "Generate Letter" button — disabled if nothing selected
- Reason badges (colored pills) next to each property: e.g. `[Missing Photos]` `[Overdue Report]`
- SLA clock column with color-coded days
- All actions are idempotent: resending creates a new log entry, doesn't corrupt state
- Toast notifications on success/failure

### Acceptance Tests (Manual)

1. ✅ Queue loads with compliance reasons displayed per property
2. ✅ Selecting properties enables action buttons; deselecting disables them
3. ✅ Send Email → email delivered, audit_log entry created, lastContactedAt updated
4. ✅ Generate Letter → PDF created, audit_log entry created, letterGeneratedAt updated
5. ✅ SLA clock shows correct color coding
6. ✅ Resending email to same property creates new log entry (no duplicate errors)
7. ✅ Build succeeds (`npm run build`)

---

## Feature 3: Safe FileMaker Sync (Read-Only First, Outbox Pattern)

### Goal
Integrate with FileMaker Data API without risking data corruption. The portal must
continue to work even when FileMaker is completely offline. This is the "boring and safe"
approach: read-only by default, writes only behind an explicit toggle, all mutations
go through an outbox queue.

### Phase 1: Read-Only Sync

- **Settings UI**: "FileMaker Read-Only Mode" toggle — default ON
- Sync fetches records from FileMaker Data API and upserts into Neon cache tables
- No writes to FileMaker in this phase
- Show sync status on FM Bridge page: last sync time, records synced, any errors
- This should appear on the FM Bridge feature/page as a simple switch

### Phase 2: Writes Behind Toggle

- **Settings UI**: "Enable FileMaker Writeback" toggle — default OFF
- Only when enabled: portal pushes changes to FileMaker via outbox
- Both toggles visible on the same Settings/FM Bridge page

### Outbox Pattern

```prisma
model Outbox {
  id          String   @id @default(cuid())
  type        String                    // buyer_submission | email_sent | letter_generated
  payload     Json                      // full data needed to write to FM
  status      String   @default("pending") // pending | processing | success | failed
  attempts    Int      @default(0)
  maxAttempts Int      @default(5)
  lastError   String?
  nextRetryAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Processing Logic (`/api/outbox/process`)

```
1. Fetch up to 10 pending jobs where nextRetryAt <= now (or null)
2. For each job:
   a. Set status = processing
   b. Attempt FileMaker Data API call
   c. On success: status = success, log to audit
   d. On failure:
      - Increment attempts
      - Set lastError = error message
      - If attempts < maxAttempts:
        status = pending
        nextRetryAt = now + exponentialBackoff(attempts)
      - Else: status = failed, log to audit
3. Rate limit: max 5 FM API calls per second
```

**Exponential backoff**: `delay = min(baseDelay * 2^attempts, maxDelay)`
- baseDelay: 30 seconds
- maxDelay: 1 hour

### FileMaker Data API Integration

```
Base URL: https://<host>/fmi/data/v1/databases/<database>
Auth: POST /sessions → returns token (expires 15 min)

Key operations:
- GET  /layouts/<layout>/records          → fetch records
- POST /layouts/<layout>/records          → create record
- PATCH /layouts/<layout>/records/<id>    → update record
```

### Mock Mode (for development without FileMaker)

When `FILEMAKER_HOST` is not set or `FILEMAKER_MOCK=true`:
- All FM API calls return mock data from `compliance-source/mock-data/`
- Outbox jobs immediately succeed
- Sync shows "Mock Mode" badge in UI

### Settings UI

On the FM Bridge page, show:
- Toggle: "Read-Only Sync" (on/off) — with explanation text
- Toggle: "Enable Writeback" (on/off) — with warning text and confirmation dialog
- Status panel: last sync time, connection status, pending outbox count
- Table: recent outbox jobs with status

### Environment Variables

```
FILEMAKER_HOST=<fm-server-hostname>
FILEMAKER_DATABASE=<database-name>
FILEMAKER_USERNAME=<api-user>
FILEMAKER_PASSWORD=<api-password>
FILEMAKER_MOCK=false
ENABLE_FM_WRITEBACK=false
```

### Acceptance Tests (Manual)

1. ✅ With FM disconnected: portal loads, all pages work, submissions save to Neon
2. ✅ With FM disconnected: outbox jobs queue with status=pending
3. ✅ With FM connected: read-only sync fetches and caches records in Neon
4. ✅ With FM connected + writeback ON: queued outbox jobs process and mark success
5. ✅ Failed FM call → retry with exponential backoff, eventually marks failed
6. ✅ Settings page shows both toggles with correct states
7. ✅ Mock mode works when FILEMAKER_MOCK=true
8. ✅ Build succeeds (`npm run build`)
