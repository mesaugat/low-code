terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.44.0"
      configuration_aliases = [ aws.main_region ]
    }
  }
}
