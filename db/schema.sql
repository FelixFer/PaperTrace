-- PaperTrace Database Schema for Neon PostgreSQL
-- Run this script inside your Neon SQL Editor console

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main Notes Table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_key VARCHAR(64) UNIQUE NOT NULL,       -- Access Key (e.g. "my-project-notes")
    
    -- Content Layers
    content_html TEXT NOT NULL DEFAULT '',       -- HTML string from Tiptap
    content_json JSONB NOT NULL DEFAULT '{}',    -- Native ProseMirror JSON AST
    content_md TEXT DEFAULT '',                  -- Export cached Markdown
    
    -- Security Layer
    is_protected BOOLEAN NOT NULL DEFAULT FALSE,
    pin_hash VARCHAR(255) DEFAULT NULL,          -- Hashed PIN via bcrypt (never plain text)
    
    -- Dual Share Tokens
    read_only_token VARCHAR(64) UNIQUE DEFAULT NULL, -- Token for view-only URL
    edit_token VARCHAR(64) UNIQUE DEFAULT NULL,      -- Token for edit URL without key
    
    -- Expiration / Self-Destruct
    ttl_mode VARCHAR(16) DEFAULT 'never',        -- Mode: 'never', '1d', '7d', '30d', 'burn_on_read'
    expires_at TIMESTAMPTZ DEFAULT NULL,         -- Calculated expiration time
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast Lookups & Serverless Edge Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notes_key ON notes(note_key);
CREATE INDEX IF NOT EXISTS idx_notes_read_token ON notes(read_only_token) WHERE read_only_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_edit_token ON notes(edit_token) WHERE edit_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_expires_at ON notes(expires_at) WHERE expires_at IS NOT NULL;

-- Automatically Update 'updated_at' Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
