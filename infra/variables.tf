variable "region" {
  default = "us-east-1"
}

variable "lambdas" {
  default = [
    "ingest",
    "evaluate"
  ]
}

variable "clickhouse_password" {}
