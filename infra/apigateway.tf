data "aws_iam_policy_document" "apigw" {
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
        "arn:aws:execute-api:us-east-1:730335533844:q3209t5r2d/*/*/ingest"
      ]
    }
  }
}

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

  connection_type    = "INTERNET"
  description        = "Ingest Lambda Integration"
  integration_uri    = aws_lambda_function.lowspot_ingest.invoke_arn
  integration_method = "POST"
}
