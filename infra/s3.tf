locals {
  bucket_name         = aws_s3_bucket.dumpbucket.bucket
  analysis_bucket     = "com.lowkey.analysis-test"
  tfstate_bucket_name = "com.lowkey.tfstate"
}

resource "aws_s3_bucket" "analysis" {
  bucket = local.analysis_bucket
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

resource "aws_s3_bucket_public_access_block" "analysis" {
  bucket = aws_s3_bucket.analysis.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "analysis" {
  bucket = aws_s3_bucket.analysis.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "analysis" {
  depends_on = [
    aws_s3_bucket_ownership_controls.analysis,
    aws_s3_bucket_public_access_block.analysis
  ]

  bucket = aws_s3_bucket.analysis.id
  acl    = "public-read"
}

data "aws_iam_policy_document" "analysis" {
  version = "2012-10-17"

  statement {
    sid       = "AllowAccessToAnalysisBucket"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.analysis.arn}/*"]
    principals {
      identifiers = ["*"]
      type        = "AWS"
    }
  }
}

resource "aws_s3_bucket_policy" "analysis" {
  bucket = aws_s3_bucket.analysis.id
  policy = data.aws_iam_policy_document.analysis.json
}

resource "aws_s3_bucket_website_configuration" "analysis" {
  bucket = aws_s3_bucket.analysis.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}

