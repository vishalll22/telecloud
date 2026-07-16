-- ========================================
-- TeleCloud Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ========================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  telegram_id TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  salt TEXT,
  first_name TEXT DEFAULT 'User',
  username TEXT,
  photo_url TEXT,
  storage_bot_token_enc TEXT,
  storage_channel_id TEXT,
  reset_token TEXT,
  reset_token_expires TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Files Table
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  folder TEXT DEFAULT '/',
  size BIGINT DEFAULT 0,
  mime_type TEXT,
  is_folder BOOLEAN DEFAULT FALSE,
  starred BOOLEAN DEFAULT FALSE,
  trashed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. File Chunks Table (for Telegram chunked uploads)
CREATE TABLE IF NOT EXISTS file_chunks (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  message_id BIGINT,
  file_id_tg TEXT,
  size BIGINT DEFAULT 0
);

-- 4. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_files_owner_id ON files(owner_id);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(owner_id, folder);
CREATE INDEX IF NOT EXISTS idx_files_trashed ON files(owner_id, trashed);
CREATE INDEX IF NOT EXISTS idx_file_chunks_file_id ON file_chunks(file_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- 5. Disable RLS (using service_role key from backend, not anon key)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_chunks ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (your backend uses service_role key)
CREATE POLICY "Service role full access on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on files" ON files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on file_chunks" ON file_chunks FOR ALL USING (true) WITH CHECK (true);
