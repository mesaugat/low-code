resource "aws_cloudfront_distribution" "analysis" {
  enabled             = true
  wait_for_deployment = false
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.analysis_bucket
    viewer_protocol_policy = "redirect-to-https"

    cache_policy_id            = aws_cloudfront_cache_policy.analysis.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.analysis.id
  }

  origin {
    domain_name = aws_s3_bucket_website_configuration.analysis.website_endpoint
    origin_id   = local.analysis_bucket
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    error_caching_min_ttl = 10
    response_page_path    = "/index.html"
  }
}


resource "aws_cloudfront_response_headers_policy" "analysis" {
  name = "analysis_response_headers_policy"

  security_headers_config {
    content_type_options {
      override = true
    }

    strict_transport_security {
      access_control_max_age_sec = "31536000"
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    frame_options {
      frame_option = "SAMEORIGIN"
      override     = true
    }

    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
  }
}

resource "aws_cloudfront_cache_policy" "analysis" {
  name = "analysis_cf_cache_policy"

  min_ttl     = 2
  default_ttl = 2
  max_ttl     = 300

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }

    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

