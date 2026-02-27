# Phase 1: Infrastructure - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Provision the AWS resources (S3, CloudFront, OAC, bucket policy) so a CloudFront URL is accessible and ready to serve files. Custom domain, CI/CD, and deployment automation are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Code organization
- Split by resource type: `s3.tf`, `cloudfront.tf`, `outputs.tf`, `variables.tf`
- The `terraform {}` and `provider "aws" {}` blocks stay in `main.tf` (not a separate providers.tf)
- SPA error response rules (403/404 → index.html) defined in a `locals {}` block at the top of `cloudfront.tf`, referenced in the resource block
- Bucket name and AWS region are input variables in `variables.tf` with sensible defaults — not hardcoded in resource files

### Claude's Discretion
- Terraform state backend (local state is fine for this personal project)
- CloudFront price class selection
- S3 bucket name default value
- Exact variable descriptions and types

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-infrastructure*
*Context gathered: 2026-02-26*
