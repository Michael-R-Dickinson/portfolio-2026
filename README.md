# Portfolio

Personal portfolio site. Static SPA hosted on AWS via S3 + CloudFront, managed entirely with OpenTofu.

## Stack

**Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite, Wouter (routing)

**Infra:** OpenTofu, AWS S3, AWS CloudFront

## Architecture

```
Browser
  └── CloudFront (HTTPS, PriceClass_100)
        └── S3 bucket (private, OAC)
```

The S3 bucket is fully private — no public access. CloudFront accesses it via Origin Access Control (OAC) using SigV4 signing. The bucket policy only permits `s3:GetObject` from the specific CloudFront distribution ARN.

CloudFront is configured for SPA routing: 403 and 404 responses from S3 are rewritten to `200 /index.html`, so client-side routes work without server configuration.

## Infra

All infrastructure lives in `infra/` as OpenTofu (Terraform-compatible) HCL.

| File | Purpose |
|---|---|
| `main.tf` | Provider config (AWS + archive + null), Terraform version constraints |
| `s3.tf` | S3 bucket, public access block, and OAC bucket policy |
| `cloudfront.tf` | CloudFront distribution, OAC, SPA error responses |
| `deploy.tf` | Build + sync + cache invalidation via `null_resource` |
| `variables.tf` | `aws_region` (default: `us-west-2`), `bucket_name` |
| `outputs.tf` | `cloudfront_url` — the live site URL |

### Deploy flow

`terraform apply` (via `null_resource`) runs three steps in sequence:

1. `pnpm build` in `../frontend`
2. `aws s3 sync frontend/dist s3://<bucket> --delete`
3. `aws cloudfront create-invalidation --distribution-id <id> --paths '/*'`

The `always_run = timestamp()` trigger ensures this fires on every apply.

### Prerequisites

- OpenTofu >= 1.0 (or Terraform >= 1.0)
- AWS CLI configured with credentials that have S3 + CloudFront permissions
- `pnpm` available on PATH

### Commands

```bash
# Provision infrastructure (first time)
cd infra
tofu init
tofu apply

# Deploy (build + sync + invalidate)
cd frontend
pnpm deploy
# or directly:
cd infra && tofu apply -auto-approve
```

The output `cloudfront_url` gives the live HTTPS URL after apply.

## Frontend

```bash
cd frontend
pnpm install
pnpm dev       # local dev server
pnpm build     # production build to dist/
pnpm preview   # preview production build locally
```

Pages: `Home`, `Prototype`

Components: `Hero`, `Nav`, `Footer`, `Projects`, `Experience`, `TechStack`, `Roadmap`
