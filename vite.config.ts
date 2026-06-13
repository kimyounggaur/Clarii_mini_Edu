import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import os from "node:os";
import path from "node:path";

// 이 머신의 Node 25는 비ASCII(한글) 경로 대상 fs.rmSync(recursive)에서 크래시(0xC0000409)하므로
// 빌드 산출물은 ASCII 임시 경로에 만들고 dist로 복사한다 (빌드.cmd / README 참고).
const outDir =
  process.platform === "win32" && !process.env.VERCEL
    ? path.join(os.tmpdir(), "clarii-master-dist")
    : "dist";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "클라리 운지 마스터",
        short_name: "클라리 운지",
        description:
          "Robkoo Clarii mini(클라리 미니)의 색소폰 운지를 직관적으로 배우는 교육 웹앱",
        lang: "ko",
        theme_color: "#FF8A00",
        background_color: "#F6F7F9",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            // Pretendard CDN 폰트 오프라인 캐시
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "pretendard-cdn",
              expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: { outDir, emptyOutDir: true },
});
