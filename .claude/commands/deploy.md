Deploy the compliance portal to Vercel.

1. Run `npm run build` — stop if it fails
2. Run `npx prisma generate` — ensure client is fresh
3. Check git status — commit any uncommitted changes with a descriptive message
4. Push to main: `git push origin main`
5. Verify Vercel auto-deploys (or run `vercel --prod` if needed)
6. Report: deployment URL, any build warnings, and next steps
