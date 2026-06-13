// PWA 아이콘 생성 — 클라리 실루엣을 RGBA 버퍼에 그려 PNG로 인코딩 (외부 의존성 없음)
// 사용: node scripts/gen-icons.mjs  → public/icon-*.png, apple-touch-icon.png
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public");
mkdirSync(outDir, { recursive: true });

/* ---------- PNG 인코더 ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(rgba, w, h) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- 그리기 ---------- */
const C = {
  brand: [255, 138, 0, 255],
  white: [255, 255, 255, 255],
  bodyEdge: [201, 205, 212, 255],
  left: [255, 138, 0, 255],
  right: [46, 90, 172, 255],
  star: [255, 197, 61, 255],
  green: [25, 180, 125, 255],
};

function inRounded(px, py, x0, y0, x1, y1, r) {
  if (px < x0 || px > x1 || py < y0 || py > y1) return false;
  const cx = Math.max(x0 + r, Math.min(px, x1 - r));
  const cy = Math.max(y0 + r, Math.min(py, y1 - r));
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r || (px >= x0 + r && px <= x1 - r) || (py >= y0 + r && py <= y1 - r)
    ? (px - cx) ** 2 + (py - cy) ** 2 <= r * r
    : false;
}

function drawIcon(size, { maskable = false } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const put = (x, y, [r, g, b, a]) => {
    const i = (y * size + x) * 4;
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = a;
  };
  const S = (v) => v * size;
  const bgR = maskable ? 0 : S(0.2);
  // 본체 캡슐
  const bx0 = S(0.36), bx1 = S(0.64), by0 = S(0.12), by1 = S(0.88), br = S(0.14);
  // 키 7개
  const keyR = S(0.036);
  const keys = [
    [0.5, 0.235, C.left], [0.5, 0.315, C.left], [0.5, 0.395, C.left],
    [0.5, 0.49, C.right], [0.5, 0.57, C.right], [0.5, 0.65, C.right], [0.5, 0.73, C.right],
  ];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // 배경 (라운드 사각, maskable은 풀블리드)
      if (!maskable && !inRounded(x, y, 0, 0, size - 1, size - 1, bgR)) {
        put(x, y, [0, 0, 0, 0]);
        continue;
      }
      let color = C.brand;
      if (inRounded(x, y, bx0, by0, bx1, by1, br)) {
        color = C.white;
        // 테두리
        if (!inRounded(x, y, bx0 + S(0.012), by0 + S(0.012), bx1 - S(0.012), by1 - S(0.012), br - S(0.012))) {
          color = C.bodyEdge;
        }
        for (const [kx, ky, kc] of keys) {
          const dx = x - S(kx);
          const dy = y - S(ky);
          if (dx * dx + dy * dy <= keyR * keyR) {
            color = kc;
            break;
          }
        }
        // RGB 링 느낌의 밴드
        if (y >= S(0.8) && y <= S(0.825) && x >= bx0 + S(0.05) && x <= bx1 - S(0.05)) color = C.star;
      }
      put(x, y, color);
    }
  }
  return encodePng(buf, size, size);
}

writeFileSync(path.join(outDir, "icon-512.png"), drawIcon(512));
writeFileSync(path.join(outDir, "icon-192.png"), drawIcon(192));
writeFileSync(path.join(outDir, "icon-512-maskable.png"), drawIcon(512, { maskable: true }));
writeFileSync(path.join(outDir, "apple-touch-icon.png"), drawIcon(180, { maskable: true }));
console.log("icons written to public/ (512, 192, 512-maskable, apple-touch 180)");
