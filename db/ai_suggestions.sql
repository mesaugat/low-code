CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID DEFAULT generateUUIDv4(),
    repo_url String,
    prompt String,
    response String
) ENGINE = MergeTree()
ORDER BY (id);
