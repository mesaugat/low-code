locals {
  bucket_name = aws_s3_bucket.dumpbucket.bucket
}

resource "aws_s3_bucket" "dumpbucket" {
  bucket = "com.lowkey.dumpbucketwa"
}
