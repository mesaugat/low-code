terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.44.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.6.0"
    }
  }

  backend "s3" {
    region         = "us-east-1"
    bucket         = "com.lowkey.tfstate"
    key            = "lowkey/terraform.tfstate"
    dynamodb_table = "com.lowkey.tflock"
    encrypt        = true
  }
}
