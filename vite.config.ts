import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'robots.txt', 'sitemap.xml'],
        manifest: {
          id: '/',
          name: 'ÖzTike Ciğer – Restaurant OS',
          short_name: 'ÖzTike OS',
          description: 'ÖzTike Ciğer tam kapsamlı restoran otomasyon, POS, KDS, QR menü ve yönetim sistemi.',
          theme_color: '#141413',
          background_color: '#141413',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          lang: 'tr',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
          // Hostinger / cPanel one-folder deployment bundle
          const hostingerCopies: Array<[string, string]> = [
            ['.htaccess', '.htaccess'],
            ['database/schema.sql', 'database/schema.sql'],
            ['config/database.php', 'config/database.php'],
          ];
          for (const [srcRel, dstRel] of hostingerCopies) {
            const srcPath = path.resolve(__dirname, srcRel);
            const dstPath = path.resolve(distDir, dstRel);
            if (fs.existsSync(distDir) && fs.existsSync(srcPath)) {
              fs.mkdirSync(path.dirname(dstPath), { recursive: true });
              fs.cpSync(srcPath, dstPath, { force: true });
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
