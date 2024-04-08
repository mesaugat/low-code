CREATE TABLE IF NOT EXISTS ingestion_payload (
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
ORDER BY (id) """