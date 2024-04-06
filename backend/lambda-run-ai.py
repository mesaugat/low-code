#!/usr/bin/env python3

import os
import json
import boto3
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


prompt = """
Here's the data of a code repository of each user's total time spent and edits per file.
Based on the data please answer the following questions with short description for each:
- Does the data indicate the tests are well maintained?
- What are some of the files that indicated poorly defined ownership?
- What are some of the areas in the code that indicates knowledge gaps?
- Does the data indicate the documentation files are well maintained?
- Are there any specific users struggling with any part of the code?

Please follow the following format while answering:
Question: Does the data indicate the tests are well maintained?
Answer: Yes or No. [Your reasoning]

Question: What are some of the files that indicated poorly defined ownership?
Answer: List of files:
- file1.txt
- path/to/file2.js

Question: What are some of the areas in the code that indicates knowledge gaps?
Answer: List of files:
- file10.txt
- unmaintained/path/fil1.txt

Question: Does the data indicate the documentation files are well maintained?
Answer: Yes or No. [Your reasoning.]

Question: Are there any specific users struggling with any part of the code?
Answer: user1 spent most time updating `filename`. They might be stuck on something.
"""


def api_response(status_code, data):
    headers = {"Content-Type": "application/json"}

    return {"statusCode": status_code, "body": json.dumps(data), "headers": headers}


