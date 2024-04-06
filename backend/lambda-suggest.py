#!/usr/bin/env python3

import os
import json
import traceback

from clickhouse_driver import connect

AWS_REGION = "us-east-1"
AI_SERVICE_NAME = "bedrock-runtime"


def connect_to_clickhouse():
    # Connect to ClickHouse
    connection = connect(
        host=os.getenv("host", ""),
        port=os.getenv("port", 9000),
        user=os.getenv("user", "default"),
        password=os.getenv("password", ""),
        database=os.getenv("database", "default"),
    )
    return connection


def api_response(status_code, data):
    headers = {"Content-Type": "application/json"}

    return {"statusCode": status_code, "body": json.dumps(data), "headers": headers}


def lambda_handler(event, context):
    # Parse incoming request
    qs = event["queryStringParameters"]
    repo_url = qs["repo_url"]

    try:
        conn = connect_to_clickhouse()

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT repo_url
            FROM ai_suggestions
            WHERE repo_url = %(repo_url)s
            """,
            {"repo_url": repo_url},
        )

        repo_exists = cursor.fetchone()
        if repo_exists is None:
            return api_response(
                404, {"error": "AI suggestions for repository doesn't exist."}
            )

        cursor.execute(
            f"""
            SELECT repo_url, response
            FROM ai_suggestions
            LIMIT 1
            """,
            {"repo_url": repo_url},
        )

        _, response = cursor.fetchone()

        cursor.close()
        conn.close()

        return api_response(200, {"suggestions": response})
    except Exception as e:
        traceback.print_exc()
        return api_response(500, "Something went wrong!")
