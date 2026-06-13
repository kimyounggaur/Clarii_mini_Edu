/**
 * localStorage 접근 통일 유틸.
 * 시크릿 모드·일부 브라우저에서 localStorage가 예외를 던지면 메모리 폴백으로 동작한다.
 */
const memory = new Map<string, string>();

function storageAvailable(): boolean {
  try {
    const t = "__clarii_probe__";
    window.localStorage.setItem(t, "1");
    window.localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

const usable = typeof window !== "undefined" && storageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    if (usable) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        /* fallthrough */
      }
    }
    return memory.has(key) ? memory.get(key)! : null;
  },
  setItem(key: string, value: string): void {
    if (usable) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        /* fallthrough */
      }
    }
    memory.set(key, value);
  },
  removeItem(key: string): void {
    if (usable) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {
        /* fallthrough */
      }
    }
    memory.delete(key);
  },
};
