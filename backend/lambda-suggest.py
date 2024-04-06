#!/usr/bin/env python3

import json
import boto3

AWS_REGION = "us-east-1"
AI_SERVICE_NAME = "bedrock-runtime"


def lambda_handler(event, context):
    payload_json = event['payload_json']
    prompt_text = event['prompt_text']

    try:
        # bedrock runtime client
        client = boto3.client(AI_SERVICE_NAME, region_name=AWS_REGION)
        payload = {
        "prompt": f"<s>[INST] {prompt_text} '{payload_json}' [/INST]",
        "max_tokens": 500,
        "temperature": 0.5,
        "top_p": 0.9,
        "top_k": 50
        }

        # invoke model
        model_id = "mistral.mistral-large-2402-v1:0"
        response = client.invoke_model(
            contentType="application/json", body=json.dumps(payload), modelId=model_id
        )
        
        prompt_result = response["body"].read().decode("utf-8")
        json_data = json.loads(prompt_result)
    
        return {
            'statusCode': 200,
            'body': json.dumps(json_data)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }
