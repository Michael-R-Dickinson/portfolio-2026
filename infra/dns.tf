locals {
  site_domains = [var.domain_name, "www.${var.domain_name}"]
}

# Hosted zone — its nameservers must be set at the registrar (Squarespace)
resource "aws_route53_zone" "portfolio" {
  name = var.domain_name
}

resource "aws_acm_certificate" "portfolio" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.portfolio.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id         = aws_route53_zone.portfolio.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

# Blocks until ACM sees the validation records (requires NS delegation to be live)
resource "aws_acm_certificate_validation" "portfolio" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.portfolio.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# Apex + www both alias straight to CloudFront (IPv4 and IPv6)
resource "aws_route53_record" "site" {
  for_each = toset(flatten([for d in local.site_domains : [for t in ["A", "AAAA"] : "${d}|${t}"]]))

  zone_id = aws_route53_zone.portfolio.zone_id
  name    = split("|", each.key)[0]
  type    = split("|", each.key)[1]

  alias {
    name                   = aws_cloudfront_distribution.portfolio.domain_name
    zone_id                = aws_cloudfront_distribution.portfolio.hosted_zone_id
    evaluate_target_health = false
  }
}
