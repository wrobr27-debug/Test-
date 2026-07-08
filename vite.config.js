import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog.html'),
        detail: resolve(__dirname, 'blog-detail.html'),
        admin: resolve(__dirname, 'admin.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        terms: resolve(__dirname, 'terms.html'),
        disclaimer: resolve(__dirname, 'disclaimer.html'),
        dmca: resolve(__dirname, 'dmca.html'),
        error404: resolve(__dirname, '404.html'),
        demos: resolve(__dirname, 'demos.html'),
        news: resolve(__dirname, 'news.html'),
        newsDetail: resolve(__dirname, 'news-detail.html'),
        author: resolve(__dirname, 'author-dev-bilaspur.html')
      }
    }
  }
});
