-- ====================================================================
-- TeleCloud Database Schema for Supabase / PostgreSQL
-- ====================================================================
-- Copy and paste this exact SQL into your Supabase SQL Editor and run it!

-- 1. Users Table (stores login accounts, email, salt, and encrypted storage keys)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  first_name TEXT,
  username TEXT,
  password_hash TEXT,
  salt TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  storage_bot_token_enc TEXT,
  storage_channel_id TEXT,
  telegram_id TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Files & Folders Table (stores Drive file items and folder structures)
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
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

-- 3. File Chunks Table (stores Telegram 18MB chunk message IDs for large file reassembly)
CREATE TABLE IF NOT EXISTS file_chunks (
  id TEXT PRIMARY KEY,
  file_id TEXT REFERENCES files(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  message_id BIGINT NOT NULL,
  file_id_tg TEXT,
  size INT DEFAULT 0
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_files_owner_folder ON files(owner_id, folder);
CREATE INDEX IF NOT EXISTS idx_files_owner_trashed ON files(owner_id, trashed);
CREATE INDEX IF NOT EXISTS idx_chunks_file_id ON file_chunks(file_id, chunk_index);
