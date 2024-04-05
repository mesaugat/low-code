#!/usr/bin/env python3

def lambda_handler(event, context):
    return {
        'statusCode': 200,
        'body': f'Successful!'
    }
