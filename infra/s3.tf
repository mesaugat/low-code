resource "aws_s3_bucket" "dumpbucket" {
  bucket = "com.lowkey.dumpbucket"
}

output "dumpbucket" {
  value = aws_s3_bucket.dumpbucket.bucket
}
