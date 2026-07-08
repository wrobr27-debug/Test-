-- SQL Database Migration Schema
-- Copy-paste this script into your Supabase SQL Editor and click "Run".

-- 1. Guides/Blogs Table
CREATE TABLE IF NOT EXISTS db_blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'Dev Bilaspur',
  status TEXT DEFAULT 'draft',
  visibility TEXT DEFAULT 'public',
  format TEXT DEFAULT 'standard',
  categories TEXT[],
  tags TEXT[],
  readtime TEXT DEFAULT '3 min read',
  emoji TEXT DEFAULT '📝',
  "featuredImage" TEXT,
  image TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sticky BOOLEAN DEFAULT FALSE,
  "focusKeyword" TEXT,
  "metaTitle" TEXT,
  "metaDesc" TEXT,
  "allowComments" BOOLEAN DEFAULT TRUE,
  "allowPings" BOOLEAN DEFAULT TRUE
);

-- 2. News Table
CREATE TABLE IF NOT EXISTS db_news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'Dev Bilaspur',
  status TEXT DEFAULT 'draft',
  visibility TEXT DEFAULT 'public',
  format TEXT DEFAULT 'standard',
  category TEXT DEFAULT 'local',
  readtime TEXT DEFAULT '3 min read',
  emoji TEXT DEFAULT '📰',
  "featuredImage" TEXT,
  image TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sticky BOOLEAN DEFAULT FALSE,
  "focusKeyword" TEXT,
  "metaTitle" TEXT,
  "metaDesc" TEXT,
  "allowComments" BOOLEAN DEFAULT TRUE,
  "allowPings" BOOLEAN DEFAULT TRUE
);

-- 3. Demos Table
CREATE TABLE IF NOT EXISTS db_demos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  desc_text TEXT,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'ecommerce',
  emoji TEXT DEFAULT '🌐',
  image TEXT,
  priority INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE db_blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_demos ENABLE ROW LEVEL SECURITY;

-- 5. Create Public Policies (Allows anyone to read & allows editing via anon API keys)
CREATE POLICY "Enable read/write for all users" ON db_blogs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all users" ON db_news FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all users" ON db_demos FOR ALL USING (true) WITH CHECK (true);
