variable "region" {
  default = "us-east-1"
}

variable "lambdas" {
  default = [
    "ingest",
    "evaluate"
  ]
}

