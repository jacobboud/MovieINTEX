/// <reference types="node" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import csp from 'vite-plugin-csp';
import type { IncomingMessage, ServerResponse } from 'http';

export default defineConfig({
  plugins: [
    react(),
    csp({
      enabled: true,
      policy: {
        'default-src': ["self", "https://intex13-backend-fwh6gqfmegakgwaw.eastus-01.azurewebsites.net"],
        'connect-src': [
          "self",
          "https://intex13-backend-fwh6gqfmegakgwaw.eastus-01.azurewebsites.net",
          "https://www.google-analytics.com",
          "https://accounts.google.com",
          "https://oauth2.googleapis.com"
        ],
        'script-src': [
          "self",
          "unsafe-inline",
          "unsafe-eval",
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
          "https://intex13-backend-fwh6gqfmegakgwaw.eastus-01.azurewebsites.net",
          "https://www.google-analytics.com",
          "https://www.googletagmanager.com"
        ],
        'frame-src': ["https://accounts.google.com"],
        'frame-ancestors': ["self"]
      }
    }),
    {
      name: 'redirect-http-to-https',
      configureServer(server) {
        server.middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
          const proto =
            req.headers['x-forwarded-proto'] ||
            ((req.socket as any).encrypted ? 'https' : 'http');
          const host = req.headers.host || '';
          const url = req.url || '/';

          if (proto === 'http') {
            res.writeHead(301, {
              Location: `https://${host}${url}`,
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
    proxy: {
      '/Movie/': {
        target: 'https://intex13-backend-fwh6gqfmegakgwaw.eastus-01.azurewebsites.net',
        changeOrigin: true,
        secure: true
      }
    }
  }
  
});
