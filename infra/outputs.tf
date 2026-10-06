output "cloudfront_url" {
  description = "CloudFront distribution domain name — visit this URL to access the site"
  value       = "https://${aws_cloudfront_distribution.portfolio.domain_name}"
}

output "site_url" {
  description = "Custom domain URL"
  value       = "https://${var.domain_name}"
}

output "route53_nameservers" {
  description = "Paste these into Squarespace → Domains → DNS → Nameservers (custom)"
  value       = aws_route53_zone.portfolio.name_servers
}
