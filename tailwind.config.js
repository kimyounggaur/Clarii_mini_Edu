import path from "node:path";
import { fileURLToPath } from "node:url";

// content 경로를 절대 경로로 — cwd가 워크스페이스 루트여도(런처가 상위에서 vite를 기동) 항상 매칭되게
const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [path.join(here, "index.html"), path.join(here, "src/**/*.{ts,tsx}")],
  theme: {
    extend: {
      colors: {
        stage: "#F6F7F9",
        ink: "#1A1D21",
        sub: "#6B7280",
        brand: "#FF8A00",
        lefthand: "#FF8A00",
        righthand: "#2E5AAC",
        semitone: "#7C5CFF",
        octave: "#19B47D",
        success: "#19B47D",
        danger: "#E5484D",
        star: "#FFC53D",
        bodyline: "#C9CDD4",
        keyline: "#B8BDC6",
      },
      borderRadius: {
        card: "16px",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Pretendard Variable",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
