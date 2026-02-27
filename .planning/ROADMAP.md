# Roadmap: Portfolio Infrastructure

## Overview

Two phases deliver the core value: first provision the AWS infrastructure (S3, CloudFront, OAC), then wire up the build-and-sync automation so a single `tofu apply` builds the frontend and leaves the site live.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Infrastructure** - Provision S3, CloudFront, OAC, bucket policy, and expose the distribution URL
- [ ] **Phase 2: Deployment** - Wire `tofu apply` to build the frontend and sync it to S3, then invalidate CloudFront cache

## Phase Details

### Phase 1: Infrastructure
**Goal**: AWS infrastructure exists and the CloudFront URL is accessible — the site can serve files even before deployment automation is wired up
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, OUTPUT-01
**Success Criteria** (what must be TRUE):
  1. `tofu apply` completes without error and creates an S3 bucket that is not publicly accessible
  2. A CloudFront distribution exists with the S3 bucket as origin, protected by OAC
  3. CloudFront returns `index.html` for both the root path and any unknown paths (SPA routing)
  4. `tofu output` prints the CloudFront distribution URL
**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md — S3 bucket (private), OAC, bucket policy, CloudFront distribution with SPA routing, and cloudfront_url output

### Phase 2: Deployment
**Goal**: `tofu apply` builds the frontend and syncs it to S3 so the live site reflects the current source — no separate deploy step
**Depends on**: Phase 1
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03
**Success Criteria** (what must be TRUE):
  1. Running `tofu apply` triggers `pnpm build` before any file sync
  2. Built `dist/` contents appear in the S3 bucket after apply
  3. Visiting the CloudFront URL after apply shows the current version of the site with no cache delay
**Plans**: TBD

Plans:
- [ ] 02-01: local-exec build, S3 sync, and CloudFront invalidation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure | 0/1 | Not started | - |
| 2. Deployment | 0/1 | Not started | - |
