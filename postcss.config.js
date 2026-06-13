import path from "node:path";
import { fileURLToPath } from "node:url";

// cwd가 어디든(워크스페이스 루트에서 vite를 기동해도) tailwind 설정을 확실히 찾도록 절대 경로 지정
const here = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    tailwindcss: { config: path.join(here, "tailwind.config.js") },
    autoprefixer: {},
  },
};
