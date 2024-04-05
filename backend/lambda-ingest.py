#!/usr/bin/env python3

import boto3
import os
import datetime
import json

s3 = boto3.client('s3')

def lambda_handler(ev, context):
    event = json.loads(ev["body"])
    file_content = event['content']
    repo_name = event['github_url'].split('/')[-1]
    current_timestamp = event['current_timestamp']
    file_name = event['name']

    s3.put_object(
        Bucket='',
        Key=os.path.join(repo_name, f'{current_timestamp}_{file_name}'),
        Body=file_content.encode('utf-8')
    )

    return {
        'statusCode': 200,
        'body': f'File {file_name} uploaded successfully!'
    }
