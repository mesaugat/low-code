resource "aws_apigatewayv2_api" "lowspot_http_apigw" {
  name          = "lowspot_http_apigw"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_route" "ingest" {
  api_id    = aws_apigatewayv2_api.lowspot_http_apigw.id
  route_key = "POST /ingest"
}

resource "aws_apigatewayv2_route" "evaluate" {
  api_id    = aws_apigatewayv2_api.lowspot_http_apigw.id
  route_key = "GET /evaluate/{repo_url}"
}

resource "aws_apigatewayv2_integration" "ingest" {
  api_id           = aws_apigatewayv2_api.lowspot_http_apigw.id
  integration_type = "AWS_PROXY"

  connection_type = "INTERNET"
  description     = "Ingest Lambda Integration"
  integration_uri = aws_lambda_function.lowspot_ingest.invoke_arn
  # integration_method   = "POST"
  # passthrough_behavior = "WHEN_NO_MATCH"
}


