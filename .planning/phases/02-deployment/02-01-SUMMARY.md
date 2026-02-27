---
phase: 02-deployment
plan: 01
subsystem: infra
tags: [terraform, opentofu, null_resource, local-exec, s3, cloudfront, pnpm, deploy]

requires:
  - phase: 01-infrastructure
    provides: aws_s3_bucket.portfolio and aws_cloudfront_distribution.portfolio resources that deploy.tf references

provides:
  - null_resource "deploy" in infra/deploy.tf wiring pnpm build -> aws s3 sync -> CloudFront invalidation
  - Single-command deploy: `tofu apply` builds frontend, syncs to S3, and invalidates CloudFront cache
  - always_run = timestamp() trigger ensuring every apply re-deploys

affects:
  - Any future phase that adds a build step or modifies the deploy pipeline

tech-stack:
  added: [hashicorp/null ~> 3.0]
  patterns:
    - null_resource with timestamp() trigger as always-run deploy hook
    - Three sequential local-exec provisioners (build, sync, invalidate) as an ordered deploy chain
    - path.root interpolation to resolve paths relative to the infra/ working directory

key-files:
  created:
    - infra/deploy.tf
  modified:
    - infra/main.tf
    - infra/.terraform.lock.hcl

key-decisions:
  - "null_resource with triggers = { always_run = timestamp() } chosen so every tofu apply re-runs the deploy chain — tofu plan always shows a change, which is correct and intentional for a deploy resource"
  - "Three separate local-exec provisioners used instead of a shell script so each step is independently logged and the chain fails fast on any error"
  - "working_dir set on pnpm build provisioner only — aws CLI commands use full paths so working_dir is unnecessary"

patterns-established:
  - "Deploy side-effects live in deploy.tf — infrastructure resources stay in their per-type files"
  - "null_resource provisioner chain: build in working_dir, then sync and invalidate with explicit resource references"

requirements-completed: [DEPLOY-01, DEPLOY-02, DEPLOY-03]

duration: ~10min
completed: 2026-02-26
---

# Phase 2 Plan 01: Deployment Summary

**null_resource deploy chain in deploy.tf wiring pnpm build -> aws s3 sync --delete -> CloudFront /* invalidation so `tofu apply` is the entire deploy process**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-26
- **Completed:** 2026-02-26
- **Tasks:** 1 auto + 1 human-verify (approved)
- **Files modified:** 3

## Accomplishments

- `infra/deploy.tf` created with `null_resource "deploy"` containing three ordered local-exec provisioners
- `tofu apply` now triggers a fresh `pnpm build`, syncs `dist/` to S3 with `--delete`, and creates a CloudFront `/*` invalidation
- Human-verify checkpoint approved — live CloudFront URL confirmed serving current portfolio site after apply

## Task Commits

Each task was committed atomically:

1. **Task 1: Create deploy.tf with build, sync, and invalidation local-exec chain** - `c12d3b5` (feat)

**Plan metadata:** (to be committed with this summary)

## Files Created/Modified

- `infra/deploy.tf` - null_resource "deploy" with three local-exec provisioners: pnpm build, aws s3 sync, CloudFront invalidation
- `infra/main.tf` - null provider added
- `infra/.terraform.lock.hcl` - null provider hash added

## Decisions Made

- `always_run = timestamp()` trigger ensures every `tofu apply` re-runs all three provisioners. This means `tofu plan` will always show one resource changing — intentional and correct for a deploy resource.
- Three separate `local-exec` blocks rather than a single shell script: each step logs independently and the chain stops immediately on failure.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required beyond AWS credentials already needed for `tofu apply`.

## Next Phase Readiness

- Deploy pipeline is complete and verified working end-to-end
- `tofu apply` is the single command to provision infrastructure and deploy the live site
- No further phases planned — project is complete

## Self-Check: PASSED

- `infra/deploy.tf` exists and contains `null_resource "deploy"` with all three local-exec provisioners
- Task 1 commit `c12d3b5` confirmed in git history

---
*Phase: 02-deployment*
*Completed: 2026-02-26*
