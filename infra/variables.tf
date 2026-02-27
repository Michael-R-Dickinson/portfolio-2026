variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for the portfolio site"
  type        = string
  default     = "portfolio-site-static-assets"
}
