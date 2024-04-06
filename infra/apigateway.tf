locals {
  lambda_arns = [
    for lambda in local.lambda_names : "arn:aws:execute-api:${var.region}:${local.account_id}:${aws_apigatewayv2_integration.ingest.api_id}/*/*/${lambda}"
  ]
}

data "aws_iam_policy_document" "apigw" {
  depends_on = [aws_apigatewayv2_integration.evaluate]
  statement {
    sid = "InvokeAccessToApiGw"
    actions = [
      "lambda:InvokeFunction"
    ]
    principals {
      type        = "AWS"
      identifiers = ["apigateway.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "SourceArn"
      values = [
        "arn:aws:execute-api:${var.region}:${local.account_id}:${aws_apigatewayv2_integration.ingest.api_id}/*/*/ingest",
        "arn:aws:execute-api:${var.region}:${local.account_id}:${aws_apigatewayv2_integration.ingest.api_id}/*/*/evaluate",
        "arn:aws:execute-api:${var.region}:${local.account_id}:${aws_apigatewayv2_integration.ingest.api_id}/*/*/suggest"
      ]
    }
  }
}

resource "aws_cloudwatch_log_group" "lowspot_http_apigw" {
  name              = "/aws/api-gw/${aws_apigatewayv2_api.lowspot_http_apigw.name}"
  retention_in_days = 5
}

resource "aws_apigatewayv2_api" "lowspot_http_apigw" {
  name          = "lowspot"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["http://localhost:5173", "http://localhost:5174", "https://${aws_cloudfront_distribution.analysis.domain_name}"]
    allow_methods = ["*"]
  }
}

resource "aws_apigatewayv2_stage" "dev" {
  name        = "dev"
  api_id      = aws_apigatewayv2_api.lowspot_http_apigw.id
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.lowspot_http_apigw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_integration" "evaluate" {
  api_id           = aws_apigatewayv2_api.lowspot_http_apigw.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  integration_uri  = aws_lambda_function.lowspot_evaluate.invoke_arn
}

resource "aws_apigatewayv2_route" "evaluate" {
  api_id    = aws_apigatewayv2_api.lowspot_http_apigw.id
  route_key = "GET /evaluate"
  target    = "integrations/${aws_apigatewayv2_integration.evaluate.id}"
}

resource "aws_lambda_permission" "evaluate_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lowspot_evaluate.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lowspot_http_apigw.execution_arn}/*/*"
}

resource "aws_apigatewayv2_route" "ingest" {
  api_id    = aws_apigatewayv2_api.lowspot_http_apigw.id
  route_key = "POST /ingest"
  target    = "integrations/${aws_apigatewayv2_integration.ingest.id}"
}

resource "aws_apigatewayv2_integration" "ingest" {
  api_id           = aws_apigatewayv2_api.lowspot_http_apigw.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  integration_uri  = aws_lambda_function.lowspot_ingest.invoke_arn
}

resource "aws_lambda_permission" "ingest_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lowspot_ingest.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lowspot_http_apigw.execution_arn}/*/*"
}

resource "aws_apigatewayv2_route" "suggest" {
  api_id    = aws_apigatewayv2_api.lowspot_http_apigw.id
  route_key = "POST /suggest"
  target    = "integrations/${aws_apigatewayv2_integration.suggest.id}"
}

resource "aws_apigatewayv2_integration" "suggest" {
  api_id           = aws_apigatewayv2_api.lowspot_http_apigw.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  integration_uri  = aws_lambda_function.lowspot_suggest.invoke_arn
}

resource "aws_lambda_permission" "suggest_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lowspot_suggest.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lowspot_http_apigw.execution_arn}/*/*"
}
