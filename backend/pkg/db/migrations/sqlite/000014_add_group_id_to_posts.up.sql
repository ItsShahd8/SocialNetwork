-- Add group_id column to posts table for group posts
ALTER TABLE posts ADD COLUMN group_id INTEGER DEFAULT NULL;

-- Add foreign key constraint (SQLite doesn't support adding foreign keys to existing tables,
-- but we'll handle this constraint in the application logic)
-- FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;