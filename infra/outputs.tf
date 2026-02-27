output "cloudfront_url" {
  description = "CloudFront distribution domain name — visit this URL to access the site"
  value       = "https://${aws_cloudfront_distribution.portfolio.domain_name}"
}
