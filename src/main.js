import './style.css';
import { db } from './db-client.js';

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', async () => {
  applyGlobalSettings();
  setupParticleCanvas();
  setupScrollReveal();
  setupSmoothScrolling();
  await setupBlogSection();
  await setupDemosShowcase();
  await setupHomeNews();
});

/**
 * Apply global site settings saved from admin dashboard (localStorage).
 * Updates WhatsApp links, accent colors, and hero text dynamically.
 */
function applyGlobalSettings() {
  try {
    const raw = localStorage.getItem('devbilaspur-site-settings');
    if (!raw) return;
    const s = JSON.parse(raw);

    // Update WhatsApp links globally
    if (s.whatsapp) {
      document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        const url = new URL(link.href);
        link.href = `https://wa.me/${s.whatsapp}${url.search}`;
      });
    }

    // Update accent color via CSS custom property
    if (s.accentColor) {
      document.documentElement.style.setProperty('--color-accent', s.accentColor);
    }

    // Update hero title and subtitle (only on homepage)
    if (s.heroTitle) {
      const heroTitleEl = document.querySelector('.hero-title');
      if (heroTitleEl) heroTitleEl.textContent = s.heroTitle;
    }
    if (s.heroSubtitle) {
      const heroSubEl = document.querySelector('.hero-subtext');
      if (heroSubEl) heroSubEl.textContent = s.heroSubtitle;
    }
  } catch (e) {
    // Fail silently — default HTML values remain
  }
}

/**
 * High-End Minimalist Canvas Particle Wave (Google Antigravity style)
 * Features:
 * - Clean, defined concentric paths without chaotic noise/jitter
 * - Uniform, premium pill-shaped dashes aligned to curve tangents
 * - Airy, professional density and spacing
 * - Unified magnetic bending (flowing ribbons) reacting to mouse cursor
 */
function setupParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let time = 0;
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Mouse interaction state
  let mouseX = -1000;
  let mouseY = -1000;
  let targetMouseX = -1000;
  let targetMouseY = -1000;

  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  // Fade out mouse influence when cursor leaves window
  document.addEventListener('mouseleave', () => {
    targetMouseX = -1000;
    targetMouseY = -1000;
  });

  // Responsive canvas resizing
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Pause canvas update loop when scrolled past the viewport fold for performance
  let isAnimating = true;
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    isAnimating = scrollPos < height + 100;
  });

  // Generate clean, subtle Google Antigravity HSL colors
  function getAntigravityColor(metric, alpha) {
    let hue, saturation = 80, lightness = 60;
    
    if (metric < 0.2) {
      // Blue
      hue = 217 + (metric / 0.2) * 23; // 217 to 240
    } else if (metric < 0.45) {
      // Purple
      hue = 240 + ((metric - 0.2) / 0.25) * 55; // 240 to 295
    } else if (metric < 0.7) {
      // Pink / Red
      hue = 295 + ((metric - 0.45) / 0.25) * 65; // 295 to 360
    } else if (metric < 0.88) {
      // Orange
      hue = 0 + ((metric - 0.7) / 0.18) * 30; // 0 to 30
    } else {
      // Yellow
      hue = 30 + ((metric - 0.88) / 0.12) * 15; // 30 to 45
      lightness = 55; // Darken slightly for readability
    }
    
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  }

  // Layout parameters for clean, airy spacing (matching antigravity.google)
  const centerX = 0; // Origin bottom-left
  const centerY = height * 1.1;
  const maxRadius = Math.sqrt(width * width + height * height);
  const arcStep = 42; // Larger gap between concentric rings (extremely clean)
  const angleStepRatio = 2.2; // Lower density of dots along the curve (airy & premium)

  function draw() {
    if (!isAnimating) {
      animationFrameId = requestAnimationFrame(draw);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    time += 0.01;

    // Apply smooth liquid easing to mouse coordinate interpolation
    if (targetMouseX !== -1000) {
      if (mouseX === -1000) {
        mouseX = targetMouseX;
        mouseY = targetMouseY;
      } else {
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;
      }
    } else {
      if (mouseX !== -1000) {
        mouseX += (-1000 - mouseX) * 0.08;
        mouseY += (-1000 - mouseY) * 0.08;
        if (Math.abs(mouseX + 1000) < 1) {
          mouseX = -1000;
          mouseY = -1000;
        }
      }
    }

    // Draw concentric arcs of clean, structured particles
    for (let r = 80; r < maxRadius; r += arcStep) {
      const circumference = Math.PI * r * 0.55;
      const dotCount = Math.floor(circumference / (arcStep * angleStepRatio));
      
      for (let i = 0; i <= dotCount; i++) {
        // Base coordinate calculations along the curve (no random position jitter)
        const angle = (i / dotCount) * Math.PI * 0.62 - Math.PI * 0.06;
        
        // Gentle ripple wave
        const wave = Math.sin(r * 0.004 - time * 0.8) * 8;
        const currentR = r + wave;
        
        let x = centerX + Math.cos(angle) * currentR;
        let y = centerY - Math.sin(angle) * currentR;

        // Base angle of orientation tangent to the concentric curve path
        const baseAngle = angle + Math.PI / 2;
        let particleAngle = baseAngle;

        // Apply clean, collective magnetic warp (bends entire lanes in unison)
        if (mouseX !== -1000) {
          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const activeRadius = 280; // Sleek magnetic range

          if (dist < activeRadius) {
            const force = (activeRadius - dist) / activeRadius; // Linear scale
            const easeForce = Math.pow(force, 2); // Smooth ease transition
            
            // Displace coordinate in unison
            const shift = easeForce * 38;
            const angleToMouse = Math.atan2(mouseY - y, mouseX - x);
            
            x += Math.cos(angleToMouse) * shift;
            y += Math.sin(angleToMouse) * shift;

            // Interpolate rotation to follow the magnetic warp
            let diff = angleToMouse - baseAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            particleAngle = baseAngle + diff * easeForce * 0.75;
          }
        }

        // Clip off-screen particles
        if (x < -10 || x > width + 10 || y < -10 || y > height + 10) continue;

        // Calculate opacity gradient (subtle and background-safe)
        const ratio = r / maxRadius;
        const alpha = Math.max(0.04, 0.32 * (1 - ratio * 0.8));
        
        // Color mapping
        const color = getAntigravityColor(ratio * 0.75 + (angle / (Math.PI * 0.62)) * 0.25, alpha);

        // Draw elegant, uniform pill-shaped dashes
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(particleAngle);

        const length = 4.5 * (1 - ratio * 0.4);
        const thickness = 1.2 * (1 - ratio * 0.4);

        ctx.fillStyle = color;
        // Clean rounded rectangle/pill shape
        ctx.fillRect(-length / 2, -thickness / 2, length, thickness);

        ctx.restore();
      }
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  // Start animation loop
  draw();
}

/**
 * Scroll Reveal Animation using IntersectionObserver
 */
function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observerOptions = {
    root: null,
    rootMargin: '-50px 0px -50px 0px', // Trigger slightly inside the screen edges for premium feel
    threshold: 0.05
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        // Reset animation state when scrolled completely out of view (top or bottom)
        // so it plays again when scrolling back up or down
        const rect = entry.boundingClientRect;
        if (rect.top > window.innerHeight || rect.bottom < 0) {
          entry.target.classList.remove('active');
        }
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    observer.observe(el);
  });

  // Instantly trigger hero and header entrance animations on load
  setTimeout(() => {
    const heroReveals = document.querySelectorAll('#hero .reveal, #header.reveal');
    heroReveals.forEach(el => el.classList.add('active'));
  }, 100);
}

/**
 * Smooth scrolling for navigation links
 */
