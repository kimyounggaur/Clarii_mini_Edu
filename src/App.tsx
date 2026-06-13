import { useAppStore, type TabId } from "./store/useAppStore";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toast } from "./components/Toast";
import { ExplorerView } from "./views/ExplorerView";
import { LearnView } from "./views/LearnView";
import { PracticeView } from "./views/PracticeView";
import { SettingsView } from "./views/SettingsView";
import { FINGERING_ERRORS } from "./main";

const TABS: { id: TabId; emoji: string; label: string }[] = [
  { id: "explorer", emoji: "🎵", label: "운지표" },
  { id: "learn", emoji: "📚", label: "배우기" },
  { id: "practice", emoji: "🎮", label: "연습" },
  { id: "settings", emoji: "⚙️", label: "설정" },
];

export default function App() {
  const tab = useAppStore((s) => s.tab);
  const setTab = useAppStore((s) => s.setTab);

  return (
    <div className="app-shell mx-auto flex max-w-[1100px] flex-col">
      {FINGERING_ERRORS.length > 0 && (
        <div
          role="alert"
          className="bg-danger px-4 py-2 text-center text-xs font-bold text-white"
        >
          ⚠️ 개발용 경고: 운지 데이터 검증 실패 {FINGERING_ERRORS.length}건 — 콘솔을 확인하세요
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto" id="main">
        {tab === "explorer" && (
          <ErrorBoundary name="운지표">
            <ExplorerView />
          </ErrorBoundary>
        )}
        {tab === "learn" && (
          <ErrorBoundary name="배우기">
            <LearnView />
          </ErrorBoundary>
        )}
        {tab === "practice" && (
          <ErrorBoundary name="연습">
            <PracticeView />
          </ErrorBoundary>
        )}
        {tab === "settings" && (
          <ErrorBoundary name="설정">
            <SettingsView />
          </ErrorBoundary>
        )}
      </main>

      <nav
        aria-label="주 메뉴"
        className="z-40 flex shrink-0 border-t border-bodyline/60 bg-white pb-[env(safe-area-inset-bottom)]"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-label={t.label}
              aria-current={active ? "page" : undefined}
              onClick={() => setTab(t.id)}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors ${
                active ? "text-brand" : "text-sub"
              }`}
            >
              <span className="text-xl leading-none" aria-hidden>
                {t.emoji}
              </span>
              {t.label}
            </button>
          );
        })}
      </nav>

      <Toast />
    </div>
  );
}
