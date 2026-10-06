# Portfolio

Personal portfolio site, live at https://michael-dickinson.com. Static SPA hosted on AWS via S3 + CloudFront, managed entirely with OpenTofu.

## Stack

**Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite

**Infra:** OpenTofu, AWS S3, AWS CloudFront, AWS Route 53, AWS Certificate Manager

## Architecture

```
Browser
  └── Route 53 (michael-dickinson.com + www, alias records)
        └── CloudFront (HTTPS via ACM certificate, PriceClass_100)
              └── S3 bucket (private, OAC)
```

The S3 bucket is fully private — no public access. CloudFront accesses it via Origin Access Control (OAC) using SigV4 signing. The bucket policy only permits `s3:GetObject` from the specific CloudFront distribution ARN.

CloudFront is configured for SPA routing: 403 and 404 responses from S3 are rewritten to `200 /index.html`, so client-side routes work without server configuration.

### Custom domain

The domain `michael-dickinson.com` is registered at Squarespace, but its DNS is hosted in Route 53: Squarespace is set to use the four Route 53 nameservers (`tofu output route53_nameservers`). Squarespace's own DNS records are therefore unused. Any new record (for example email MX records) must be added in Route 53 via `dns.tf`.

Both the bare domain and `www` are alias records pointing straight at CloudFront. HTTPS uses an ACM certificate covering both names, validated through DNS records that OpenTofu creates in the same zone. The certificate lives in `us-east-1` because CloudFront only accepts certificates from that region; everything else is in `us-west-2`.

The old `*.cloudfront.net` address still resolves but shows a certificate warning. Use the custom domain.

## Infra

All infrastructure lives in `infra/` as OpenTofu (Terraform-compatible) HCL.

| File | Purpose |
|---|---|
| `main.tf` | Provider config (AWS in `us-west-2`, a second AWS provider in `us-east-1` for the certificate, archive, null), Terraform version constraints |
| `s3.tf` | S3 bucket, public access block, and OAC bucket policy |
| `cloudfront.tf` | CloudFront distribution (custom domain aliases + certificate), OAC, SPA error responses |
| `dns.tf` | Route 53 hosted zone, ACM certificate + DNS validation, alias records for the bare domain and `www` |
| `deploy.tf` | Build + sync + cache invalidation via `null_resource` |
| `variables.tf` | `aws_region` (default: `us-west-2`), `bucket_name`, `domain_name` (no default) |
| `terraform.tfvars` | Sets `domain_name` |
| `outputs.tf` | `site_url` (the live site), `cloudfront_url`, `route53_nameservers` |

### Deploy flow

`terraform apply` (via `null_resource`) runs three steps in sequence:

1. `pnpm build` in `../frontend`
2. `aws s3 sync frontend/dist s3://<bucket> --delete`
3. `aws cloudfront create-invalidation --distribution-id <id> --paths '/*'`

The `always_run = timestamp()` trigger ensures this fires on every apply.

### Prerequisites

- OpenTofu >= 1.0 (or Terraform >= 1.0)
- AWS CLI configured with credentials that have S3 + CloudFront permissions
- `pnpm` available on PATH, and `pnpm install` already run in `frontend/` (the deploy step builds but does not install)

### State file

State is local: `infra/terraform.tfstate`. It is gitignored and exists only on the machine that ran the apply. **Do not delete it.** Without it OpenTofu forgets the existing resources and tries to create them again (the apply then fails with "already exists" errors).

If it is ever lost, re-import each resource with `tofu import <address> <id>`:

| Address | ID |
|---|---|
| `aws_s3_bucket.portfolio`, `aws_s3_bucket_policy.portfolio`, `aws_s3_bucket_public_access_block.portfolio` | the bucket name |
| `aws_cloudfront_distribution.portfolio` | distribution ID (`aws cloudfront list-distributions`) |
| `aws_cloudfront_origin_access_control.portfolio` | OAC ID (`aws cloudfront list-origin-access-controls`) |
| `aws_route53_zone.portfolio` | hosted zone ID (`aws route53 list-hosted-zones`) |

Run the imports one at a time; back-to-back imports in a loop can fail on the state lock.

### Setting up a domain from scratch

Only needed for a new domain or a rebuilt hosted zone. It takes two passes, because the certificate cannot be issued until the registrar points at Route 53, and a full apply would hang waiting for it.

1. Set `domain_name` in `terraform.tfvars`.
2. `tofu apply -target=aws_route53_zone.portfolio`, then `tofu output route53_nameservers`.
3. At the registrar (Squarespace → Domains → DNS → Nameservers), switch to custom nameservers and enter the four values.
4. Wait until `dig NS <domain> +short` returns the AWS nameservers.
5. `tofu apply` for everything else.

### Commands

```bash
# Provision infrastructure (first time)
cd infra
tofu init
tofu apply

# Deploy (build + sync + invalidate)
cd frontend
pnpm run deploy
# or directly:
cd infra && tofu apply -auto-approve
```

The output `site_url` gives the live HTTPS URL after apply.

## Frontend

```bash
cd frontend
pnpm install
pnpm dev       # local dev server
pnpm build     # production build to dist/
pnpm preview   # preview production build locally
```

A single page with no router: `src/App.tsx` renders `Hero`, `Projects`, and `Timeline` (in `src/components/`). All copy lives in `src/content.ts`. See `frontend/CLAUDE.md` for details.

`frontend-2027/` is a separate prototyping project holding several design concepts. The live site is its concept A, ported into `frontend/`.
