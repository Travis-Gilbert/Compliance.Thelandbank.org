Run a pre-demo checklist for the compliance portal.

1. Run `npm run build` — report any errors
2. Read vercel.json and check for misconfigurations
3. Read prisma/schema.prisma and verify all models are consistent
4. Check that all API routes in api/ have:
   - Input validation (zod)
   - Error handling (try/catch with consistent error shape)
   - Audit logging for state changes
5. Check that environment variables referenced in code are listed in .env.example
6. Look for any hardcoded secrets, URLs, or credentials in the codebase
7. Check that CORS is not set to wildcard
8. Verify the token validation endpoint has rate limiting
9. Report a summary: what's ready, what needs fixing, risk level for demo