function setupSmoothScrolling() {
  const navLinks = document.querySelectorAll('.nav-link, .logo');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerHeight = document.querySelector('.main-header').offsetHeight || 72;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

/**
 * Premium Evergreen Blog Section & Client-Side Publisher (Backlinko Style)
 * - Initialises Quill.js WYSIWYG editor in the admin modal
 * - Routes card links to /blog-detail.html?id= for custom posts
 * - Saves full rich-HTML content to localStorage
 */
async function setupBlogSection() {
  const DEFAULT_GUIDES = [
    {
      id: 'default-1',
      title: 'Bilaspur Me Apne Local Business Ko Google Map Pe Top Kaise Layein?',
      category: 'seo',
      excerpt: 'Aasan guide jo aapko batayegi ki kaise 3 simple steps me Google My Business profile banakar map search me 1st rank laani hai.',
      author: 'Dev Bilaspur',
      readtime: '5 min read',
      emoji: '📈',
      isDefault: true,
      detailUrl: '/blog-detail.html'
    },
    {
      id: 'default-2',
      title: 'WhatsApp Auto-Reply Se Dukandaar Apni Sales Kaise Badha Sakte Hain?',
      category: 'whatsapp',
      excerpt: 'WhatsApp automation engine ke fayde aur use cases. Sikhein kaise chat-bot customer orders automatically process karta hai.',
      author: 'Dev Bilaspur',
      readtime: '4 min read',
      emoji: '💬',
      isDefault: true,
      detailUrl: '/blog-detail.html?id=default-2'
    },
    {
      id: 'default-3',
      title: 'Modern E-Commerce Website Ke Liye Best UX Principles [2026 Edition]',
      category: 'web',
      excerpt: 'Aapke online catalog ko conversion-optimized rakhne ke naye design rules jo checkout speed aur engagement ko 3x badha denge.',
      author: 'Dev Bilaspur',
      readtime: '7 min read',
      emoji: '🕸',
      isDefault: true,
      detailUrl: '/blog-detail.html?id=default-3'
    }
  ];

  function getNormalizedCategory(guide) {
    if (guide.category) return guide.guideCategory || guide.category;
    if (guide.categories && guide.categories.length) {
      const cat = guide.categories[0].toLowerCase();
      if (cat.includes('seo')) return 'seo';
      if (cat.includes('whatsapp') || cat.includes('auto')) return 'whatsapp';
      if (cat.includes('vyapar') || cat.includes('local')) return 'vyapar';
      if (cat.includes('web') || cat.includes('design')) return 'web';
      return cat;
    }
    return 'general';
  }

  function getCategoryName(cat) {
    switch (cat) {
      case 'seo': return 'SEO Tips';
      case 'whatsapp': return 'WhatsApp Auto';
      case 'vyapar': return 'Local Vyapar';
      case 'web': return 'Web Design';
      default: return 'General';
    }
  }

  function getCardHref(guide) {
    if (guide.isDefault && guide.detailUrl) return guide.detailUrl;
    return `/blog-detail.html?id=${guide.id}`;
  }

  function getCategoryImage(cat) {
    const map = {
      seo:       '/blog-seo.png',
      whatsapp:  '/blog-whatsapp.png',
      vyapar:    '/blog-vyapar.png',
      web:       '/blog-web.png',
    };
    return map[cat] || '/blog-web.png';
  }

  // Render guides grid dynamically
  async function renderGuides(categoryFilter = 'all') {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    const allGuides = await db.getBlogs();
    const publishedGuides = allGuides.filter(g => {
      const isPub = !g.status || g.status === 'published';
      const isPast = !g.publishedAt || new Date(g.publishedAt) <= new Date();
      return isPub && isPast;
    });

    const filtered = categoryFilter === 'all'
      ? publishedGuides
      : publishedGuides.filter(g => getNormalizedCategory(g) === categoryFilter);

    if (filtered.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-gray);padding:48px 0;font-size:1rem;">No guides found in this category.</p>`;
      return;
    }

    grid.innerHTML = filtered.map(guide => {
      const catKey = getNormalizedCategory(guide);
      const formatIcon = guide.format === 'video' ? '🎥 ' : (guide.format === 'audio' ? '🎵 ' : '');
      return `
        <article class="blog-card reveal" data-id="${guide.id}">
          ${!guide.isDefault ? `<button class="blog-card-delete-btn" title="Delete Post">&times;</button>` : ''}
          <a class="blog-card-image-link" href="${getCardHref(guide)}" aria-label="Read article">
            <div class="blog-card-image">
              <img src="${getCategoryImage(catKey)}" alt="${getCategoryName(catKey)}" loading="lazy" />
            </div>
          </a>
          <div class="blog-card-content">
            <span class="blog-card-tag">${getCategoryName(catKey)}</span>
            <h3 class="blog-card-title"><a href="${getCardHref(guide)}">${formatIcon}${guide.title}</a></h3>
            <p class="blog-card-excerpt">${guide.excerpt}</p>
            <div class="blog-card-meta">
              <span class="meta-author">By ${guide.author}</span>
              <span class="meta-dot">•</span>
              <span class="meta-time">${guide.readtime}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    setTimeout(() => {
      grid.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }, 50);
  }

  // Bind category filter tabs
  const categoryContainer = document.getElementById('blog-categories');
  if (categoryContainer) {
    categoryContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;
      categoryContainer.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGuides(btn.dataset.category);
    });
  }

  // Admin Modal
  const trigger = document.getElementById('manage-blogs-trigger');
  const overlay = document.getElementById('admin-modal-overlay');
  const closeBtn = document.getElementById('admin-close-btn');

  // Initialise Quill.js rich text editor
  let quillEditor = null;
  const editorWrapper = document.getElementById('post-editor-wrapper');
  if (editorWrapper && typeof Quill !== 'undefined') {
    quillEditor = new Quill('#post-editor-wrapper', {
      theme: 'snow',
      placeholder: 'Write your full blog article here. Use headings, bold, lists, links...',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link'],
          [{ color: [] }, { background: [] }],
          ['clean']
        ]
      }
    });
  }

  if (trigger && overlay && closeBtn) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.add('active');
    });
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  }

  // Publish form
  const form = document.getElementById('admin-publish-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title    = document.getElementById('post-title').value.trim();
      const category = document.getElementById('post-category').value;
      const readtime = document.getElementById('post-readtime').value.trim();
      const emoji    = document.getElementById('post-emoji').value.trim();
      const author   = document.getElementById('post-author').value.trim();
      const excerpt  = document.getElementById('post-excerpt').value.trim();
      const content  = quillEditor ? quillEditor.root.innerHTML : '';

      if (!title || !excerpt) return;

        const newPost = {
          id: 'custom-' + Date.now(),
          title, category, readtime,
          emoji: emoji || '📝',
          author: author || 'Dev Bilaspur',
          excerpt, content,
          isDefault: false,
          status: 'published',
          publishedAt: new Date().toISOString()
        };

        await db.saveBlog(newPost);

        form.reset();
        if (quillEditor) quillEditor.setText('');
        document.getElementById('post-author').value = 'Dev Bilaspur';
        if (overlay) overlay.classList.remove('active');

        if (categoryContainer) {
          categoryContainer.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
          const allBtn = categoryContainer.querySelector('[data-category="all"]');
          if (allBtn) allBtn.classList.add('active');
        }

        await renderGuides('all');
      });
    }

  // Delete handler
  const grid = document.getElementById('blog-grid');
  if (grid) {
    grid.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.blog-card-delete-btn');
      if (!deleteBtn) return;
      const card = deleteBtn.closest('.blog-card');
      const id = card.dataset.id;
      if (confirm('Delete this guide permanently?')) {
        await db.deleteBlog(id);
        let activeCat = 'all';
        if (categoryContainer) {
          const activeBtn = categoryContainer.querySelector('.category-btn.active');
          if (activeBtn) activeCat = activeBtn.dataset.category;
        }
        await renderGuides(activeCat);
      }
    });
  }

  // Newsletter
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for subscribing to Developer Bilaspur Blog updates!');
      newsletterForm.reset();
    });
  }

  await renderGuides('all');
}

/**
 * Dynamic Website Demos & Client Templates Portal
 */
async function setupDemosShowcase() {
  const DEFAULT_DEMOS = [
    {
      id: 'demo-saree',
      title: 'Chanderi Saree Store',
      desc: 'Premium ecommerce saree catalog with custom cart calculations, beautiful mockups, and automated WhatsApp orders.',
      url: '/index.html#showcase',
      category: 'ecommerce',
      emoji: '🛍️',
      priority: 1
    },
    {
      id: 'demo-kirana',
      title: 'Bilaspur Kirana Mart',
      desc: 'Digital grocery ordering list with search filters, quick add-to-cart, and WhatsApp shop delivery routing.',
      url: 'https://wa.me/918224005193?text=Hello!%20Mujhe%20Kirana%20website%20ka%20demo%20dekhna%20hai.',
      category: 'retail',
      emoji: '🏪',
      priority: 2
    },
    {
      id: 'demo-cafe',
      title: 'Sarkanda Sweets & Cafe',
      desc: 'Modern restaurant catalog menu with price lists, responsive categories (sweets, cakes, pizzas), and direct table booking.',
      url: 'https://wa.me/918224005193?text=Hello!%20Mujhe%20Cafe%20website%20ka%20demo%20dekhna%20hai.',
      category: 'food',
      emoji: '🍕',
      priority: 3
    },
    {
      id: 'demo-clinic',
      title: 'Sadar Bazar Dental Clinic',
      desc: 'Professional clinic landing page with doctor profile, service details, patient testimonials, and WhatsApp appointment scheduler.',
      url: 'https://wa.me/918224005193?text=Hello!%20Mujhe%20Clinic%20website%20ka%20demo%20dekhna%20hai.',
      category: 'services',
      emoji: '🩺',
      priority: 4
    }
  ];

  if (!localStorage.getItem('devbilaspur-demos')) {
    localStorage.setItem('devbilaspur-demos', JSON.stringify(DEFAULT_DEMOS));
  }

  function getCategoryLabel(cat) {
    switch (cat) {
      case 'ecommerce': return 'E-commerce';
      case 'retail': return 'Local Retail';
      case 'food': return 'Food & Dining';
      case 'services': return 'Professional Services';
      case 'medical': return 'Medical & Clinic';
      default: return 'Custom Design';
    }
  }

  function getDemoImage(d) {
    if (d.image) return d.image;
    const map = {
      'demo-saree':  '/demo-saree.png',
      'demo-kirana': '/demo-kirana.png',
      'demo-cafe':   '/demo-cafe.png',
      'demo-clinic': '/demo-clinic.png',
    };
    return map[d.id] || '/demo-saree.png';
  }

  function renderDemoCard(d) {
    const waUrl = `https://wa.me/918224005193?text=Hello!%20Mujhe%20aapka%20${encodeURIComponent(d.title)}%20website%20template%20pasand%20aaya%20hai.%20Mujhe%20apne%20business%20ke%20liye%20aisa%20hi%20setup%20chahiye.`;
    return `
      <article class="blog-card reveal">
        <div class="blog-card-image">
          <img src="${getDemoImage(d)}" alt="${d.title}" loading="lazy" />
        </div>
        <div class="blog-card-content">
          <span class="blog-card-tag">${getCategoryLabel(d.category)}</span>
          <h3 class="blog-card-title">${d.title}</h3>
          <p class="blog-card-excerpt">${d.desc}</p>
          <div class="demo-card-actions">
            <a href="${d.url}" target="_blank" rel="noopener" class="demo-link-preview">
              Live Preview &rarr;
            </a>
            <a href="${waUrl}" target="_blank" rel="noopener" class="demo-wa-pill">
              Order
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // 1. Homepage Rendering
  const homeGrid = document.getElementById('home-demos-grid');
  if (homeGrid) {
    const demos = await db.getDemos();
    demos.sort((a,b) => (parseInt(a.priority) || 10) - (parseInt(b.priority) || 10));
    const topDemos = demos.slice(0, 3);
    homeGrid.innerHTML = topDemos.map(d => renderDemoCard(d)).join('');
    setTimeout(() => {
      homeGrid.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }, 100);
  }

  // 2. Demos Page Rendering (demos.html)
  const mainGrid = document.getElementById('demos-grid');
  if (mainGrid) {
    async function renderMainDemos(categoryFilter = 'all', searchQuery = '') {
      let demos = await db.getDemos();
      demos.sort((a,b) => (parseInt(a.priority) || 10) - (parseInt(b.priority) || 10));

      if (categoryFilter !== 'all') {
        demos = demos.filter(d => d.category === categoryFilter);
      }
      if (searchQuery) {
        demos = demos.filter(d => (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (d.desc || '').toLowerCase().includes(searchQuery.toLowerCase()));
      }

      if (!demos.length) {
        mainGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-gray); padding: 48px 0; font-size: 1rem;">No matching website templates found.</p>`;
        return;
      }

      mainGrid.innerHTML = demos.map(d => renderDemoCard(d)).join('');
      setTimeout(() => {
        mainGrid.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
      }, 50);
    }

    const categoryTabs = document.getElementById('demos-categories');
    if (categoryTabs) {
      categoryTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (!btn) return;
        categoryTabs.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const searchInput = document.getElementById('demos-search');
        const q = searchInput ? searchInput.value.trim() : '';
        renderMainDemos(btn.dataset.category, q);
      });
    }

    const searchInput = document.getElementById('demos-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const activeTab = categoryTabs ? categoryTabs.querySelector('.category-btn.active') : null;
        const cat = activeTab ? activeTab.dataset.category : 'all';
        renderMainDemos(cat, searchInput.value.trim());
      });
    }

    renderMainDemos('all');
  }
}

