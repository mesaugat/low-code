import os
import json
import clickhouse_driver

from dateutil.parser import isoparse


def connect_to_clickhouse():
    # Connect to ClickHouse
    connection = clickhouse_driver.connect(
            host=os.getenv("host", ""),
            port=os.getenv("port", 9000),
            user=os.getenv("user", "default"),
            password=os.getenv("password", ""),
            database=os.getenv("database", "default")
        )
    return connection


def lambda_handler(event, context):
    # Parse incoming request
    request_body = json.loads(event['body'])

    try:
        con = connect_to_clickhouse()
        cur = con.cursor()

        cur.execute("SHOW TABLES LIKE 'ingestion_payload'")
        table_exists = cur.fetchone() is not None

        if table_exists:
            cur.execute("DROP TABLE default.ingestion_payload")
        cur.execute("""
            CREATE TABLE default.ingestion_payload (
                id UUID DEFAULT generateUUIDv4(),
                repo_url String,
                repo_branch String,
                repo_head String,
                repo_user String,
                changed_file String,
                change_reason String,
                range_start_line UInt64,
                range_end_line UInt64,
                is_dirty UInt8,
                timestamp DateTime64(3, 'UTC')
            ) ENGINE = MergeTree()
            ORDER BY (id)
            """)

        # Insert the request payload
        for item in request_body:
            item['timestamp'] = isoparse(item['timestamp'])
            cur.execute("""
            INSERT INTO default.ingestion_payload (
            change_reason,
            changed_file,
            is_dirty,
            range_start_line,
            range_end_line,
            repo_branch,
            repo_head,
            repo_url,
            repo_user,
            timestamp
            ) VALUES (
                %(change_reason)s,
                %(changed_file)s,
                %(is_dirty)s,
                %(range_start_line)s,
                %(range_end_line)s,
                %(repo_branch)s,
                %(repo_head)s,
                %(repo_url)s,
                %(repo_user)s,
                %(timestamp)s
                )
                """, item)

        return {
        'statusCode': 200,
        'body': json.dumps('Data inserted successfully!')
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }
