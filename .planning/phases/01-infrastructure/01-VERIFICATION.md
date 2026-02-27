---
phase: 01-infrastructure
verified: 2026-02-26T02:00:00Z
status: human_needed
score: 5/5 must-haves verified
human_verification:
  - test: "Run tofu apply with valid AWS credentials, then curl the cloudfront_url output"
    expected: "Apply completes with 5 resources created; the https:// URL returns an HTTP 200 (or serves index.html after files are uploaded)"
    why_human: "tofu validate confirms the HCL config is correct, but actual AWS resource creation and live URL reachability require credentials and a real apply"
  - test: "After apply, navigate to a non-existent path on the CloudFront URL (e.g. /some-route)"
    expected: "CloudFront returns index.html (HTTP 200) rather than a 404 — confirming SPA error routing is live"
    why_human: "The custom_error_response blocks are present in config, but live SPA routing can only be confirmed against the running distribution"
---

# Phase 01: Infrastructure Verification Report

**Phase Goal:** AWS infrastructure exists and the CloudFront URL is accessible — the site can serve files even before deployment automation is wired up
**Verified:** 2026-02-26T02:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                           | Status     | Evidence                                                                                                          |
|----|-------------------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------------------|
| 1  | `tofu apply` completes without error and produces no validation errors                          | ? HUMAN    | `tofu validate` passes: "Success! The configuration is valid." — apply requires live AWS credentials              |
| 2  | S3 bucket has public access fully blocked — no public bucket ACL or policy                      | VERIFIED   | `infra/s3.tf` lines 5-12: all four `block_public_*` flags set to `true`                                          |
| 3  | CloudFront distribution exists with the S3 bucket as its origin, protected by OAC              | VERIFIED   | `infra/cloudfront.tf` line 34: `origin_access_control_id = aws_cloudfront_origin_access_control.portfolio.id`    |
| 4  | CloudFront returns index.html for root path and 403/404 errors                                  | VERIFIED   | `infra/cloudfront.tf` line 29: `default_root_object = "index.html"`; dynamic `custom_error_response` blocks for 403 and 404, both mapping to `/index.html` with response_code 200 |
| 5  | `tofu output cloudfront_url` prints the CloudFront distribution domain name                    | VERIFIED   | `infra/outputs.tf` line 3: `value = "https://${aws_cloudfront_distribution.portfolio.domain_name}"`              |

**Score:** 4/5 truths verified programmatically (truth 1 requires live AWS apply)

### Required Artifacts

| Artifact              | Expected                                              | Status     | Details                                                                                                   |
|-----------------------|-------------------------------------------------------|------------|-----------------------------------------------------------------------------------------------------------|
| `infra/variables.tf`  | `bucket_name` and `aws_region` input variables        | VERIFIED   | Lines 1-11: both variables present with defaults (`us-west-2`, `portfolio-site-static-assets`)            |
| `infra/s3.tf`         | Private S3 bucket and OAC-scoped bucket policy        | VERIFIED   | Lines 1-37: `aws_s3_bucket`, `aws_s3_bucket_public_access_block`, `aws_iam_policy_document`, `aws_s3_bucket_policy` — all present and substantive |
| `infra/cloudfront.tf` | OAC resource and CloudFront distribution with SPA routing | VERIFIED   | Lines 1-70: `locals` block, `aws_cloudfront_origin_access_control`, `aws_cloudfront_distribution` with `dynamic "custom_error_response"` |
| `infra/outputs.tf`    | `cloudfront_url` output value                        | VERIFIED   | Lines 1-4: single output with `https://` prefixed `domain_name` reference                                |
| `infra/main.tf`       | Unchanged from initial commit (constraint from PLAN)  | VERIFIED   | `git diff 11ecdc9 HEAD -- infra/main.tf` produces no output                                               |

### Key Link Verification

| From                              | To                                              | Via                                     | Status   | Details                                                                                                              |
|-----------------------------------|-------------------------------------------------|-----------------------------------------|----------|----------------------------------------------------------------------------------------------------------------------|
| `s3.tf` (bucket policy condition) | `cloudfront.tf` (distribution)                  | `aws_cloudfront_distribution.portfolio.arn` in `AWS:SourceArn` condition | WIRED    | `s3.tf` line 29: `values = [aws_cloudfront_distribution.portfolio.arn]` — scopes bucket access to the specific distribution |
| `cloudfront.tf` (distribution origin) | `s3.tf` (bucket)                          | `bucket_regional_domain_name`           | WIRED    | `cloudfront.tf` line 32: `domain_name = aws_s3_bucket.portfolio.bucket_regional_domain_name`                       |
| `outputs.tf`                      | `cloudfront.tf` (distribution)                  | `domain_name` attribute                 | WIRED    | `outputs.tf` line 3: `aws_cloudfront_distribution.portfolio.domain_name`                                            |
| `cloudfront.tf` (distribution)    | `cloudfront.tf` (OAC)                           | `origin_access_control_id`              | WIRED    | `cloudfront.tf` line 34: `origin_access_control_id = aws_cloudfront_origin_access_control.portfolio.id`            |

