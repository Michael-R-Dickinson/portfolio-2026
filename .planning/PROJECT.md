# Portfolio Infrastructure

## What This Is

OpenTofu infrastructure to provision and deploy a Vite-based portfolio site to AWS. A single `tofu apply` builds the React/Vite frontend, creates the S3 bucket and CloudFront distribution, and syncs the static files — leaving a live site at the CloudFront URL.

## Core Value

`tofu apply` provisions everything and leaves the site live — no manual steps, no separate deploy script.

## Requirements

### Validated

- ✓ Vite frontend builds to `dist/` via `pnpm build` — existing
- ✓ OpenTofu project scaffolded with AWS provider (~5.0) and `aws_region` variable — existing

### Active

- [ ] S3 bucket configured for static site hosting
- [ ] CloudFront distribution fronting the S3 bucket
- [ ] `tofu apply` triggers `pnpm build` via local-exec before upload
- [ ] Built `dist/` contents synced to S3 via local-exec (`aws s3 sync`)
- [ ] CloudFront cache invalidation triggered after sync

### Out of Scope

- Custom domain / ACM certificate — CloudFront default URL is sufficient
- CI/CD pipeline — manual `tofu apply` is the deploy mechanism
- Multiple environments — single deployment target

## Context

- Frontend is a React 19 SPA, Vite 7, TypeScript, Tailwind CSS 4. No backend, no API, no auth.
- Build output: `dist/` directory (standard Vite output)
- Package manager: pnpm — build command is `pnpm build` (runs tsc then vite build)
- Infra lives in `infra/` subdirectory of the monorepo root
- AWS provider already locked at v5.100.0 (darwin_arm64)
- Region defaults to `us-west-2` via `var.aws_region`

## Constraints

- **Infra tool**: OpenTofu — not Terraform (syntax is identical but toolchain differs)
- **File upload**: Must use `aws s3 sync` via `local-exec` (no S3 object resources per file)
- **No server-side rendering**: Pure static site, CloudFront serves files directly from S3

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| local-exec for build + sync | User wants `tofu apply` to be the single deploy command | — Pending |
| S3 bucket not public | CloudFront OAC handles access, bucket stays private | — Pending |
| Single env | Portfolio site — no staging required | — Pending |

---
*Last updated: 2026-02-26 after initialization*
