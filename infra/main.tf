locals {
  account_id               = data.aws_caller_identity.current.account_id
  clickhouse_ec2_name      = "clickhouse"
  clickhouse_instance_type = "m7g.large"
  vpc_id                   = aws_default_vpc.default.id
  subnet_id                = aws_default_subnet.default.id
  subnet_cidr              = aws_default_subnet.default.cidr_block
}

resource "aws_default_vpc" "default" {}

resource "aws_default_subnet" "default" {
  availability_zone = "${var.region}a"
}
