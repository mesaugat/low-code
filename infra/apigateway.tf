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
        "arn:aws:execute-api:${var.region}:${local.account_id}:${aws_apigatewayv2_integration.ingest.api_id}/*/*/evaluate"
      ]
    }
  }
}

resource "aws_apigatewayv2_api" "lowspot_http_apigw" {
  name          = "lowspot"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "dev" {
  name        = "dev"
  api_id      = aws_apigatewayv2_api.lowspot_http_apigw.id
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "evaluate" {
  api_id           = aws_apigatewayv2_api.lowspot_http_apigw.id
  integration_type = "AWS_PROXY"
  connection_type  = "INTERNET"
  integration_uri  = aws_lambda_function.lowspot_ingest.invoke_arn
}

resource "aws_apigatewayv2_route" "evaluate" {
  api_id    = aws_apigatewayv2_api.lowspot_http_apigw.id
  route_key = "GET /evaluate/{repo_url}"
  target    = "integrations/${aws_apigatewayv2_integration.evaluate.id}"
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
  integration_uri  = aws_lambda_function.lowspot_evaluate.invoke_arn
}
