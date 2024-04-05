locals {
  lowspot_lambdas = ["ingest", "evaluate"]
  bucket_name     = "dump-to-s3-hackathon"
  lambda_src_zip  = "../scripts/lambda.zip"
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
      "arn:aws:logs:us-east-1:730335460744:*"
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
      "arn:aws:logs:us-east-1:730335460744:log-group:/aws/lambda/${local.lowspot_lambdas[0]}:*",
      "arn:aws:logs:us-east-1:730335460744:log-group:/aws/lambda/${local.lowspot_lambdas[1]}:*"
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
      "arn:aws:s3:::dump-to-s3-hackathon",
      "arn:aws:s3:::dump-to-s3-hackathon/*"
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
  depends_on = [ data.archive_file.lambda_ingest ]
  filename         = "${path.module}/../backend/lambda-ingest.zip"
  function_name    = "ingest"
  role             = aws_iam_role.lambda_policy_execution_role.arn
  handler          = "lambda-dump.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = filebase64sha256("../backend/lambda-ingest.zip")
}

resource "aws_lambda_function_url" "lowspot_ingest_url" {
  function_name      = aws_lambda_function.lowspot_ingest.function_name
  authorization_type = "NONE"
}

resource "aws_lambda_function" "lowspot_evaluate" {
  depends_on = [ data.archive_file.lambda_evaluate ]
  filename         = "${path.module}/../backend/lambda-evaluate.zip"
  function_name    = "ingest"
  role             = aws_iam_role.lambda_policy_execution_role.arn
  handler          = "lambda-dump.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = filebase64sha256("../backend/lambda-evaluate.zip")
}

resource "aws_lambda_function_url" "lowspot_evaluate_url" {
  function_name      = aws_lambda_function.lowspot_evaluate.function_name
  authorization_type = "NONE"
}
