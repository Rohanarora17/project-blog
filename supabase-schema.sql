-- Supabase Schema for Newsletter Subscribers
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the subscribe form)
CREATE POLICY "Allow anonymous inserts"
  ON subscribers
  FOR INSERT
  WITH CHECK (true);

-- Allow reading active subscriber count (optional, for admin)
CREATE POLICY "Allow service role full access"
  ON subscribers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);

-- Index on is_active for efficient newsletter sends
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers (is_active);
