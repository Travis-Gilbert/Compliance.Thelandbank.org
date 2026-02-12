# GCLBA Compliance Portal

## What This Is
A Next.js compliance tracking portal for the Genesee County Land Bank Authority.
Replaces manual FileMaker workflows for property compliance across Featured Homes,
Ready for Resale (R4R), and Vacant Improvement Program (VIP).

FileMaker is the system of record. Neon Postgres is the cache/working database.
The portal must never corrupt FileMaker data. Safety-first integration.

## Tech Stack
- **Framework:** Vite + React (SPA), deployed on Vercel
- **API:** Vercel serverless functions (`/api/*`)
- **Database:** Neon Postgres via Prisma ORM
- **Auth:** Clerk (staff) + JWT tokens (buyers)
- **Styling:** Tailwind CSS
- **FM Integration:** FileMaker Data API (read-only first, writes behind toggle)
- **Email:** Resend (or Postmark — check env)
- **PDF Generation:** @react-pdf/renderer or pdf-lib

## Project Structure
```
├── api/                  # Vercel serverless routes
├── src/
│   ├── components/       # React UI components
│   ├── pages/            # Route pages
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities, API clients, token helpers
├── prisma/
│   └── schema.prisma     # Database schema (source of truth for Neon)
├── docs/                 # Architecture, features, security docs
├── public/               # Static assets
└── compliance-source/    # Reference data / FM schema docs
```

## Commands
```bash
npm run dev              # Local dev server (Vite)
npm run build            # Production build
npx prisma migrate dev   # Run DB migrations locally
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema to Neon (careful)
vercel --prod            # Deploy to production
vercel                   # Deploy preview
```

## Code Patterns — YOU MUST FOLLOW THESE

1. **API routes** go in `api/` as standalone serverless functions. Export default handler.
2. **Prisma** for all DB access. Never raw SQL unless Prisma can't express it.
3. **Validation** with zod on every API input. Never trust client data.
4. **Error responses** use consistent shape: `{ error: string, code?: string }`.
5. **Audit logging** — every state-changing action creates an `audit_log` row.
6. **Environment variables** — never hardcode secrets. Use `process.env.X`.
   Required env vars are listed in `.env.example`.
7. **FileMaker calls** — always check the read-only toggle before any FM operation.
   Never write to FM unless `ENABLE_FM_WRITEBACK=true`.
8. **Commits** — commit after each logical change with a descriptive message.
   Format: `feat: add buyer token validation` or `fix: handle expired token edge case`.

## Testing
- No test framework yet. When adding tests, use Vitest.
- For now: manual test plan lives in `docs/FEATURES.md` under each feature.
- IMPORTANT: Always verify the app builds (`npm run build`) before committing.

## Known Gotchas
- Vercel serverless functions have a 10s timeout on Hobby plan.
- FileMaker Data API sessions expire after 15 min of inactivity.
- Neon free tier has connection limits — use connection pooling.
- Prisma client must be generated before build (`npx prisma generate`).

## Reference Docs
- Feature specs: `docs/FEATURES.md`
- Architecture: `docs/ARCHITECTURE.md`
- Security posture: `docs/SECURITY.md`
- FileMaker standards: https://filemakerstandards.org/en/code
- FM + LLM guide: https://support.claris.com/s/article/Working-with-LLMs-in-FileMaker-2024
