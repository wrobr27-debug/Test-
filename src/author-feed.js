// Author Feed Generator
document.addEventListener('DOMContentLoaded', () => {
  renderAuthorFeed();
});

function renderAuthorFeed() {
  const grid = document.getElementById('author-posts-grid');
  if (!grid) return;

  const blogs = JSON.parse(localStorage.getItem('developer-bilaspur-blogs') || '[]');
  const news = JSON.parse(localStorage.getItem('developer-bilaspur-news') || '[]');
  
  // Unify and sort by publish date
  const combined = [...blogs, ...news]
    .filter(p => !p.status || p.status === 'published')
    .sort((a, b) => new Date(b.publishedAt || b.date) - new Date(a.publishedAt || a.date));

  if (combined.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-gray); padding: 48px 0;">No articles published yet.</p>`;
    return;
  }

  function getCardHref(item) {
    const isNews = item.id.startsWith('news-') || item.post_type === 'news';
    if (isNews) return `/news-detail.html?id=${item.id}`;
    if (item.isDefault && item.detailUrl) return item.detailUrl;
    return `/blog-detail.html?id=${item.id}`;
  }

  function getCategoryLabel(item) {
    const isNews = item.id.startsWith('news-') || item.post_type === 'news';
    if (isNews) {
      const map = {
        infrastructure: 'City Development',
        business: 'Store Openings',
        events: 'Events & Festivals',
        local: 'Local Buzz'
      };
      return map[item.category] || 'General News';
    } else {
      const map = {
        seo: 'SEO Tips',
        whatsapp: 'WhatsApp Auto',
        vyapar: 'Local Vyapar',
        web: 'Web Design'
      };
      return map[item.category] || 'General Guide';
    }
  }

  function getCardImage(item) {
    if (item.image) return item.image;
    if (item.featuredImage) return item.featuredImage;
    
    // Default categorised graphics
    const isNews = item.id.startsWith('news-') || item.post_type === 'news';
    if (isNews) return 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800';
    
    const cat = item.category || 'web';
    const map = {
      seo:       '/blog-seo.png',
      whatsapp:  '/blog-whatsapp.png',
      vyapar:    '/blog-vyapar.png',
      web:       '/blog-web.png',
    };
    return map[cat] || '/blog-web.png';
  }

  grid.innerHTML = combined.map(item => `
    <article class="blog-card reveal active">
      <a class="blog-card-image-link" href="${getCardHref(item)}" aria-label="Read article">
        <div class="blog-card-image">
          <img src="${getCardImage(item)}" alt="${item.title}" loading="lazy" style="height:200px; object-fit:cover;" />
        </div>
      </a>
      <div class="blog-card-content">
        <span class="blog-card-tag" style="background: rgba(72,184,152,0.08); color: #48b898;">${getCategoryLabel(item)}</span>
        <h3 class="blog-card-title"><a href="${getCardHref(item)}">${item.title}</a></h3>
        <p class="blog-card-excerpt">${item.excerpt}</p>
        <div class="blog-card-meta">
          <span class="meta-author">By ${item.author || 'Dev Bilaspur'}</span>
          <span class="meta-dot">•</span>
          <span class="meta-time">${item.readtime || '3 min read'}</span>
        </div>
      </div>
    </article>
  `).join('');

  setTimeout(() => {
    grid.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
  }, 100);
}
