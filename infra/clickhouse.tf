resource "aws_security_group" "clickhouse_sg" {
  name        = "${local.clickhouse_ec2_name}-sg"
  description = "Allow traffic from and to ClickHouse server"
  vpc_id      = local.vpc_id

  ingress {
    description = "Allow traffic from Leapfrog IPs to ClickHouse server"
    from_port   = 8123
    to_port     = 8123
    protocol    = "tcp"
    cidr_blocks = [local.subnet_cidr, local.leapfrog_ip]
  }

  ingress {
    description = "Allow HTTPS traffic from Leapfrog IPs to Clickhouse server"
    from_port   = 8443
    to_port     = 8443
    protocol    = "tcp"
    cidr_blocks = [local.subnet_cidr, local.leapfrog_ip]
  }

  ingress {
    description = "Allow SSH traffic from Leapfrog IPs to Clickhouse server"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [local.subnet_cidr, local.leapfrog_ip]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_key_pair" "ssh_key" {
  key_name   = "lowcode"
  public_key = file("./scripts/ssh-key.pub")

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_instance" "clickhouse" {
  ami                    = "ami-0ed19957e49be45d2"
  subnet_id              = local.subnet_id
  vpc_security_group_ids = [aws_security_group.clickhouse_sg.id]
  instance_type          = local.clickhouse_instance_type
  key_name               = aws_key_pair.ssh_key.key_name

  root_block_device {
    encrypted   = true
    volume_type = "gp3"
    volume_size = 60
  }

  user_data_replace_on_change = false
  user_data                   = file("./scripts/clickhouse.sh")
}
