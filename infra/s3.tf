locals {
  bucket_name         = aws_s3_bucket.dumpbucket.bucket
  tfstate_bucket_name = "com.lowkey.tfstate"
}

resource "aws_s3_bucket" "dumpbucket" {
  bucket = "com.lowkey.dumpbucketwa"
}

resource "aws_s3_bucket" "terraform_lock" {
  bucket = local.tfstate_bucket_name
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ss3_tflock" {
  bucket = aws_s3_bucket.dumpbucket.bucket
  rule {
    bucket_key_enabled = true
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}
