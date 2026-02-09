# CLAUDE.md - Landbank Compliance Portal

## Project Overview

Genesee County Land Bank (GCLB) Compliance Portal — a single-page React application where property buyers submit progress photos, financial documentation, and receipts for property rehabilitation programs (Ready4Rehab, Featured Homes, VIP).

## Tech Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS 3
- **Backend:** Vercel serverless functions (Node.js) in `api/`
- **Styling:** Tailwind CSS with PostCSS + Autoprefixer
- **Icons:** Lucide React
- **Module system:** ES Modules (`"type": "module"`)
- **Deployment:** Vercel

## Directory Structure

```
src/
  App.jsx        # Main CompliancePortal component (~535 lines)
  main.jsx       # React entry point
  index.css      # Tailwind CSS imports
api/
  submit.js      # POST /api/submit — form submission endpoint (demo mode, FileMaker integration pending)
index.html       # HTML entry point
```

## Commands

```sh
npm run dev      # Start Vite dev server
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

## Key Architecture Notes

- The entire frontend is a single React component (`CompliancePortal`) using hooks for state management (useState, useRef).
- File uploads support drag-and-drop with client-side preview for images.
- The API endpoint at `api/submit.js` currently runs in demo mode — it logs submissions and returns success but does not yet integrate with FileMaker Data API (marked as TODO).
- `vercel.json` rewrites `/api/*` to the serverless functions.
- No test framework, linter, or formatter is currently configured.

## Code Conventions

- JSX files use `.jsx` extension
- Tailwind utility classes for all styling (no custom CSS beyond Tailwind imports)
- CORS is enabled with wildcard origin on the API endpoint
- Form validation is handled client-side with inline error display
