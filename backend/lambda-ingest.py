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

def create_table_if_not_exists(cur):
    cur.execute("SHOW TABLES LIKE 'ingestion_payload'")
    table_exists = cur.fetchone() is not None

    if not table_exists:
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

def insert_data(cur, request_body):
    # Prepare the data for insertion
    data = ', '.join([
        "('{}', '{}', {}, {}, {}, '{}', '{}', '{}', '{}', '{}')".format(
            item['change_reason'],
            item['changed_file'],
            item['is_dirty'],
            item['range_start_line'],
            item['range_end_line'],
            item['repo_branch'],
            item['repo_head'],
            item['repo_url'],
            item['repo_user'],
            isoparse(item['timestamp']).strftime('%Y-%m-%d %H:%M:%S')
        ) for item in request_body
    ])

    # Insert all the data at once
    cur.execute(f"""
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
        ) VALUES {data}
    """)

def lambda_handler(event, context):
    # Parse incoming request
    request_body = json.loads(event['body'])

    try:
        con = connect_to_clickhouse()
        cur = con.cursor()

        create_table_if_not_exists(cur)
        insert_data(cur, request_body)

        return {
            'statusCode': 200,
            'body': json.dumps('Data inserted successfully!')
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }
