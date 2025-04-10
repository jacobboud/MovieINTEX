import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// vite.config.ts or vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    headers: {
      'Content-Security-Policy': [
        // Only allow scripts and content from your own origin and API backend
        "default-src 'self' https://localhost:5000",
        // Only allow inline styles for now if needed (consider removing 'unsafe-inline' later)
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.fontawesome.com",
        // Only load scripts from your dev server and backend
        "script-src 'self' 'unsafe-inline' https://localhost:5000",
        // Allow fonts from Google and Font Awesome
        "font-src 'self' https://fonts.gstatic.com https://use.fontawesome.com",
        // Allow images from backend and data URIs (like base64 icons)
        "img-src 'self' data: https://localhost:5000",
        // Prevent your site from being embedded in other pages
        "frame-ancestors 'none'",
      ].join('; '),
    },
    proxy: {
      '/Movie/': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
