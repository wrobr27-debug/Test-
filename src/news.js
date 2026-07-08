import { db } from './db-client.js';

document.addEventListener('DOMContentLoaded', () => {
  setupNewsSection();
});

const DEFAULT_NEWS = [
  {
    id: 'news-1',
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
  {
    id: 'news-2',
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
      <p>Store owner ne tech integration ka batate hue kaha: "Humne local customer orders automate karne ke liye hamara custom WhatsApp web dashboard setup karwaya hai. Customers dukaan par aane se pehle website link par designs browse karke static cart select kar sakte hain."</p>
      <h2>3. Opening Offer</h2>
      <p>Inaugural week me har designer saree purchase par free gold coin offer chal raha hai. Sadar Bazar, Link Road aur Vyapar Vihar se customers ka bhari crowd pahuch raha hai.</p>
    `
  },
  {
    id: 'news-3',
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
];

async function setupNewsSection() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  // Initialize fallback seed
  if (!localStorage.getItem('developer-bilaspur-news')) {
    localStorage.setItem('developer-bilaspur-news', JSON.stringify(DEFAULT_NEWS));
  }

  const allNews = await db.getNews();
  const categoryContainer = document.getElementById('news-categories');

  function getNormalizedCategory(n) {
    return n.category || 'local';
  }

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

  function renderNews(filter = 'all') {
    const publishedNews = allNews.filter(n => !n.status || n.status === 'published');
    const filtered = filter === 'all' 
      ? publishedNews 
      : publishedNews.filter(n => getNormalizedCategory(n) === filter);

    const featureContainer = document.getElementById('feature-news-container');
    if (featureContainer) {
      if (filter === 'all' && publishedNews.length > 0) {
        const topNews = publishedNews[0];
        const displayDate = topNews.publishedAt ? formatDate(topNews.publishedAt) : (topNews.date || 'July 8, 2026');
        featureContainer.style.display = 'block';
        featureContainer.innerHTML = `
          <div class="featured-news-card reveal active">
            <a class="featured-image-link" href="/news-detail.html?id=${topNews.id}">
              <img src="${topNews.image}" alt="${topNews.title}" />
            </a>
            <div class="featured-news-content">
              <div>
                <span class="blog-card-tag">★ Feature Story - ${getCategoryLabel(getNormalizedCategory(topNews))}</span>
                <h2 class="section-title"><a href="/news-detail.html?id=${topNews.id}">${topNews.title}</a></h2>
                <p class="featured-excerpt">${topNews.excerpt}</p>
              </div>
              <div class="blog-card-meta">
                <span class="meta-author">By ${topNews.author}</span>
                <span class="meta-dot">•</span>
                <span class="meta-time">${topNews.readtime}</span>
                <span class="meta-dot">•</span>
                <span class="meta-time" style="color: var(--color-accent); font-weight:600;">${displayDate}</span>
              </div>
            </div>
          </div>
        `;
      } else {
        featureContainer.style.display = 'none';
      }
    }

    const listNews = (filter === 'all' && publishedNews.length > 0) 
      ? filtered.slice(1) 
      : filtered;

    if (listNews.length === 0 && (!publishedNews.length || filter !== 'all')) {
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-gray);padding:48px 0;font-size:1rem;">No news articles found in this category.</p>`;
      return;
    }

    grid.innerHTML = listNews.map(item => {
      const catKey = getNormalizedCategory(item);
      return `
        <article class="blog-card reveal active" data-id="${item.id}">
          <a class="blog-card-image-link" href="/news-detail.html?id=${item.id}" aria-label="Read news article">
            <div class="blog-card-image">
              <img src="${item.image}" alt="${item.title}" loading="lazy" style="height: 200px; object-fit: cover;" />
            </div>
          </a>
          <div class="blog-card-content">
            <span class="blog-card-tag" style="background: rgba(72,184,152,0.08); color: #48b898;">${getCategoryLabel(catKey)}</span>
            <h3 class="blog-card-title"><a href="/news-detail.html?id=${item.id}">${item.title}</a></h3>
            <p class="blog-card-excerpt">${item.excerpt}</p>
            <div class="blog-card-meta">
              <span class="meta-author">By ${item.author}</span>
              <span class="meta-dot">•</span>
              <span class="meta-time">${item.readtime}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    setTimeout(() => {
      grid.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }, 50);
  }

  if (categoryContainer) {
    categoryContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;
      categoryContainer.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderNews(btn.dataset.category);
    });
  }

  renderNews('all');
}
