// Database Client Wrapper (Supabase REST vs LocalStorage Fallback)

const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cfafqmzyovtuyvffwthx.supabase.co';
const DEFAULT_SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYWZxbXp5b3Z0dXl2ZmZ3dGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTg1MTUsImV4cCI6MjA5OTA3NDUxNX0.s43AkykRS69P7I_FR5jL1dNJI8ecArHOroHAuxXzdZQ';

export function useSupabase() {
  const url = localStorage.getItem('supabase_url');
  if (url === 'none') return false;
  return true;
}

export async function refreshSupabaseSession() {
  const url = localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem('supabase_key') || DEFAULT_SUPABASE_KEY;
  const refreshToken = localStorage.getItem('supabase_refresh_token');

  if (!refreshToken) return null;

  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem('supabase_session_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('supabase_refresh_token', data.refresh_token);
        }
        return data.access_token;
      }
    }
  } catch (err) {
    console.error('Failed to refresh Supabase session token:', err);
  }

  // If refresh failed, clear stale expired session/refresh tokens
  localStorage.removeItem('supabase_session_token');
  localStorage.removeItem('supabase_refresh_token');
  return null;
}

async function fetchSupabase(table, options = {}) {
  const url = localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem('supabase_key') || DEFAULT_SUPABASE_KEY;
  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/${table}${options.query || ''}`;

  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(endpoint, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Supabase API error (${table}): ${response.status} - ${errText}`);
  }

  // Delete, Update, and Insert return data representation if preferred
  if (options.method === 'DELETE') return true;

  const data = await response.json();
  return data;
}

