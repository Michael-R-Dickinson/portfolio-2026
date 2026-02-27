---
phase: 02-deployment
verified: 2026-02-26T00:00:00Z
status: human_needed
score: 3/3 must-haves verified (automated); 1 item requires human confirmation
human_verification:
  - test: "Run `tofu apply` and visit the CloudFront URL"
    expected: "The current portfolio site loads at the CloudFront URL immediately after apply, with no stale content served from cache"
    why_human: "Requires live AWS credentials, a running CloudFront distribution, and a browser to confirm the deployed site matches current source. Cannot verify end-to-end HTTP behavior programmatically."
---

# Phase 2: Deployment Verification Report

**Phase Goal:** `tofu apply` builds the frontend and syncs it to S3 so the live site reflects the current source — no separate deploy step
**Verified:** 2026-02-26
**Status:** human_needed — all automated checks pass; one item requires live execution confirmation
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Running `tofu apply` triggers a fresh `pnpm build` before any file sync | VERIFIED | `deploy.tf` line 6–9: first `local-exec` provisioner sets `working_dir = "${path.root}/../frontend"` and runs `pnpm build`; `always_run = timestamp()` trigger guarantees execution on every apply |
| 2 | Built `dist/` contents appear in the S3 bucket after apply completes | VERIFIED | `deploy.tf` line 11–13: second provisioner runs `aws s3 sync ${path.root}/../frontend/dist s3://${aws_s3_bucket.portfolio.bucket} --delete`; `frontend/dist/` exists with built assets (`index.html`, `assets/`) |
| 3 | Visiting the CloudFront URL immediately after apply shows the current version of the site with no stale cache | VERIFIED (automated) / NEEDS HUMAN | `deploy.tf` line 15–17: third provisioner runs `aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.portfolio.id} --paths '/*'`; invalidation path is `/*` covering all content; SUMMARY reports human-verify checkpoint was approved |

**Score:** 3/3 truths verified (automated assertions); 1 truth requires human execution confirmation for end-to-end LiveURL behavior

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `infra/deploy.tf` | `null_resource "deploy"` with three ordered `local-exec` provisioners: build, sync, invalidate | VERIFIED | File exists, 18 lines, contains `null_resource "deploy"`, all three provisioners present, no stubs or placeholders |
| `infra/main.tf` | `hashicorp/null ~> 3.0` provider declared | VERIFIED | Lines 12–15 of `main.tf` declare the null provider; `provider "aws"` block also present |
| `infra/.terraform.lock.hcl` | `hashicorp/null` provider hash recorded | VERIFIED | Line 40 of lock file: `provider "registry.opentofu.org/hashicorp/null"` |
| `frontend/` | Frontend source present so `pnpm build` can execute | VERIFIED | `frontend/src/` contains `App.tsx`, `main.tsx`, `components/`, `pages/`, `data.ts`; `frontend/dist/` contains built output |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `null_resource.deploy` provisioner 1 | `frontend/` directory | `working_dir = "${path.root}/../frontend"` with `pnpm build` | WIRED | `deploy.tf` line 7: `working_dir = "${path.root}/../frontend"` — `path.root` resolves to `infra/`, so `../frontend` is the correct relative path |
| `null_resource.deploy` provisioner 2 | `aws_s3_bucket.portfolio.bucket` | `aws s3 sync` command interpolating bucket resource | WIRED | `deploy.tf` line 12: `s3://${aws_s3_bucket.portfolio.bucket}` references the live resource; `--delete` flag present |
| `null_resource.deploy` provisioner 3 | `aws_cloudfront_distribution.portfolio.id` | `aws cloudfront create-invalidation` interpolating distribution resource | WIRED | `deploy.tf` line 16: `--distribution-id ${aws_cloudfront_distribution.portfolio.id}` references the live resource; `--paths '/*'` present |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DEPLOY-01 | `02-01-PLAN.md` | `tofu apply` triggers `pnpm build` via `local-exec` before syncing files | SATISFIED | `deploy.tf` provisioner 1: `pnpm build` in `working_dir = "${path.root}/../frontend"` |
| DEPLOY-02 | `02-01-PLAN.md` | Built `dist/` contents synced to S3 via `aws s3 sync` in `local-exec` | SATISFIED | `deploy.tf` provisioner 2: `aws s3 sync ${path.root}/../frontend/dist s3://${aws_s3_bucket.portfolio.bucket} --delete` |
| DEPLOY-03 | `02-01-PLAN.md` | CloudFront invalidation (`/*`) triggered after sync so changes are immediately live | SATISFIED | `deploy.tf` provisioner 3: `aws cloudfront create-invalidation --distribution-id ... --paths '/*'` |

No orphaned requirements. REQUIREMENTS.md maps DEPLOY-01, DEPLOY-02, DEPLOY-03 exclusively to Phase 2. All three are claimed in the PLAN frontmatter and have direct implementation evidence in `deploy.tf`.

---

## Anti-Patterns Found

None. `deploy.tf` contains no TODO/FIXME comments, no placeholder strings, no empty return values, and no stub implementations. All three provisioners contain substantive commands with real resource references.

---

## Human Verification Required

### 1. End-to-end deploy produces live site

**Test:** With AWS credentials configured, run `tofu apply` from the `infra/` directory and then visit the URL from `tofu output cloudfront_url` in a browser.

**Expected:** The three provisioners execute in sequence (pnpm build output visible, then aws s3 sync listing uploaded files, then CloudFront invalidation JSON with `"Status": "InProgress"`), apply completes without error, and the CloudFront URL serves the current portfolio site.

**Why human:** Requires live AWS credentials, a running CloudFront distribution, and a browser. Cannot verify real HTTP responses, DNS propagation, or actual CloudFront cache behavior programmatically. NOTE: SUMMARY documents that this human-verify checkpoint was already executed and approved on 2026-02-26.

---

## Gaps Summary

No gaps. All three must-have truths are supported by substantive, correctly-wired implementation in `infra/deploy.tf`. The single `null_resource "deploy"` contains all required provisioners in the correct order, references live AWS resources by Terraform interpolation, and uses `always_run = timestamp()` to guarantee re-execution on every `tofu apply`. The null provider is declared in `main.tf` and locked in `.terraform.lock.hcl`. The frontend source and built `dist/` are present.

The only open item is the human-verification checkpoint for the live end-to-end URL test — which the SUMMARY records as already approved.

---

_Verified: 2026-02-26_
_Verifier: Claude (gsd-verifier)_
