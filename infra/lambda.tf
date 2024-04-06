locals {
  lambda_names = ["ingest", "evaluate"]
}

data "archive_file" "lambda_ingest" {
  type        = "zip"
  source_file = "../backend/lambda-ingest.py"
  output_path = "../backend/lambda-ingest.zip"
}

data "archive_file" "lambda_evaluate" {
  type        = "zip"
  source_file = "../backend/lambda-evaluate.py"
  output_path = "../backend/lambda-evaluate.zip"
}

data "aws_iam_policy_document" "lambda_policy_execution_role" {
  statement {
    sid    = "CreateLogGroup"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup"
    ]
    resources = [
      "arn:aws:logs:${var.region}:${local.account_id}:*"
    ]
  }

  statement {
    sid    = "PutLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "arn:aws:logs:${var.region}:${local.account_id}:log-group:/aws/lambda/ingest:*",
      "arn:aws:logs:${var.region}:${local.account_id}:log-group:/aws/lambda/evaluate:*"
    ]
  }

  statement {
    sid    = "S3Access"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:ListBucket",
      "s3:GetObject"
    ]
    resources = [
      "arn:aws:s3:::${local.bucket_name}",
      "arn:aws:s3:::${local.bucket_name}/*"
    ]
  }
}

data "aws_iam_policy_document" "lambda_policy_execution_role_policy" {
  statement {
    actions = [
      "sts:AssumeRole"
    ]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "lambda_policy_execution_role_policy" {
  name   = "lambda_execution_role_policy"
  policy = data.aws_iam_policy_document.lambda_policy_execution_role.json
}

resource "aws_iam_role" "lambda_policy_execution_role" {
  name               = "lambda_execution_role"
  assume_role_policy = data.aws_iam_policy_document.lambda_policy_execution_role_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_policy_execution_role_attachment" {
  role       = aws_iam_role.lambda_policy_execution_role.id
  policy_arn = aws_iam_policy.lambda_policy_execution_role_policy.id
}

resource "aws_lambda_function" "lowspot_ingest" {
  depends_on       = [data.archive_file.lambda_ingest]
  filename         = "${path.module}/../backend/lambda-ingest.zip"
  function_name    = "ingest"
  role             = aws_iam_role.lambda_policy_execution_role.arn
  handler          = "lambda-ingest.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = filebase64sha256("../backend/lambda-ingest.zip")
}

resource "aws_lambda_function_url" "lowspot_ingest_url" {
  function_name      = aws_lambda_function.lowspot_ingest.function_name
  authorization_type = "NONE"
}

resource "aws_lambda_function" "lowspot_evaluate" {
  depends_on       = [data.archive_file.lambda_evaluate]
  filename         = "${path.module}/../backend/lambda-evaluate.zip"
  function_name    = "evaluate"
  role             = aws_iam_role.lambda_policy_execution_role.arn
  handler          = "lambda-evaluate.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = filebase64sha256("../backend/lambda-evaluate.zip")
  environment {
    variables = {
      host     = local.clickhouse_ip
      user     = "default"
      database = "default"
      password = local.clickhouse_password
    }
  }
}

resource "aws_lambda_function_url" "lowspot_evaluate_url" {
  function_name      = aws_lambda_function.lowspot_evaluate.function_name
  authorization_type = "NONE"
}

resource "random_password" "lambda_ingest" {
  length = 16
}

resource "aws_ssm_parameter" "lambda_ingest" {
  name  = "/secrets/lambda/ingest"
  type  = "SecureString"
  value = local.clickhouse_password
}
