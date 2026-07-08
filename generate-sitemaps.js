// generate-sitemaps.js
// Run at Vercel build time via `npm run build` → prebuild hook.
// Fetches all published posts/news/demos from Supabase and writes:
//   dist/sitemap.xml        — master sitemap index
//   dist/sitemap-blogs.xml  — blog guides
//   dist/sitemap-news.xml   — news articles (Google News format)
//   dist/sitemap-demos.xml  — demo/template pages

import fs   from 'fs';
import path from 'path';

// ── Config ──────────────────────────────────────────────────────────────────
const SITE_URL      = 'https://developerbilaspur.in';
const SUPABASE_URL  = 'https://cfafqmzyovtuyvffwthx.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYWZxbXp5b3Z0dXl2ZmZ3dGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTg1MTUsImV4cCI6MjA5OTA3NDUxNX0.s43AkykRS69P7I_FR5jL1dNJI8ecArHOroHAuxXzdZQ';
const OUTPUT_DIR    = './dist';

// Static pages included in every sitemap
const STATIC_PAGES  = [
  { url: '/',                changefreq: 'weekly',  priority: '1.0' },
  { url: '/blog',            changefreq: 'weekly',  priority: '0.9' },
  { url: '/news',            changefreq: 'daily',   priority: '0.9' },
  { url: '/demos',           changefreq: 'weekly',  priority: '0.8' },
  { url: '/author-dev-bilaspur', changefreq: 'monthly', priority: '0.6' },
  { url: '/privacy-policy',  changefreq: 'monthly', priority: '0.4' },
  { url: '/disclaimer',      changefreq: 'monthly', priority: '0.4' },
  { url: '/terms',           changefreq: 'monthly', priority: '0.4' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isoDate(str) {
  if (!str) return new Date().toISOString().split('T')[0];
  try { return new Date(str).toISOString().split('T')[0]; } catch { return new Date().toISOString().split('T')[0]; }
}

async function fetchTable(table) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?select=*&status=eq.published&order=created_at.desc`,
    {
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
      },
    }
  );
  if (!res.ok) {
    console.warn(`⚠️  Could not fetch table "${table}" — using empty list. (${res.status})`);
    return [];
  }
  return res.json();
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅  Written: ${filePath} (${content.length} bytes)`);
}

// ── Sitemap builders ─────────────────────────────────────────────────────────
function buildBlogsSitemap(blogs) {
  const urls = STATIC_PAGES.map(p => `
  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

  const posts = blogs.map(b => `
  <url>
    <loc>${SITE_URL}/blog-detail?id=${esc(b.id)}</loc>
    <lastmod>${isoDate(b.updated_at || b.publishedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
${posts}
</urlset>`;
}

function buildNewsSitemap(news) {
  // Google News sitemap — must only include articles from the last 2 days
  // but we include all for indexing purposes; Google will filter by date
  const items = news.map(n => `
  <url>
    <loc>${SITE_URL}/news-detail?id=${esc(n.id)}</loc>
    <news:news>
      <news:publication>
        <news:name>Developer Bilaspur</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${isoDate(n.publishedAt)}</news:publication_date>
      <news:title>${esc(n.title)}</news:title>
    </news:news>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;
}

function buildDemosSitemap(demos) {
  const items = demos.map(d => `
  <url>
    <loc>${SITE_URL}/demos</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);

  // Deduplicate (all demos point to /demos page for now)
  const unique = [...new Set(items)].join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique}
</urlset>`;
}

function buildSitemapIndex(lastmod) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-blogs.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-news.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-demos.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n🗺️  Developer Bilaspur — Sitemap Generator\n');

  let blogs = [], news = [], demos = [];

  try {
    [blogs, news, demos] = await Promise.all([
      fetchTable('db_blogs'),
      fetchTable('db_news'),
      fetchTable('db_demos'),
    ]);
    console.log(`📦  Fetched: ${blogs.length} blogs, ${news.length} news, ${demos.length} demos`);
  } catch (err) {
    console.warn('⚠️  Supabase fetch failed — generating sitemaps with static pages only.');
    console.warn(err.message);
  }

  const today = new Date().toISOString().split('T')[0];

  writeFile(`${OUTPUT_DIR}/sitemap.xml`,       buildSitemapIndex(today));
  writeFile(`${OUTPUT_DIR}/sitemap-blogs.xml`, buildBlogsSitemap(blogs));
  writeFile(`${OUTPUT_DIR}/sitemap-news.xml`,  buildNewsSitemap(news));
  writeFile(`${OUTPUT_DIR}/sitemap-demos.xml`, buildDemosSitemap(demos));

  console.log('\n✨  All sitemaps generated successfully!\n');
})();