export const db = {
  // --- GUIDES/BLOGS SECTION ---
  async getBlogs() {
    if (!useSupabase()) {
      const list = JSON.parse(localStorage.getItem('developer-bilaspur-blogs') || '[]');
      return list.map(b => ({ ...b, status: b.status || 'published' }));
    }
    try {
      const data = await fetchSupabase('db_blogs');
      if (data && data.length > 0) {
        return data.map(b => ({
          ...b,
          publishedAt: b.published_at || b.publishedAt || null,
          updatedAt: b.updated_at || b.updatedAt || null,
          allowComments: b.allowComments !== false,
          allowPings: b.allowPings !== false
        }));
      }
      const list = JSON.parse(localStorage.getItem('developer-bilaspur-blogs') || '[]');
      return list.map(b => ({ ...b, status: b.status || 'published' }));
    } catch (err) {
      console.error('Supabase getBlogs failed, loading fallback local storage:', err);
      const list = JSON.parse(localStorage.getItem('developer-bilaspur-blogs') || '[]');
      return list.map(b => ({ ...b, status: b.status || 'published' }));
    }
  },

  async saveBlog(postData) {
    if (!useSupabase()) {
      let blogs = JSON.parse(localStorage.getItem('developer-bilaspur-blogs') || '[]');
      const existIdx = blogs.findIndex(b => b.id === postData.id);
      if (existIdx >= 0) {
        blogs[existIdx] = postData;
      } else {
        blogs.unshift(postData);
      }
      localStorage.setItem('developer-bilaspur-blogs', JSON.stringify(blogs));
      return postData;
    }

    const pgData = {
      id: postData.id,
      title: postData.title,
      slug: postData.slug,
      content: postData.content,
      excerpt: postData.excerpt,
      author: postData.author,
      status: postData.status,
      visibility: postData.visibility,
      format: postData.format,
      categories: postData.categories || [],
      tags: postData.tags || [],
      readtime: postData.readtime,
      emoji: postData.emoji,
      featuredImage: postData.featuredImage,
      image: postData.image,
      published_at: postData.publishedAt,
      updated_at: postData.updatedAt,
      sticky: postData.sticky,
      focusKeyword: postData.focusKeyword,
      metaTitle: postData.metaTitle,
      metaDesc: postData.metaDesc,
      allowComments: postData.allowComments !== false,
      allowPings: postData.allowPings !== false
    };

    try {
      const exist = await fetchSupabase('db_blogs', { query: `?id=eq.${postData.id}` });
      if (exist && exist.length > 0) {
        await fetchSupabase('db_blogs', {
          method: 'PATCH',
          query: `?id=eq.${postData.id}`,
          body: pgData
        });
      } else {
        await fetchSupabase('db_blogs', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: pgData
        });
      }
      return postData;
    } catch (err) {
      console.error('Supabase saveBlog failed:', err);
      throw err;
    }
  },

  async deleteBlog(id) {
    if (!useSupabase()) {
      let blogs = JSON.parse(localStorage.getItem('developer-bilaspur-blogs') || '[]');
      blogs = blogs.filter(b => b.id !== id);
      localStorage.setItem('developer-bilaspur-blogs', JSON.stringify(blogs));
      return true;
    }
    return fetchSupabase('db_blogs', {
      method: 'DELETE',
      query: `?id=eq.${id}`
    });
  },

  // --- NEWS SECTION ---
  async getNews() {
    if (!useSupabase()) {
      const list = JSON.parse(localStorage.getItem('developer-bilaspur-news') || '[]');
      return list.map(n => ({ ...n, status: n.status || 'published' }));
    }
    try {
      const data = await fetchSupabase('db_news');
      if (data && data.length > 0) {
        return data.map(n => ({
          ...n,
          publishedAt: n.published_at || n.publishedAt || null,
          updatedAt: n.updated_at || n.updatedAt || null,
          allowComments: n.allowComments !== false,
          allowPings: n.allowPings !== false
        }));
      }
      const list = JSON.parse(localStorage.getItem('developer-bilaspur-news') || '[]');
      return list.map(n => ({ ...n, status: n.status || 'published' }));
    } catch (err) {
      console.error('Supabase getNews failed, loading fallback local storage:', err);
      const list = JSON.parse(localStorage.getItem('developer-bilaspur-news') || '[]');
      return list.map(n => ({ ...n, status: n.status || 'published' }));
    }
  },

  async saveNews(postData) {
    if (!useSupabase()) {
      let news = JSON.parse(localStorage.getItem('developer-bilaspur-news') || '[]');
      const existIdx = news.findIndex(n => n.id === postData.id);
      if (existIdx >= 0) {
        news[existIdx] = postData;
      } else {
        news.unshift(postData);
      }
      localStorage.setItem('developer-bilaspur-news', JSON.stringify(news));
      return postData;
    }

    const pgData = {
      id: postData.id,
      title: postData.title,
      slug: postData.slug,
      content: postData.content,
      excerpt: postData.excerpt,
      author: postData.author,
      status: postData.status,
      visibility: postData.visibility,
      format: postData.format,
      category: postData.category || postData.categories?.[0] || 'local',
      readtime: postData.readtime,
      emoji: postData.emoji,
      featuredImage: postData.featuredImage,
      image: postData.image,
      published_at: postData.publishedAt,
      updated_at: postData.updatedAt,
      sticky: postData.sticky,
      focusKeyword: postData.focusKeyword,
      metaTitle: postData.metaTitle,
      metaDesc: postData.metaDesc,
      allowComments: postData.allowComments !== false,
      allowPings: postData.allowPings !== false
    };

    try {
      const exist = await fetchSupabase('db_news', { query: `?id=eq.${postData.id}` });
      if (exist && exist.length > 0) {
        await fetchSupabase('db_news', {
          method: 'PATCH',
          query: `?id=eq.${postData.id}`,
          body: pgData
        });
      } else {
        await fetchSupabase('db_news', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: pgData
        });
      }
      return postData;
    } catch (err) {
      console.error('Supabase saveNews failed:', err);
      throw err;
    }
  },

  async deleteNews(id) {
    if (!useSupabase()) {
      let news = JSON.parse(localStorage.getItem('developer-bilaspur-news') || '[]');
      news = news.filter(n => n.id !== id);
      localStorage.setItem('developer-bilaspur-news', JSON.stringify(news));
      return true;
    }
    return fetchSupabase('db_news', {
      method: 'DELETE',
      query: `?id=eq.${id}`
    });
  },

  // --- DEMOS SECTION ---
  async getDemos() {
    if (!useSupabase()) {
      return JSON.parse(localStorage.getItem('devbilaspur-demos') || '[]');
    }
    try {
      const data = await fetchSupabase('db_demos');
      if (data && data.length > 0) {
        // Map postgres column 'desc_text' back to client property 'desc'
        return data.map(d => ({
          id: d.id,
          title: d.title,
          desc: d.desc_text,
          url: d.url,
          category: d.category,
          emoji: d.emoji,
          image: d.image,
          priority: d.priority
        }));
      }
      return JSON.parse(localStorage.getItem('devbilaspur-demos') || '[]');
    } catch (err) {
      console.error('Supabase getDemos failed, loading fallback local storage:', err);
      return JSON.parse(localStorage.getItem('devbilaspur-demos') || '[]');
    }
  },

  async saveDemo(demoData) {
    const pgData = {
      id: demoData.id,
      title: demoData.title,
      desc_text: demoData.desc,
      url: demoData.url,
      category: demoData.category,
      emoji: demoData.emoji,
      image: demoData.image,
      priority: demoData.priority
    };

    if (!useSupabase()) {
      let demos = JSON.parse(localStorage.getItem('devbilaspur-demos') || '[]');
      const existIdx = demos.findIndex(d => d.id === demoData.id);
      if (existIdx >= 0) {
        demos[existIdx] = demoData;
      } else {
        demos.push(demoData);
      }
      localStorage.setItem('devbilaspur-demos', JSON.stringify(demos));
      return demoData;
    }

    try {
      const exist = await fetchSupabase('db_demos', { query: `?id=eq.${demoData.id}` });
      if (exist && exist.length > 0) {
        await fetchSupabase('db_demos', {
          method: 'PATCH',
          query: `?id=eq.${demoData.id}`,
          body: pgData
        });
      } else {
        await fetchSupabase('db_demos', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: pgData
        });
      }
      return demoData;
    } catch (err) {
      console.error('Supabase saveDemo failed:', err);
      throw err;
    }
  },

  async deleteDemo(id) {
    if (!useSupabase()) {
      let demos = JSON.parse(localStorage.getItem('devbilaspur-demos') || '[]');
      demos = demos.filter(d => d.id !== id);
      localStorage.setItem('devbilaspur-demos', JSON.stringify(demos));
      return true;
    }
    return fetchSupabase('db_demos', {
      method: 'DELETE',
      query: `?id=eq.${id}`
    });
  }
};
