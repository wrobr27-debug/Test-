// Individual News Article Renderer
import { db } from './db-client.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNewsDetail();
  setupReadingProgress();
});

function getCategoryLabel(cat) {
  const map = {
    infrastructure: 'City Development',
    business: 'Store Openings',
    events: 'Events & Festivals',
    local: 'Local Buzz'
  };
  return map[cat] || 'General News';
}

function formatDate(iso) {
  if (!iso) return 'July 2026';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function renderNewsDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'news-1';

  // Fetch from database (Supabase or localStorage fallback)
  const allNews = await db.getNews();
  
  // Default news content fallback (matching src/news.js seed)
  const defaultNewsMap = {
    'news-1': {
      title: 'Bilaspur Station Road Pe Naya Underpass Jaldi Hoga Shuru!',
      category: 'infrastructure',
      excerpt: 'Railway administration aur nagar nigam ka joint project. Sadar Bazar aur station side ke vyapariyon ko milegi traffic se badi rahat.',
      author: 'Dev Bilaspur',
      readtime: '2 min read',
      emoji: '🚇',
      date: 'July 8, 2026',
      image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800',
      content: `
        <p>Bilaspur city ki sabse badi traffic problem solve hone ja rahi hai. <strong>Station Road to Sadar Bazar link</strong> par ban raha naya double-lane railway underpass agle mahine se aam janta ke liye khol diya jayega. Nagar Nigam aur Railway authorities ne joint inspection kar construction speed double karne ka faisla kiya hai.</p>
        <h2>1. Sadar Bazar Ki Dukanon Ko Hoga Fayda</h2>
        <p>Pichle 3 saalon se railway line band hone ke karan customers ko ghumkar jana padta tha. Naya underpass shuru hote hi Sadar Bazar aur Vyapar Vihar ke beech ki doori sirf 2 minute ki reh jayegi. Local shop owners ka kehna hai ki isse daily sales me <strong>30% se 40% tak ka boost</strong> aane ki umeed hai.</p>
        <h2>2. High-Speed Concrete Box Push Technique</h2>
        <p>Railway ne is project me naya box pushing technology use kiya hai jiske karan trains bina roke construction complete kiya gaya. Subah 10 baje se shaam 8 baje tak peak hours me traffic load manage karne ke liye special traffic police personnel deploy kiye ja rahe hain.</p>
        <blockquote>Local update: Sadar Bazar Vyapari Sangh ne naye underpass opening ke din special store decorations aur flat discounts ka announcement kiya hai.</blockquote>
      `
    },
    'news-2': {
      title: 'Vyapar Vihar Me Chhattisgarh Ka Sabse Bada Saree Showroom Khula',
      category: 'business',
      excerpt: 'Premium Chanderi, Kanjeevaram aur designer collections ke sath naya fashion hub launch. Bilaspur me badhegi wedding shopping options.',
      author: 'Dev Bilaspur',
      readtime: '3 min read',
      emoji: '🛍️',
      date: 'July 7, 2026',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      content: `
        <p>Chhattisgarh ke high-end clothing segment me naya milestone set karte hue Bilaspur ke <strong>Vyapar Vihar main road</strong> par sabse bada designer saree store launch ho gaya hai. Grand opening ceremony me Raipur aur Bilaspur ke prasiddh fashion designers aur local vyapari shamil hue.</p>
        <h2>1. 10,000 Sq. Ft. Built-up Area me Custom Collections</h2>
        <p>Showroom ke manager ne bataya ki is store me khas taur par Madhya Pradesh ki mashhoor *Chanderi*, Varanasi ki *Banarasi Silk*, aur South India ki classic *Kanjeevaram* sarees ki live handloom catalogs rakhi gayi hain. Local weavers ko direct promote karne ke liye is store me direct purchase system lagaya gaya hai.</p>
        <h2>2. Digital Screen & Live WhatsApp catalog cataloging</h2>
        <p>Store owner ne tech integration ka batate hue kaha: "Humne local customer orders automate karne ke liye hamara custom WhatsApp web dashboard setup karwaya hai. Customers dukaan par aane se pehle website link par designs browse karke static cart select karti hain."</p>
        <h2>3. Opening Offer</h2>
        <p>Inaugural week me har designer saree purchase par free gold coin offer chal raha hai. Sadar Bazar, Link Road aur Vyapar Vihar se customers ka bhari crowd pahuch raha hai.</p>
      `
    },
    'news-3': {
      title: 'Arpa River Front Project: Bilaspur Me Naya Tourist Spot Taiyar',
      category: 'local',
      excerpt: 'Chowpatty style food courts, dynamic lighting aur morning walk tracks ke sath, Bilaspur ki naya shaan ban raha hai. Check details.',
      author: 'Dev Bilaspur',
      readtime: '3 min read',
      emoji: '🏞️',
      date: 'July 6, 2026',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800',
      content: `
        <p>Bilaspur ki lifeline Arpa Nadi ke dono kinaro par chal raha smart city <strong>Arpa River Front Project</strong> phase-1 complete ho gaya hai. Chati chowk se lekar shani mandir road tak banaye gaye is beautiful corridor ko general public ke liye open kar diya gaya hai.</p>
        <h2>1. Food Stalls & Local Chowpatty Hub</h2>
        <p>River front park me special 25 designer food stalls banaye gaye hain jahan Bilaspur ki local delicacies ke sath pan-Indian dishes serve ki jayengi. Nagar nigam in stalls ke liye direct auction method use kar raha hai.</p>
        <h2>2. Dynamic LED Lighting & Selfie Zones</h2>
        <p>Har shaam nadi kinare laser display aur musical fountains run honge jo Bilaspur ke local tourism ko promote karenge. Safe evening walk ke liye absolute secure CCTV cameras deploy kiye gaye hain.</p>
        <blockquote>Timings: Park daily subah 5:00 AM se 9:30 AM tak morning walkers ke liye aur shaam ko 4:30 PM se 10:00 PM tak open rahega. Entry is week ke liye free rakhi gayi hai.</blockquote>
      `
    }
  };

  const matched = allNews.find(n => n.id === id) || defaultNewsMap[id];

  if (!matched) {
    const bodyEl = document.getElementById('article-content-body');
    if (bodyEl) {
      bodyEl.innerHTML = `<p style="color:var(--text-light);">News article not found. <a href="/news.html">Return to News Hub →</a></p>`;
    }
    return;
  }

  // Populate UI fields
  const titleEl = document.getElementById('article-title');
  const tagEl = document.getElementById('article-tag-display');
  const emojiEl = document.getElementById('article-hero-emoji');
  const authorEl = document.getElementById('article-author');
  const readtimeEl = document.getElementById('article-readtime');
  const dateEl = document.getElementById('article-date');
  const updatedDateEl = document.getElementById('article-updated-date');
  const contentEl = document.getElementById('article-content-body');

  if (titleEl) {
    const formatIcon = matched.format === 'video' ? '🎥 ' : (matched.format === 'audio' ? '🎵 ' : '');
    titleEl.textContent = formatIcon + matched.title;
  }
  if (tagEl) tagEl.textContent = getCategoryLabel(matched.category);
  if (emojiEl) emojiEl.textContent = matched.emoji || '📰';
  if (authorEl) authorEl.textContent = matched.author;
  if (readtimeEl) readtimeEl.textContent = matched.readtime;
  
  const pubDate = matched.publishedAt ? formatDate(matched.publishedAt) : (matched.date || 'July 8, 2026');
  if (dateEl) dateEl.textContent = pubDate;
  if (updatedDateEl) updatedDateEl.textContent = pubDate;

  if (contentEl) contentEl.innerHTML = matched.content || `<p>${matched.excerpt}</p>`;

  // Render Cover Image (Google News Image SEO)
  const coverContainer = document.getElementById('news-cover-container');
  const coverImg = document.getElementById('news-cover-img');
  const matchedImg = matched.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
  if (coverContainer && coverImg) {
    coverImg.src = matchedImg;
    coverImg.alt = matched.title + ' — Bilaspur News Update';
    coverContainer.style.display = 'block';
  }

  // Update DOM Meta SEO tags
  document.getElementById('page-title').textContent = matched.title + ' | Bilaspur News';
  document.getElementById('page-desc').setAttribute('content', matched.excerpt);
  document.getElementById('og-title').setAttribute('content', matched.title);
  document.getElementById('og-desc').setAttribute('content', matched.excerpt);
  document.getElementById('og-url').setAttribute('content', window.location.href);
  if (matchedImg) {
    document.getElementById('og-image').setAttribute('content', matchedImg);
    document.getElementById('twitter-image').setAttribute('content', matchedImg);
    document.getElementById('og-img-width').setAttribute('content', '1200');
    document.getElementById('og-img-height').setAttribute('content', '675');
    const ext = matchedImg.split('.').pop().toLowerCase();
    const mime = ext === 'png' ? 'image/png' : (ext === 'webp' ? 'image/webp' : 'image/jpeg');
    document.getElementById('og-img-type').setAttribute('content', mime);
  }
  document.getElementById('twitter-title').setAttribute('content', matched.title);
  document.getElementById('twitter-desc').setAttribute('content', matched.excerpt);

  // Discover Publishing Transparency
  const pubTime = matched.publishedAt || new Date().toISOString();
  const modTime = matched.updatedAt || pubTime;
  document.getElementById('art-pub-time').setAttribute('content', pubTime);
  document.getElementById('art-mod-time').setAttribute('content', modTime);
  document.getElementById('art-section').setAttribute('content', getCategoryLabel(matched.category));

  // Dynamic tags injection for Discover UI card keywords
  document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
  const tagsList = Array.isArray(matched.tags) ? matched.tags : (matched.excerpt ? matched.excerpt.split(' ').slice(0, 3) : ['Bilaspur', 'News']);
  tagsList.forEach(t => {
    const cleaned = t.replace(/[^\w\s\u0900-\u097F]/gi, '').trim();
    if (cleaned) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'article:tag');
      meta.setAttribute('content', cleaned);
      document.head.appendChild(meta);
    }
  });

  // Set up WhatsApp Share Link
  const shareBtn = document.getElementById('whatsapp-share-btn');
  if (shareBtn) {
    const textMsg = `*Khabar Bilaspur Ki:* ${matched.title}\n\nRead full news article here:\n${window.location.href}`;
    shareBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
  }

  // Inject NewsArticle JSON-LD Structured Schema
  const schemaEl = document.getElementById('news-article-schema');
  if (schemaEl) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": matched.title,
      "description": matched.excerpt,
      "image": [
        matched.image || "https://developerbilaspur.in/logo.png"
      ],
      "datePublished": matched.publishedAt || "2026-07-08T10:00:00+05:30",
      "dateModified": matched.publishedAt || "2026-07-08T10:00:00+05:30",
      "author": {
        "@type": "Person",
        "name": matched.author || "Dev Bilaspur",
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
      "mainEntityOfPage": window.location.href
    };
    schemaEl.textContent = JSON.stringify(schema, null, 2);
  }
}

function setupReadingProgress() {
  window.addEventListener('scroll', () => {
    const bar = document.getElementById('reading-progress-bar');
    if (!bar) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = progress + '%';
  });
}
