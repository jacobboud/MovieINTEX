import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import csp from 'vite-plugin-csp';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    csp({
      enabled: true,
      policy: {
        'default-src': ["self", "https://localhost:5000"],
        'connect-src': [
          "self",
          "https://localhost:5000",
          "https://www.google-analytics.com",
          "https://accounts.google.com",
          "https://oauth2.googleapis.com"
        ],
        'script-src': [
          "self",
          "unsafe-inline",
          "unsafe-eval",
          "https://localhost:5000",
          "https://accounts.google.com",
          "https://www.google-analytics.com",
          "https://www.googletagmanager.com"
        ],
        'style-src': [
          "self",
          "unsafe-inline",
          "https://fonts.googleapis.com",
          "https://use.fontawesome.com"
        ],
        'font-src': [
          "self",
          "https://fonts.gstatic.com",
          "https://use.fontawesome.com"
        ],
        'img-src': [
          "self",
          "data:",
          "https://localhost:5000",
          "https://www.google-analytics.com",
          "https://www.googletagmanager.com"
        ],
        'frame-src': [
          "https://accounts.google.com"
        ],
        'frame-ancestors': ["self"]
      }
    }),
    // ✅ Custom plugin to add middleware for HTTP → HTTPS redirect
    {
      name: 'redirect-http-to-https',
      configureServer(server) {
        server.middlewares.use((req: any, res: any, next) => {
          const host = req.headers.host || '';
          const proto = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
    
          if (proto === 'http') {
            res.writeHead(301, {
              Location: `https://${host}${req.url}`,
            });
            res.end();
          } else {
            next();
          }
        });
      },
    }
  ],
  server: {
    port: 3000,
    https: true,
    proxy: {
      '/Movie/': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