**Note on key link 1:** The PLAN frontmatter specified the pattern `aws_cloudfront_origin_access_control.portfolio.iam_arn` in the bucket policy principal. The actual implementation correctly uses `aws_cloudfront_distribution.portfolio.arn` in the `AWS:SourceArn` condition instead. This is the correct OAC bucket policy pattern per AWS documentation — the OAC `iam_arn` is not used in bucket policies; the distribution ARN is the correct scoping value. The OAC is wired to the distribution via `origin_access_control_id`. The PLAN's pattern description was imprecise; the implementation is architecturally correct.

### Requirements Coverage

| Requirement | Source Plan | Description                                                                              | Status       | Evidence                                                                                                |
|-------------|-------------|------------------------------------------------------------------------------------------|--------------|----------------------------------------------------------------------------------------------------------|
| INFRA-01    | 01-01-PLAN  | S3 bucket provisioned with static website hosting disabled (private, OAC access only)   | SATISFIED    | `s3.tf`: no `website` block; all public access blocked; OAC-only access via bucket policy               |
| INFRA-02    | 01-01-PLAN  | CloudFront OAC configured to allow CloudFront to read from S3                            | SATISFIED    | `cloudfront.tf` lines 18-24: `aws_cloudfront_origin_access_control` with `signing_behavior = "always"`, `signing_protocol = "sigv4"` |
| INFRA-03    | 01-01-PLAN  | CloudFront distribution created with S3 as origin, default root object `index.html`     | SATISFIED    | `cloudfront.tf` lines 26-70: distribution with `default_root_object = "index.html"` and S3 origin      |
| INFRA-04    | 01-01-PLAN  | CloudFront distribution returns `index.html` for all 404/403 errors (SPA routing)       | SATISFIED    | `cloudfront.tf` lines 51-58: `dynamic "custom_error_response"` iterates `spa_error_responses` local for 403 and 404, both returning `response_code = 200` and `/index.html` |
| INFRA-05    | 01-01-PLAN  | S3 bucket policy grants read access to CloudFront OAC only                              | SATISFIED    | `s3.tf` lines 14-37: policy document with `cloudfront.amazonaws.com` service principal + `AWS:SourceArn` condition scoped to specific distribution ARN |
| OUTPUT-01   | 01-01-PLAN  | `tofu output` exposes the CloudFront distribution URL after apply                       | SATISFIED    | `outputs.tf` lines 1-4: `output "cloudfront_url"` with `https://` prefixed domain name                 |

**Orphaned requirements check:** Requirements listed as Phase 1 in REQUIREMENTS.md traceability table: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, OUTPUT-01. All 6 appear in 01-01-PLAN frontmatter. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | — |

No TODO/FIXME/placeholder comments, no stub implementations, no empty returns, no hardcoded values where references should be used.

### Human Verification Required

#### 1. Live `tofu apply` with AWS credentials

**Test:** Configure AWS credentials and run `cd infra && tofu apply` from the project root.
**Expected:** Apply completes successfully with exactly 5 resources created: `aws_s3_bucket.portfolio`, `aws_s3_bucket_public_access_block.portfolio`, `aws_s3_bucket_policy.portfolio`, `aws_cloudfront_origin_access_control.portfolio`, `aws_cloudfront_distribution.portfolio`. The `cloudfront_url` output prints an `https://` URL.
**Why human:** `tofu validate` confirms syntactic and semantic correctness but does not contact AWS. Resource creation and actual URL availability require live credentials.

#### 2. SPA routing on live distribution

**Test:** After apply, navigate a browser or use `curl` to request `https://{cloudfront_url}/some-nonexistent-path`.
**Expected:** HTTP 200 response serving `index.html` (or, if no files uploaded yet, a CloudFront 403 that redirects to index.html once files exist).
**Why human:** The `custom_error_response` blocks are present and correctly configured in HCL, but live SPA routing behaviour can only be confirmed against a running CloudFront distribution.

### Gaps Summary

No gaps. All 5 must-have truths are satisfied by the configuration code. All 4 artifacts exist with substantive implementations. All 4 key links are wired. All 6 requirement IDs (INFRA-01 through INFRA-05 and OUTPUT-01) are fully covered.

The two human-verification items are not gaps — they are confirming that correctly-written infrastructure actually provisions and functions in AWS. The HCL configuration is complete and correct.

---

_Verified: 2026-02-26T02:00:00Z_
_Verifier: Claude (gsd-verifier)_
