# Security Checklist

## Authentication & Authorization

- [ ] Staff auth via Clerk (email + password or SSO)
- [ ] Buyer access via signed JWT tokens only — no public browsing
- [ ] Token expiration enforced (default 14 days)
- [ ] One-time-use option available per token
- [ ] Admin-only routes protected by Clerk middleware
- [ ] Rate limiting on token validation endpoint (10/min/IP)
- [ ] Rate limiting on submission endpoint (5/min/IP)
- [ ] CORS restricted to portal domain (not wildcard)

## Encryption

- [ ] **In transit**: HTTPS enforced by Vercel (TLS 1.2+, auto-certs)
- [ ] **At rest**: Neon encrypts data at rest (AES-256)
- [ ] **At rest**: Vercel encrypts environment variables
- [ ] **Secrets**: TOKEN_SECRET, DATABASE_URL, API keys — never in code, only in Vercel env vars

## Token Security

- [ ] JWT signed with HS256 using TOKEN_SECRET (min 32 chars)
- [ ] Token payload contains only: sub (buyerId), pid (propertyId), exp (expiration)
- [ ] No sensitive data in token payload (no PII, no addresses)
- [ ] Expired tokens rejected with clear error message
- [ ] Invalid tokens rejected — no information leakage in error
- [ ] Token hash stored server-side (if using HMAC approach)

## Audit Logging

- [ ] Every token validation logged (success + failure)
- [ ] Every buyer submission logged with IP
- [ ] Every email sent logged with recipient + template
- [ ] Every letter generated logged with property + path
- [ ] Every FM sync operation logged (records synced, errors)
- [ ] Every outbox job status change logged
- [ ] Every settings change logged (toggle flips)
- [ ] Audit log is append-only — no updates or deletes via API

## Input Validation

- [ ] All API inputs validated with zod schemas
- [ ] File uploads: type-checked (images/PDFs only), size-limited (10MB)
- [ ] SQL injection prevented by Prisma parameterized queries
- [ ] XSS prevented by React's default escaping + no dangerouslySetInnerHTML

## Backups & Retention

- [ ] Neon: point-in-time recovery available (check plan tier)
- [ ] FileMaker: existing IT backup schedule (confirm with IT)
- [ ] Audit log retention: indefinite (small table, low cost)
- [ ] Generated PDFs: retain for duration of compliance period + 1 year

## Incident Response

- [ ] **Primary owner**: Travis (Real Estate Development Manager)
- [ ] **Escalation**: GCLBA IT department
- [ ] **If token compromise suspected**: revoke all active tokens via admin UI, rotate TOKEN_SECRET
- [ ] **If data breach suspected**: disable FM writeback toggle immediately, assess via audit log
- [ ] **Monitoring**: Vercel deployment notifications, function error alerts
