import fs from 'fs';
import path from 'path';

const DEFAULT_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cfafqmzyovtuyvffwthx.supabase.co';
const DEFAULT_SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYWZxbXp5b3Z0dXl2ZmZ3dGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTg1MTUsImV4cCI6MjA5OTA3NDUxNX0.s43AkykRS69P7I_FR5jL1dNJI8ecArHOroHAuxXzdZQ';

// Default fallback articles content
const defaultBlogsMap = {
  'default-1': {
    title: 'Bilaspur Me Apne Local Business Ko Google Map Pe Top Kaise Layein?',
    excerpt: 'Aasan guide jo aapko batayegi ki kaise 3 simple steps me Google My Business profile banakar map search me 1st rank laani hai.',
    image: 'https://developerbilaspur.in/proof.png'
  },
  'default-2': {
    title: 'WhatsApp Auto-Reply Se Dukandaar Apni Sales Kaise Badha Sakte Hain?',
    excerpt: 'WhatsApp automation engine ke fayde aur use cases. Sikhein kaise chat-bot customer orders automatically process karta hai.',
    image: 'https://developerbilaspur.in/proof.png'
  },
  'default-3': {
    title: 'Modern E-Commerce Website Ke Liye Best UX Principles [2026 Edition]',
    excerpt: 'Aapke online catalog ko conversion-optimized rakhne ke naye design rules jo checkout speed aur engagement ko 3x badha denge.',
    image: 'https://developerbilaspur.in/proof.png'
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  const id = req.query?.id || 'default-1';

  let article = defaultBlogsMap[id] || null;

  // Try fetching from Supabase
  try {
    const url = `${DEFAULT_SUPABASE_URL.replace(/\/$/, '')}/rest/v1/db_blogs?id=eq.${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': DEFAULT_SUPABASE_KEY,
        'Authorization': `Bearer ${DEFAULT_SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        article = data[0];
      }
    }
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
  }

  // Load the HTML file
  let htmlContent = '';
  try {
    let htmlPath = path.join(process.cwd(), 'dist/blog-detail.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(process.cwd(), 'blog-detail.html');
    }
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  } catch (err) {
    console.error('Failed to read blog-detail.html:', err);
    return res.status(500).send('Server Error: HTML template not found');
  }

  // If article not found in DB and not in default map, we use a generic fallback
  if (!article) {
    article = {
      title: 'Blog Post',
      excerpt: 'Developer Bilaspur Blog — premium web design, local SEO aur WhatsApp automation guides for Bilaspur businesses.',
      image: 'https://developerbilaspur.in/proof.png'
    };
  }

  const title = article.title || 'Blog Post';
  const excerpt = article.excerpt || '';
  const image = article.image || 'https://developerbilaspur.in/proof.png';
  const reqUrl = `https://developerbilaspur.in/blog-detail.html?id=${id}`;

  // Replace title and meta tags
  let populatedHtml = htmlContent
    .replace(/<title id="page-title">[\s\S]*?<\/title>/i, `<title id="page-title">${escapeHtml(title)} | Developer Bilaspur</title>`)
    .replace(/<meta[^>]*?id="page-desc"[^>]*?>/i, `<meta name="description" id="page-desc" content="${escapeHtml(excerpt)}" />`)
    .replace(/<meta[^>]*?id="og-title"[^>]*?>/i, `<meta property="og:title" id="og-title" content="${escapeHtml(title)}" />`)
    .replace(/<meta[^>]*?id="og-desc"[^>]*?>/i, `<meta property="og:description" id="og-desc" content="${escapeHtml(excerpt)}" />`)
    .replace(/<meta[^>]*?id="og-image"[^>]*?>/i, `<meta property="og:image" id="og-image" content="${escapeHtml(image)}" />`)
    .replace(/<meta[^>]*?id="og-url"[^>]*?>/i, `<meta property="og:url" id="og-url" content="${escapeHtml(reqUrl)}" />`)
    .replace(/<meta[^>]*?id="twitter-title"[^>]*?>/i, `<meta name="twitter:title" id="twitter-title" content="${escapeHtml(title)}" />`)
    .replace(/<meta[^>]*?id="twitter-desc"[^>]*?>/i, `<meta name="twitter:description" id="twitter-desc" content="${escapeHtml(excerpt)}" />`)
    .replace(/<meta[^>]*?id="twitter-image"[^>]*?>/i, `<meta name="twitter:image" id="twitter-image" content="${escapeHtml(image)}" />`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(populatedHtml);
}
