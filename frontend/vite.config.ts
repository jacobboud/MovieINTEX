import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
    // headers: {
    //   'Content-Security-Policy': 
    //     "default-src 'self' https://localhost:5000; " +
    //     "font-src 'self' https://fonts.gstatic.com https://use.fontawesome.com; " +
    //     "script-src 'self' 'unsafe-inline' https://localhost:5000; " +
    //     "img-src 'self' data: https://localhost:5000; " +
    //     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.fontawesome.com; " +
    //     "frame-ancestors 'none';"
    // },
  },
});
