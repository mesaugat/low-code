#!/usr/bin/env python3

import os
import json
import boto3

s3 = boto3.client("s3")


def lambda_handler(event, context):
    event = json.loads(event["body"])

    # Extract data from event
    repo_name = event["repo"]
    json_data = json.dumps(event)

    # S3 bucket and file_key
    bucket_name = "com.lowkey.dumpbucketwa"
    file_key = os.path.join(repo_name, f"{repo_name}.json")

    try:
        # Check if the file exists
        s3.head_object(Bucket=bucket_name, Key=file_key)

        # If file exists, append new data to it
        existing_data = (
            s3.get_object(Bucket=bucket_name, Key=file_key)["Body"]
            .read()
            .decode("utf-8")
        )
        existing_json = json.loads(existing_data)
        existing_json.append(event)
        new_data = json.dumps(existing_json)

    except s3.exceptions.ClientError:
        # If file doesn't exist, create a new JSON
        new_data = json.dumps([event])

    # Save the updated/created data back to S3
    s3.put_object(Bucket=bucket_name, Key=file_key, Body=new_data.encode("utf-8"))

    return {"statusCode": 200, "body": f"File {file_key} uploaded successfully!"}
