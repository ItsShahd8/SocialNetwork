CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob TEXT NOT NULL,
  avatar_url TEXT,
  nickname TEXT,
  about_me TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
