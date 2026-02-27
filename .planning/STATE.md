# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** `tofu apply` provisions everything and leaves the site live — no manual steps, no separate deploy script.
**Current focus:** Phase 2 complete - all phases done

## Current Position

Phase: 2 of 2 (Deployment)
Plan: 1 of 1 in current phase
Status: All phases complete
Last activity: 2026-02-26 — Completed 02-01-PLAN.md (deploy chain: pnpm build + s3 sync + CloudFront invalidation)

Progress: [####################] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 9 min
- Total execution time: 18 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-infrastructure | 1 | 8 min | 8 min |
| 02-deployment | 1 | 10 min | 10 min |

**Recent Trend:**
- Last 5 plans: 8 min, 10 min
- Trend: +2 min

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- S3 bucket stays private — CloudFront OAC handles access
- local-exec chosen for build + sync so `tofu apply` is the single deploy command
- Single environment — no staging
- OAC used (not deprecated OAI) for CloudFront S3 origin access
- PriceClass_100 chosen (US/Canada/Europe) — cheapest CloudFront tier
- error_caching_min_ttl = 0 on SPA error responses — avoids stale redirect caching in dev
- Tasks 1+2 committed together: cross-file reference (s3.tf -> cloudfront.tf) requires both files for valid configuration
- null_resource with triggers = { always_run = timestamp() } so every tofu apply re-runs the deploy chain
- Three separate local-exec provisioners (not a shell script) so each step logs independently and chain stops on failure

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-26
Stopped at: Completed 02-01-PLAN.md — deploy chain (pnpm build + s3 sync + CloudFront invalidation) wired into tofu apply. All phases complete.
Resume file: None
