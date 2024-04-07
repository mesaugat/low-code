#!/usr/bin/env python3

import os
import json
import traceback

from clickhouse_driver import connect


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


def build_dir_tree(data, repo_url, metrics):
    root = repo_url.split("/")[-1]
    tree = {
        "name": root,
        "unit": "minute" if metrics == "time_spent" else "edit",
        "children": [],
    }
    cache_pointer = {root: tree}

    for repo_branch, changed_file, time_spent, num_of_edits in data:
        url = (
            repo_url.replace(".git", "")
            + "/"
            + "blob"
            + "/"
            + repo_branch
            + "/"
            + changed_file
        )
        file_name = os.path.basename(changed_file)
        file_path = os.path.dirname(changed_file)

        data_item = {
            "name": file_name,
            "url": url,
            "value": time_spent if metrics == "time_spent" else num_of_edits,
            "unit": "minute" if metrics == "time_spent" else "edit",
        }

        if file_path in cache_pointer:
            tree[cache_pointer[file_path]]["children"].append(data_item)

            continue

        path_comp = os.path.normpath(file_path).split(os.path.sep)
        traversed_path = root
        head = tree

        if path_comp[0] == "":
            path_comp.pop(0)

        for comp in path_comp:
            traversed_path = traversed_path + "/" + comp
            curr = list(filter(lambda child: child["name"] == comp, head["children"]))
            if len(curr) == 0:
                new_child = {
                    "name": comp,
                    "unit": "minute" if metrics == "time_spent" else "edit",
                    "children": [],
                }
                head["children"].append(new_child)
                cache_pointer[traversed_path] = new_child
                head = new_child
            else:
                head = curr[0]

        head["children"].append(data_item)

    return tree


def api_response(status_code, data):
    headers = {"Content-Type": "application/json"}

    return {"statusCode": status_code, "body": json.dumps(data), "headers": headers}


def lambda_handler(event, context):
    qs = event["queryStringParameters"]
    repo_url = qs["repo_url"]
    user = qs.get("user", None)
    base_path = qs.get("base_path", None)
    metrics = qs.get("metrics", None)
    time_period = qs.get("time_period", None) or 90

    if metrics not in ("time_spent", "edits"):
        metrics = "time_spent"

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

        user_filter = "AND repo_user = %(user)s" if user else ""
        path_filter = "AND changed_file LIKE %(base_path)s" if base_path else ""

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
                    {user_filter}
                    {path_filter}
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
                'main' AS repo_branch, -- FIXME: Add filter in app for branch to use actual branch.
                changed_file,
                SUM(time_spent_minute) AS time_spent,
                SUM(events) AS num_of_edits
            FROM cte_all_events_time_spent 
            GROUP BY changed_file;
        """,
            {
                "repo_url": repo_url,
                "user": user,
                "base_path": base_path + "%" if base_path else None,
                "time_period": time_period,
            },
        )

        data = cursor.fetchall()

        tree = build_dir_tree(data, repo_url, metrics)

        cursor.execute(
            f"""
            SELECT DISTINCT repo_user
            FROM ingestion_payload
            WHERE repo_url = %(repo_url)s
        """,
            {"repo_url": repo_url},
        )
        users = cursor.fetchall()

        cursor.close()
        conn.close()

        return api_response(
            200, {"users": list(map(lambda user: user[0], users)), "graph": tree}
        )
    except Exception as e:
        traceback.print_exc()
        return api_response(500, "Something went wrong!")
