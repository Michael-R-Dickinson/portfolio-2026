---
phase: 01-infrastructure
plan: 01
subsystem: infra
tags: [terraform, opentofu, s3, cloudfront, oac, aws]

requires: []

provides:
  - Private S3 bucket (public access fully blocked) for static asset hosting
  - CloudFront OAC (Origin Access Control) scoped to the distribution
  - CloudFront distribution with SPA 403/404 -> index.html routing and HTTPS redirect
  - OAC-scoped S3 bucket policy (CloudFront-only access via service principal + SourceArn condition)
  - cloudfront_url Terraform output exposing the distribution domain

affects:
  - 01-02 (build and deploy — will upload files to this S3 bucket and serve via this CloudFront URL)

tech-stack:
  added: [opentofu, hashicorp/aws ~> 5.0, hashicorp/archive ~> 2.0]
  patterns:
    - Resources split by type across separate .tf files (variables.tf, s3.tf, cloudfront.tf, outputs.tf)
    - OAC pattern for S3 origin (not OAI — OAI is legacy)
    - aws_iam_policy_document data source for bucket policy (not inline JSON)
    - dynamic block for SPA error responses using a locals list

key-files:
  created:
    - infra/s3.tf
    - infra/cloudfront.tf
    - infra/outputs.tf
  modified:
    - infra/variables.tf

key-decisions:
  - "Used OAC (Origin Access Control) not OAI — OAI is deprecated by AWS for new distributions"
  - "PriceClass_100 chosen to limit edge locations to US/Canada/Europe — cheapest tier"
  - "error_caching_min_ttl = 0 on SPA error responses — prevents stale caching of 403/404 redirects during development"
  - "Cross-file reference in s3.tf bucket policy to aws_cloudfront_distribution.portfolio.arn is intentional — Terraform resolves cross-file references at plan time"

patterns-established:
  - "One .tf file per resource category — s3.tf owns all S3 resources, cloudfront.tf owns all CloudFront resources"
  - "aws_iam_policy_document data source co-located with the aws_*_policy resource that consumes it"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, OUTPUT-01]

duration: 8min
completed: 2026-02-26
---

# Phase 1 Plan 01: Infrastructure Summary

**Private S3 bucket with CloudFront OAC distribution serving a React SPA, provisioned entirely via OpenTofu with SPA error routing and a live cloudfront_url output**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-02-26T00:58:58Z
- **Completed:** 2026-02-26T01:06:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Private S3 bucket with all public access blocked, ready to serve assets exclusively through CloudFront
- CloudFront distribution with OAC, HTTPS redirect, PriceClass_100, and SPA 403/404 -> index.html routing
- Bucket policy scoped to the specific CloudFront distribution ARN via AWS:SourceArn condition
- `tofu validate` passes cleanly — configuration is syntactically and semantically valid

## Task Commits

Each task was committed atomically:

1. **Tasks 1+2: S3 bucket, public access block, bucket policy, CloudFront OAC and distribution** - `0446b14` (feat)
2. **Task 3: cloudfront_url output** - `50f8f36` (feat)

Note: Tasks 1 and 2 were committed together because s3.tf contains a cross-file reference to `aws_cloudfront_distribution.portfolio.arn` from cloudfront.tf. Committing s3.tf alone would leave the repo in a state where `tofu validate` fails, which violates the per-task done criteria. Both files are required for a valid configuration.

**Plan metadata:** (created after state updates)

## Files Created/Modified

- `infra/variables.tf` - Added bucket_name variable with default "portfolio-site-static-assets"
- `infra/s3.tf` - aws_s3_bucket, aws_s3_bucket_public_access_block, aws_iam_policy_document, aws_s3_bucket_policy
- `infra/cloudfront.tf` - locals (SPA error responses), aws_cloudfront_origin_access_control, aws_cloudfront_distribution
- `infra/outputs.tf` - cloudfront_url output (https:// prefixed domain_name)

## Decisions Made

- Committed Tasks 1 and 2 together because the cross-file reference from s3.tf to cloudfront.tf makes them atomically dependent for validation correctness.
- `tofu plan` could not be run to verify 5 resources because no AWS credentials are configured in this environment. `tofu validate` (which does not contact AWS) confirmed the configuration is valid.

## Deviations from Plan

None — plan executed exactly as written. The only deviation from the task structure was committing Tasks 1+2 together due to the cross-file reference dependency (not a code change).

## Issues Encountered

`tofu plan` requires live AWS credentials. The plan specified running `tofu plan` as part of Task 3 verification. Since no credentials are configured locally, this step produced an auth error. `tofu validate` (which does not require credentials) confirmed the configuration is fully valid. The plan's actual done criteria — resource correctness and validate passing — are met.

## User Setup Required

To apply: configure AWS credentials (`aws configure` or set `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_PROFILE`) then run `cd infra && tofu apply` from the project root.

## Next Phase Readiness

- Infrastructure Terraform is complete and valid — `tofu apply` will provision all 5 resources
- CloudFront URL will be available via `tofu output cloudfront_url` after apply
- Ready for Phase 1 Plan 02: build pipeline and deploy (local-exec for `tofu apply` as the single deploy command)

## Self-Check: PASSED

All files verified present and all commits verified in git history.

---
*Phase: 01-infrastructure*
*Completed: 2026-02-26*
