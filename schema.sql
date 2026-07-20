-- ============================================================================
-- Supabase SQL Schema for Developer Bilaspur Website
-- Execute this script in your Supabase SQL Editor (https://supabase.com)
-- ============================================================================

-- 1. Create Guides/Blogs Table
CREATE TABLE IF NOT EXISTS public.db_blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    author TEXT DEFAULT 'Dev Bilaspur',
    status TEXT DEFAULT 'draft',
    visibility TEXT DEFAULT 'public',
    format TEXT DEFAULT 'standard',
    categories TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    readtime TEXT,
    emoji TEXT,
    "featuredImage" TEXT,
    image TEXT,
    published_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sticky BOOLEAN DEFAULT FALSE,
    "focusKeyword" TEXT,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "allowComments" BOOLEAN DEFAULT TRUE,
    "allowPings" BOOLEAN DEFAULT TRUE
);

-- 2. Create News Table
CREATE TABLE IF NOT EXISTS public.db_news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    author TEXT DEFAULT 'Dev Bilaspur',
    status TEXT DEFAULT 'draft',
    visibility TEXT DEFAULT 'public',
    format TEXT DEFAULT 'standard',
    category TEXT DEFAULT 'local',
    readtime TEXT,
    emoji TEXT,
    "featuredImage" TEXT,
    image TEXT,
    published_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sticky BOOLEAN DEFAULT FALSE,
    "focusKeyword" TEXT,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "allowComments" BOOLEAN DEFAULT TRUE,
    "allowPings" BOOLEAN DEFAULT TRUE
);

-- 3. Create Website Demos Table
CREATE TABLE IF NOT EXISTS public.db_demos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    desc_text TEXT,
    url TEXT NOT NULL,
    category TEXT,
    emoji TEXT,
    image TEXT,
    priority INTEGER DEFAULT 10
);

-- ============================================================================
-- Row Level Security (RLS) Configuration
-- ============================================================================

-- Enable RLS for all tables
ALTER TABLE public.db_blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_demos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to published blogs" ON public.db_blogs;
DROP POLICY IF EXISTS "Allow authenticated users full CRUD access to blogs" ON public.db_blogs;
DROP POLICY IF EXISTS "Allow full access to db_blogs" ON public.db_blogs;

DROP POLICY IF EXISTS "Allow public read access to published news" ON public.db_news;
DROP POLICY IF EXISTS "Allow authenticated users full CRUD access to news" ON public.db_news;
DROP POLICY IF EXISTS "Allow full access to db_news" ON public.db_news;

DROP POLICY IF EXISTS "Allow public read access to demos" ON public.db_demos;
DROP POLICY IF EXISTS "Allow authenticated users full CRUD access to demos" ON public.db_demos;
DROP POLICY IF EXISTS "Allow full access to db_demos" ON public.db_demos;

-- Grant Full Read/Write Access Policies (Anon & Authenticated)
CREATE POLICY "Allow full access to db_blogs" ON public.db_blogs
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow full access to db_news" ON public.db_news
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow full access to db_demos" ON public.db_demos
    FOR ALL USING (TRUE) WITH CHECK (TRUE);
