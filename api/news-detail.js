import fs from 'fs';
import path from 'path';

const DEFAULT_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cfafqmzyovtuyvffwthx.supabase.co';
const DEFAULT_SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYWZxbXp5b3Z0dXl2ZmZ3dGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTg1MTUsImV4cCI6MjA5OTA3NDUxNX0.s43AkykRS69P7I_FR5jL1dNJI8ecArHOroHAuxXzdZQ';

// Default fallback articles content
const defaultNewsMap = {
  'news-1': {
    title: 'Bilaspur Station Road Pe Naya Underpass Jaldi Hoga Shuru!',
    excerpt: 'Railway administration aur nagar nigam ka joint project. Sadar Bazar aur station side ke vyapariyon ko milegi traffic se badi rahat.',
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800'
  },
  'news-2': {
    title: 'Vyapar Vihar Me Chhattisgarh Ka Sabse Bada Saree Showroom Khula',
    excerpt: 'Premium Chanderi, Kanjeevaram aur designer collections ke sath naya fashion hub launch. Bilaspur me badhegi wedding shopping options.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
  },
  'news-3': {
    title: 'Arpa River Front Project: Bilaspur Me Naya Tourist Spot Taiyar',
    excerpt: 'Chowpatty style food courts, dynamic lighting aur morning walk tracks ke sath, Bilaspur ki naya shaan ban raha hai. Check details.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800'
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
  const id = req.query?.id || 'news-1';

  let article = defaultNewsMap[id] || null;

  // Try fetching from Supabase
  try {
    const url = `${DEFAULT_SUPABASE_URL.replace(/\/$/, '')}/rest/v1/db_news?id=eq.${id}`;
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
    let htmlPath = path.join(process.cwd(), 'dist/news-detail.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(process.cwd(), 'news-detail.html');
    }
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  } catch (err) {
    console.error('Failed to read news-detail.html:', err);
    return res.status(500).send('Server Error: HTML template not found');
  }

  // If article not found in DB and not in default map, we use a generic fallback
  if (!article) {
    article = {
      title: 'News Update',
      excerpt: 'Khabar Bilaspur Ki — Read the latest city development, local events, and business openings news in Bilaspur, Chhattisgarh.',
      image: 'https://developerbilaspur.in/logo.png'
    };
  }

  const title = article.title || 'News Update';
  const excerpt = article.excerpt || '';
  const image = article.image || 'https://developerbilaspur.in/logo.png';
  const reqUrl = `https://developerbilaspur.in/news-detail.html?id=${id}`;

  const pubTime = article.published_at || article.publishedAt || new Date().toISOString();
  const modTime = article.updated_at || article.updatedAt || pubTime;
  const authorName = article.author || 'Dev Bilaspur';
  const schemaObj = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": excerpt,
    "image": [ image ],
    "datePublished": pubTime,
    "dateModified": modTime,
    "author": {
      "@type": "Person",
      "name": authorName,
      "jobTitle": "Local Editor"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Developer Bilaspur",
      "logo": {
        "@type": "ImageObject",
        "url": "https://developerbilaspur.in/logo.png"
      }
    },
    "mainEntityOfPage": reqUrl
  };
  const schemaHtml = `<script type="application/ld+json" id="news-article-schema">\n${JSON.stringify(schemaObj, null, 2)}\n</script>`;

  // Replace title, meta tags, and structured data schema
  let populatedHtml = htmlContent
    .replace(/<title id="page-title">[\s\S]*?<\/title>/i, `<title id="page-title">${escapeHtml(title)} | Developer Bilaspur</title>`)
    .replace(/<meta[^>]*?id="page-desc"[^>]*?>/i, `<meta name="description" id="page-desc" content="${escapeHtml(excerpt)}" />`)
    .replace(/<meta[^>]*?id="og-title"[^>]*?>/i, `<meta property="og:title" id="og-title" content="${escapeHtml(title)}" />`)
    .replace(/<meta[^>]*?id="og-desc"[^>]*?>/i, `<meta property="og:description" id="og-desc" content="${escapeHtml(excerpt)}" />`)
    .replace(/<meta[^>]*?id="og-image"[^>]*?>/i, `<meta property="og:image" id="og-image" content="${escapeHtml(image)}" />`)
    .replace(/<meta[^>]*?id="og-url"[^>]*?>/i, `<meta property="og:url" id="og-url" content="${escapeHtml(reqUrl)}" />`)
    .replace(/<meta[^>]*?id="twitter-title"[^>]*?>/i, `<meta name="twitter:title" id="twitter-title" content="${escapeHtml(title)}" />`)
    .replace(/<meta[^>]*?id="twitter-desc"[^>]*?>/i, `<meta name="twitter:description" id="twitter-desc" content="${escapeHtml(excerpt)}" />`)
    .replace(/<meta[^>]*?id="twitter-image"[^>]*?>/i, `<meta name="twitter:image" id="twitter-image" content="${escapeHtml(image)}" />`)
    .replace(/<script[^>]*?id="news-article-schema"[^>]*?>[\s\S]*?<\/script>/i, schemaHtml);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(populatedHtml);
}
