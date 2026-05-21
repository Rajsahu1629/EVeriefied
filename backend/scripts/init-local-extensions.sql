-- Extra columns/tables used by the API (beyond base migrate_rds schema)

ALTER TABLE users ADD COLUMN IF NOT EXISTS current_salary VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS card_ordered BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_quiz_attempt TIMESTAMP;

ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS full_address TEXT;
ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);
ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS push_token TEXT;

CREATE TABLE IF NOT EXISTS quiz_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_scores_user ON quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_played ON quiz_scores(played_at);
