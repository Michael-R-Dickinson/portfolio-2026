resource "null_resource" "deploy" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    working_dir = "${path.root}/../frontend"
    command     = "pnpm build"
  }

  provisioner "local-exec" {
    command = "aws s3 sync ${path.root}/../frontend/dist s3://${aws_s3_bucket.portfolio.bucket} --delete"
  }

  provisioner "local-exec" {
    command = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.portfolio.id} --paths '/*'"
  }
}
