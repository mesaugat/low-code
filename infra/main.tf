locals {
  account_id                  = data.aws_caller_identity.current.account_id
  dynamodb_tfstate_lock_table = "com.lowkey.tflock"
}

resource "aws_dynamodb_table" "tfstate_lock" {
  name           = local.dynamodb_tfstate_lock_table
  billing_mode   = "PROVISIONED"
  hash_key       = "LockID"
  read_capacity  = 1
  write_capacity = 1
  attribute {
    name = "LockID"
    type = "S"
  }
}
