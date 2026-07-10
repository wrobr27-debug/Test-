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

-- 1. Policies for db_blogs (Guides)
CREATE POLICY "Allow public read access to published blogs" ON public.db_blogs
    FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated users full CRUD access to blogs" ON public.db_blogs
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- 2. Policies for db_news (News Articles)
CREATE POLICY "Allow public read access to published news" ON public.db_news
    FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated users full CRUD access to news" ON public.db_news
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- 3. Policies for db_demos (Client Templates)
CREATE POLICY "Allow public read access to demos" ON public.db_demos
    FOR SELECT USING (TRUE);

CREATE POLICY "Allow authenticated users full CRUD access to demos" ON public.db_demos
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
