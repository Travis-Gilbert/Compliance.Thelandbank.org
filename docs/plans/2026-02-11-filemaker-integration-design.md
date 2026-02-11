# FileMaker Integration Design

**Date:** 2026-02-11
**Status:** Implementation in progress
**Context:** Lucille James (DB Admin) requested that the compliance portal integrate with, rather than compete against, the existing FileMaker system.

## Strategic Position

"FileMaker is the brain. The portal is the face."

The compliance portal is NOT a competing database. It is a web frontend for FileMaker that does two things FM can't do well:

1. **Buyer self-service** — Modern web form for photo/document submissions on any device
2. **Compliance visibility** — Real-time dashboard that computes what's overdue and what action is next

FileMaker remains the system of record. The portal reads from it and writes back to it.

## Architecture

```
FileMaker (on-prem)  <──>  Cloudflare Tunnel  <──>  Vercel Serverless API
                                                         │
                                                         ├── Neon PostgreSQL (sync cache)
                                                         ├── Admin Dashboard (React)
                                                         └── Buyer Portal (/submit)
```

### Sync Strategy

| Direction | Trigger | Data |
|-----------|---------|------|
| FM → Portal | Cron (15 min) or manual sync | Property records, buyer info, dates |
| Portal → FM | On buyer submission | Submission + documents |
| Portal → FM | On communication send | Communication log entry |
| Portal → FM | On admin field edit | Single field PATCH |

FM wins all conflicts. The portal's Neon database is a read cache.

## Implementation

### New Files
- `src/lib/filemakerClient.js` — FM Data API client (token management, CRUD, container uploads)
- `src/config/filemakerFieldMap.js` — Prisma ↔ FM field name mapping with converters
- `api/filemaker/sync.js` — Pull FM records → upsert Neon
- `api/filemaker/push.js` — Push submissions/communications → FM
- `api/filemaker/status.js` — Connection health check + metadata
- `src/pages/FileMakerBridge.jsx` — Integration dashboard page

### Modified Files
- `api/submissions.js` — Fire-and-forget FM push after Neon save
- `.env.example` — FM_* environment variables
- `src/main.jsx` — /bridge route
- `src/components/Layout.jsx` — Integration nav section + live FM status widget

### Environment Variables
```
FM_SERVER_URL=     # FileMaker Server URL or Cloudflare Tunnel URL
FM_DATABASE=       # FM database name
FM_USERNAME=       # Data API account
FM_PASSWORD=       # Data API password
FM_LAYOUT_*=       # Layout names (optional, have defaults)
```

## Buyer Portal Polish
- Upload error messaging (was silent fallback, now shows warning)
- Client-side 10MB file size validation
- Mobile remove button visibility fix
- Confirmation ID copy button
- Form state persistence via sessionStorage

## Connectivity Requirement

GCLBA's FileMaker is on-premise. Recommended: Cloudflare Tunnel (`cloudflared`) installed on a machine on the same network. Creates a secure outbound-only tunnel — no ports opened, no public IP needed.

## Next Steps
1. Get FM Server credentials and layout field names from Lucille
2. Install cloudflared on GCLBA network
3. Update field map with actual FM field names
4. Test sync with real data
5. Deploy to Vercel with FM_* env vars
