# External Integrations

**Analysis Date:** 2026-02-26

## Summary

This is a **static portfolio website with zero external integrations**. No APIs, databases, authentication providers, or backend services are used. All content is static and sourced from `src/data.ts`.

## APIs & External Services

**Not applicable** - No external service integrations in this codebase.

Content is entirely self-contained and client-rendered from static TypeScript data structures.

## Data Storage

**Databases:**
- Not used

**File Storage:**
- Local filesystem only — static assets in `public/` directory
- Production: AWS S3 + CloudFront for hosting (infrastructure outside this codebase)

**Caching:**
- Browser cache only via HTTP headers (configured by S3/CloudFront in production)
- No server-side caching

## Authentication & Identity

**Auth Provider:**
- Not applicable

No user authentication or session management. Portfolio is fully public.

## Monitoring & Observability

**Error Tracking:**
- None configured

**Logs:**
- Browser console only (dev server and client-side errors)
- No server-side logging

## CI/CD & Deployment

**Hosting:**
- AWS S3 + CloudFront (mentioned in project data as deployment target)
- Static site — no server required

**CI Pipeline:**
- Not detected in codebase
- Deployment would be manual or via external GitHub Actions/other CI provider

## Environment Configuration

**Required env vars:**
- None — application has zero runtime environment dependencies

**Secrets location:**
- Not applicable

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## External Resources

**Only external dependencies are CDN-hosted assets:**

1. **Google Fonts** (loaded in `index.html`):
   - Inter font family
   - Space Grotesk font family
   - Space Mono font family
   - DNS preconnect: `https://fonts.googleapis.com`
   - Resource preconnect: `https://fonts.gstatic.com`

2. **Google Material Symbols** (loaded in `index.html`):
   - Material Symbols Outlined icon font (v100-v700 weight range, all fill states)
   - Used by Material Symbol names in `src/data.ts` (icon field in tech categories)

## Data Sources

**All portfolio content is hardcoded static data:**

Location: `src/data.ts`

Contains:
- Navigation links (`navLinks`)
- Hero biography (`heroBio`)
- Tech stack categories (`techCategories`) — references Material Symbols icon names
- Work experience (`experiences`)
- Projects list (`projects`) — includes links to external GitHub repositories
- Roadmap timeline (`roadmapNodes`)

## Social Links

**No API integrations** — External links to social profiles:

- GitHub: `https://github.com/Michael-R-Dickinson` (external link in `src/components/Footer.tsx`)
- LinkedIn: `https://www.linkedin.com/in/michael-r-dickinson/` (external link in `src/components/Footer.tsx`)
- Project repositories: Direct GitHub links in projects data

These are static `<a>` tags with no backend integration.

## Build & Deployment

**Deployment workflow (external to codebase):**

1. `pnpm build` → Produces `dist/` directory
2. Upload `dist/` to AWS S3 bucket
3. CloudFront distribution serves static assets with caching

No build-time API calls or integrations.

---

*Integration audit: 2026-02-26*
