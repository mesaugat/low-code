locals {
  lambda_names      = ["ingest", "evaluate"]
  requirements_path = "../backend/requirements.txt"
  requirements_name = "requirements.txt"
  layer_path        = "../backend"
  layer_name        = "clickhouse-layer"
  layer_zip_name    = "${local.layer_name}.zip"
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

data "archive_file" "lambda_suggest" {
  type        = "zip"
  source_file = "../backend/lambda-suggest.py"
  output_path = "../backend/lambda-suggest.zip"
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
  timeout          = "15"
  depends_on       = [data.archive_file.lambda_ingest]
  filename         = "${path.module}/../backend/lambda-ingest.zip"
  function_name    = "ingest"
  role             = aws_iam_role.lambda_policy_execution_role.arn
  handler          = "lambda-ingest.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = fileexists("../backend/lambda-ingest.zip") ? filebase64sha256("../backend/lambda-ingest.zip") : ""
  layers = [
    aws_lambda_layer_version.lambda_layer.arn
  ]

  environment {
    variables = {
      host     = local.clickhouse_ip
      user     = "default"
      database = "default"
      password = local.clickhouse_password
      port     = "9000"
    }
  }
}

resource "aws_lambda_function_url" "lowspot_ingest_url" {
  function_name      = aws_lambda_function.lowspot_ingest.function_name
  authorization_type = "NONE"
}

resource "aws_lambda_function" "lowspot_evaluate" {
  timeout          = "15"
  depends_on       = [data.archive_file.lambda_evaluate]
  filename         = "${path.module}/../backend/lambda-evaluate.zip"
  function_name    = "evaluate"
  role             = aws_iam_role.lambda_policy_execution_role.arn
  handler          = "lambda-evaluate.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = fileexists("../backend/lambda-evaluate.zip") ? filebase64sha256("../backend/lambda-evaluate.zip") : ""
  layers = [
    aws_lambda_layer_version.lambda_layer.arn
  ]

  environment {
    variables = {
      host     = local.clickhouse_ip
      user     = "default"
      database = "default"
      password = local.clickhouse_password
      port     = "9000"
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

resource "null_resource" "lambda_layer" {
  triggers = {
    requirements = fileexists(local.requirements_path) ? filesha1(local.requirements_path) : ""
  }
  provisioner "local-exec" {
    command = <<EOF
      cd ${local.layer_path}
      rm -rf python
      mkdir python
      pip3 install -r ${local.requirements_name} -t python/
      zip -r ${local.layer_zip_name} python/
    EOF
  }
}
resource "aws_lambda_layer_version" "lambda_layer" {
  filename            = "${local.layer_path}/${local.layer_zip_name}"
  layer_name          = local.layer_name
  compatible_runtimes = ["python3.12"]
  skip_destroy        = true
}

resource "aws_lambda_function" "lowspot_suggest" {
  timeout          = "15"
  depends_on       = [data.archive_file.lambda_suggest]
  filename         = "${path.module}/../backend/lambda-suggest.zip"
  function_name    = "suggest"
  role             = aws_iam_role.lambda_policy_execution_role.arn
  handler          = "lambda-suggest.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = fileexists("../backend/lambda-suggest.zip") ? filebase64sha256("../backend/lambda-suggest.zip") : ""
  layers = [
    aws_lambda_layer_version.lambda_layer.arn
  ]

  environment {
    variables = {
      host     = local.clickhouse_ip
      user     = "default"
      database = "default"
      password = local.clickhouse_password
      port     = "9000"
    }
  }
}

resource "aws_lambda_function_url" "lowspot_suggest_url" {
  function_name      = aws_lambda_function.lowspot_suggest.function_name
  authorization_type = "NONE"
}
