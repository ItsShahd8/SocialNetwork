ALTER TABLE posts ADD COLUMN group_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts(group_id);

-- Note: foreign key reference for group_id (if groups table exists)
-- SQLite cannot easily add FOREIGN KEY via ALTER TABLE; ensured logically in code.