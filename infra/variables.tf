variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for the portfolio site"
  type        = string
  default     = "portfolio-site-static-assets-mrd-2026"
}

variable "domain_name" {
  description = "Apex domain registered at Squarespace (e.g. example.com); www is added automatically"
  type        = string
}
