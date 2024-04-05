locals {
  bucket_name = aws_s3_bucket.dumpbucket.bucket
  account_id  = data.aws_caller_identity.current.account_id
}
