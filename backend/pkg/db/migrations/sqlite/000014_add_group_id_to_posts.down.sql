-- Remove group_id column from posts table
-- Note: SQLite doesn't support DROP COLUMN directly, 
-- but for rollback purposes, this would require recreating the table
ALTER TABLE posts DROP COLUMN group_id;