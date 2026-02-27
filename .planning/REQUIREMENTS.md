# Requirements: Portfolio Infrastructure

**Defined:** 2026-02-26
**Core Value:** `tofu apply` provisions everything and leaves the site live — no manual steps, no separate deploy script.

## v1 Requirements

### Infrastructure

- [x] **INFRA-01**: S3 bucket provisioned with static website hosting disabled (private, OAC access only)
- [x] **INFRA-02**: CloudFront Origin Access Control (OAC) configured to allow CloudFront to read from S3
- [x] **INFRA-03**: CloudFront distribution created with S3 as origin, default root object `index.html`
- [x] **INFRA-04**: CloudFront distribution configured to return `index.html` for all 404/403 errors (SPA routing support)
- [x] **INFRA-05**: S3 bucket policy grants read access to CloudFront OAC only

### Deployment

- [ ] **DEPLOY-01**: `tofu apply` triggers `pnpm build` via `local-exec` before syncing files
- [ ] **DEPLOY-02**: Built `dist/` contents synced to S3 via `aws s3 sync` in `local-exec`
- [ ] **DEPLOY-03**: CloudFront invalidation (`/*`) triggered after sync so changes are immediately live

### Outputs

- [x] **OUTPUT-01**: `tofu output` exposes the CloudFront distribution URL after apply

## v2 Requirements

### Domain

- **DOMAIN-01**: Custom domain configured via Route 53 with ACM certificate
- **DOMAIN-02**: HTTPS enforced, HTTP redirects to HTTPS

### Operations

- **OPS-01**: CI/CD pipeline triggers deploy on push to main branch
- **OPS-02**: Multiple environments (staging + production) with separate stacks

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom domain / SSL cert | CloudFront default URL is sufficient for now |
| CI/CD pipeline | Manual `tofu apply` is the deploy mechanism |
| Multiple environments | Portfolio site — no staging required |
| Backend / API | Static site only, no server-side logic |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| DEPLOY-01 | Phase 2 | Pending |
| DEPLOY-02 | Phase 2 | Pending |
| DEPLOY-03 | Phase 2 | Pending |
| OUTPUT-01 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-02-26 after initial definition*
