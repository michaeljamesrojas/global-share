import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/global-share/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Tempest Share - Global Clipboard',
        short_name: 'Tempest Share',
        description: 'Peer-to-peer file sharing app that works as your temporary global clipboard',
        theme_color: '#22d3ee',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/global-share/',
        start_url: '/global-share/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        // Cache PeerJS CDN resources
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/unpkg\.com\/peerjs/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'peerjs-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