def lambda_handler(event, context):
    # Parse incoming request
    qs = event["queryStringParameters"]
    repo_url = qs["repo_url"]
    time_period = qs.get("time_period", None) or 90

    try:
        conn = connect_to_clickhouse()

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT repo_url
            FROM ingestion_payload
            WHERE repo_url = %(repo_url)s
            """,
            {"repo_url": repo_url},
        )

        repo_exists = cursor.fetchone()
        if repo_exists is None:
            return api_response(404, {"error": "Repository doesn't exist."})

        cursor.execute(
            f"""
            WITH cte_rounded_event_times AS (
                SELECT *,
                    toStartOfFifteenMinutes("timestamp") AS round_start,
                    date_add(MINUTE, 15, toStartOfFifteenMinutes("timestamp")) AS round_end,
                    date_sub(MINUTE, 15, toStartOfFifteenMinutes("timestamp")) AS prev_round_start,
                    toStartOfFifteenMinutes("timestamp") AS prev_round_end,
                    date_add(MINUTE, 15, toStartOfFifteenMinutes("timestamp")) AS next_round_start, 
                    date_add(MINUTE, 30, toStartOfFifteenMinutes("timestamp")) AS next_round_end
                FROM ingestion_payload
                WHERE repo_url = %(repo_url)s
                    AND "timestamp" >= timestamp_sub(day, %(time_period)s, now())
            ), cte_events_merged AS (
                SELECT 
                    repo_user, 
                    repo_branch,
                    changed_file, 
                    round_start, 
                    round_end, 
                    prev_round_start, 
                    prev_round_end, 
                    next_round_start, 
                    next_round_end,
                    MIN("timestamp") AS start_time, 
                    MAX("timestamp") AS end_time, 
                    COUNT(*) AS events,
                    date_diff('second', MIN("timestamp"), MAX("timestamp")) / (60.0) AS time_spent_minute
                FROM cte_rounded_event_times
                GROUP BY 
                    repo_user, 
                    repo_branch,
                    changed_file,
                    round_start,
                    round_end,
                    prev_round_start,
                    prev_round_end,
                    next_round_start,
                    next_round_end
            ), cte_events_merged_single AS (
                SELECT *
                FROM cte_events_merged
                WHERE start_time = end_time
            ), cte_events_merged_multiple AS (
                SELECT *
                FROM cte_events_merged
                WHERE start_time != end_time
            ), cte_all_events_time_spent AS (
                SELECT *
                FROM cte_events_merged_multiple
                UNION ALL
                SELECT 
                    a.repo_user, 
                    a.repo_branch,
                    a.changed_file, 
                    a.round_start, 
                    a.round_end, 
                    a.prev_round_start, 
                    a.prev_round_end, 
                    a.next_round_start, 
                    a.next_round_end,
                    IF(b.repo_user != '' and abs(date_diff('second', b.end_time, a.start_time)) < abs(date_diff('second', a.start_time, c.start_time)), b.end_time, a.start_time) AS start_time, 
                    IF(c.repo_user != '' and abs(date_diff('second', b.end_time, a.start_time)) > abs(date_diff('second', a.start_time, c.start_time)), c.start_time, a.end_time) AS end_time, 
                    a.events,
                    date_diff('second', 
                        IF(b.repo_user != '' and abs(date_diff('second', b.end_time, a.start_time)) < abs(date_diff('second', a.start_time, c.start_time)), b.end_time, a.start_time), 
                        IF(c.repo_user != '' and abs(date_diff('second', b.end_time, a.start_time)) > abs(date_diff('second', a.start_time, c.start_time)), c.start_time, a.end_time)
                    ) / (60.0) AS time_spent_minute
                FROM cte_events_merged_single a
                LEFT JOIN cte_events_merged_multiple b
                    ON a.repo_user = b.repo_user
                    AND a.changed_file = b.changed_file
                    AND a.prev_round_start = b.round_start
                    AND a.prev_round_end = b.round_end
                LEFT JOIN cte_events_merged_multiple c
                    ON a.repo_user = c.repo_user
                    AND a.changed_file = c.changed_file
                    AND a.next_round_start = c.round_start
                    AND a.next_round_end = c.round_end
                WHERE b.repo_user != '' 
                    AND c.repo_user != ''
                UNION ALL
                SELECT 
                    a.repo_user, 
                    a.repo_branch,
                    a.changed_file, 
                    a.round_start, 
                    a.round_end, 
                    a.prev_round_start, 
                    a.prev_round_end, 
                    a.next_round_start, 
                    a.next_round_end,
                    a.start_time, 
                    a.end_time, 
                    a.events,
                    1 AS time_spent_minute
                FROM cte_events_merged_single a
                LEFT JOIN cte_events_merged_multiple b
                    ON a.repo_user = b.repo_user
                    AND a.changed_file = b.changed_file
                    AND a.prev_round_start = b.round_start
                    AND a.prev_round_end = b.round_end
                LEFT JOIN cte_events_merged_multiple c
                    ON a.repo_user = c.repo_user
                    AND a.changed_file = c.changed_file
                    AND a.next_round_start = c.round_start
                    AND a.next_round_end = c.round_end
                WHERE b.repo_user == '' 
                    AND c.repo_user == ''
            )
            SELECT
                repo_user,
                arrayElement(splitByChar('/', changed_file), -1) AS changed_file,
                SUM(time_spent_minute) AS time_spent,
                SUM(events) AS num_of_edits
            FROM cte_all_events_time_spent 
            GROUP BY repo_user, changed_file
            ORDER BY num_of_edits DESC;
            """,
            {
                "repo_url": repo_url,
                "time_period": time_period,
            },
        )

        data = "user|file_name|time_spent_min|total_edits\n"
        data += "\n".join(map(lambda data: "|".join(map(str, data)), cursor.fetchall()))

        # bedrock runtime client
        client = boto3.client(AI_SERVICE_NAME, region_name=AWS_REGION)
        payload = {
            "prompt": f"<s>[INST] {data} \n {prompt} [/INST]",
            "max_tokens": 1000,
            "temperature": 0.5,
            "top_p": 0.9,
            "top_k": 50,
        }

        # invoke model
        model_id = "mistral.mistral-large-2402-v1:0"
        response = client.invoke_model(
            contentType="application/json", body=json.dumps(payload), modelId=model_id
        )

        prompt_result = response["body"].read().decode("utf-8")

        cursor.execute(
            """
            CREATE TABLE IF NOT EXIST ai_suggestions (
                id UUID DEFAULT generateUUIDv4(),
                repo_url String,
                prompt String,
                response String
            ) ENGINE = MergeTree()
            ORDER BY (id);
            """
        )

        cursor.execute(
            """
            DELETE FROM ai_suggestions WHERE repo_url = %(repo_url)s;
            """,
            {repo_url: repo_url},
        )

        cursor.execute(
            """
            INSERT INTO ai_suggestions(repo_url, prompt, response)
            VALUES (%(repo_url)s, %(prompt)s, %(response)s)
            """,
            {repo_url: repo_url, prompt: prompt, response: prompt_result},
        )

        cursor.close()
        conn.close()

        return api_response(200, prompt_result)
    except Exception as e:
        traceback.print_exc()
        return api_response(500, "Something went wrong!")


# if __name__ == "__main__":
#     lambda_handler(
#         {"queryStringParameters": {"repo_url": "github.com/mesaugat/low-code.git"}}, []
#     )