/**
 * Dynamic
 * Home page News Section.
 */
async function setupHomeNews() {
  const grid = document.getElementById('home-news-grid');
  if (!grid) return;

  const DEFAULT_NEWS_SEED = [
    {
      id: 'news-1',
      title: 'Bilaspur Station Road Pe Naya Underpass Jaldi Hoga Shuru!',
      category: 'infrastructure',
      excerpt: 'Railway administration aur nagar nigam ka joint project. Sadar Bazar aur station side ke vyapariyon ko traffic se badi rahat.',
      author: 'Dev Bilaspur',
      readtime: '2 min read',
      emoji: '🚇',
      date: 'July 8, 2026',
      image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'news-2',
      title: 'Vyapar Vihar Me Chhattisgarh Ka Sabse Bada Saree Showroom Khula',
      category: 'business',
      excerpt: 'Premium Chanderi, Kanjeevaram aur designer collections ke sath naya fashion hub launch. Bilaspur me badhegi wedding shopping.',
      author: 'Dev Bilaspur',
      readtime: '3 min read',
      emoji: '🛍️',
      date: 'July 7, 2026',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'news-3',
      title: 'Arpa River Front Project: Bilaspur Me Naya Tourist Spot Taiyar',
      category: 'local',
      excerpt: 'Chowpatty style food courts, dynamic lighting aur morning walk tracks ke sath, Bilaspur ki naya shaan ban raha hai.',
      author: 'Dev Bilaspur',
      readtime: '3 min read',
      emoji: '🏞️',
      date: 'July 6, 2026',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800'
    }
  ];

  if (!localStorage.getItem('developer-bilaspur-news')) {
    localStorage.setItem('developer-bilaspur-news', JSON.stringify(DEFAULT_NEWS_SEED));
  }

  const allNews = await db.getNews();
  const publishedNews = allNews.filter(n => {
    const isPub = !n.status || n.status === 'published';
    const isPast = !n.publishedAt || new Date(n.publishedAt) <= new Date();
    return isPub && isPast;
  });
  const topThree = publishedNews.slice(0, 3);

  function getCategoryLabel(cat) {
    const map = {
      infrastructure: 'City Development',
      business: 'Store Openings',
      events: 'Events & Festivals',
      local: 'Local Buzz'
    };
    return map[cat] || 'General News';
  }

  if (topThree.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-gray);padding:24px 0;">No news articles available.</p>`;
    return;
  }

  grid.innerHTML = topThree.map(item => {
    const formatIcon = item.format === 'video' ? '🎥 ' : (item.format === 'audio' ? '🎵 ' : '');
    const imgUrl = item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
    return `
      <article class="blog-card reveal">
        <a class="blog-card-image-link" href="/news-detail.html?id=${item.id}" aria-label="Read news article">
          <div class="blog-card-image">
            <img src="${imgUrl}" alt="${item.title}" loading="lazy" style="height: 200px; object-fit: cover;" />
          </div>
        </a>
        <div class="blog-card-content">
          <span class="blog-card-tag" style="background: rgba(72,184,152,0.08); color: #48b898;">${getCategoryLabel(item.category)}</span>
          <h3 class="blog-card-title"><a href="/news-detail.html?id=${item.id}">${formatIcon}${item.title}</a></h3>
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
  }, 100);
}
