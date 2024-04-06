#!/usr/bin/env python3

import json
import boto3

AWS_REGION = "us-east-1"
AI_SERVICE_NAME = "bedrock-runtime"

test_body = "How are the users doing, and where are they spending their most time? The value is in hours."
test_insights = r'{"users": ["Saphall", "Bhagwan Thapa"], "graph": {"name": "ROOT", "children": [{"name": "extension", "children": [{"name": "src", "children": [{"name": "services.ts", "url": "github.com/mesaugat/low-code/blob/main/extension/src/services.ts", "value": 0.20666666666666667}, {"name": "extension.ts", "url": "github.com/mesaugat/low-code/blob/main/extension/src/extension.ts", "value": 0.007222222222222223}, {"name": "constants.ts", "url": "github.com/mesaugat/low-code/blob/main/extension/src/constants.ts", "value": 0.12777777777777777}, {"name": "commands.ts", "url": "github.com/mesaugat/low-code/blob/main/extension/src/commands.ts", "value": 0.010833333333333334}]}, {"name": "package.json", "url": "github.com/mesaugat/low-code/blob/main/extension/package.json", "value": 0.005}]}, {"name": "fake_payload_generator", "children": [{"name": "fake_data", "children": [{"name": "vomica-tribuo-tabgo", "children": [{"name": "vomica-tribuo-tabgo.json", "url": "github.com/mesaugat/low-code/blob/main/fake_payload_generator/fake_data/vomica-tribuo-tabgo/vomica-tribuo-tabgo.json", "value": 0.006944444444444445}]}]}]}, {"name": "backend", "children": [{"name": "requirements.txt", "url": "github.com/mesaugat/low-code/blob/main/backend/requirements.txt", "value": 0.004166666666666667}, {"name": "lambda-evaluate.py", "url": "github.com/mesaugat/low-code/blob/main/backend/lambda-evaluate.py", "value": 0.028055555555555556}, {"name": "lambda-ingest.py", "url": "github.com/mesaugat/low-code/blob/main/backend/lambda-ingest.py", "value": 0.035}]}, {"name": "infra", "children": [{"name": "lambda.tf", "url": "github.com/mesaugat/low-code/blob/main/infra/lambda.tf", "value": 0.0033333333333333335}]}]}}'

client = boto3.client(AI_SERVICE_NAME, region_name=AWS_REGION)
payload = {
    "prompt": f"<s>[INST] {test_body} '{test_insights}' [/INST]",
    "max_tokens": 500,
    "temperature": 0.5,
    "top_p": 0.9,
    "top_k": 50
}

print(json.dumps(payload, ensure_ascii=False))

model_id = "mistral.mistral-large-2402-v1:0"

response = client.invoke_model(
    contentType="application/json", body=json.dumps(payload), modelId=model_id
)
inference_result = response["body"].read().decode("utf-8")

json_data = json.loads(inference_result)
print(json_data)

