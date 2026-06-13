import { Component, type ReactNode } from "react";

interface Props {
  /** 경계 이름 (탭 이름 등) */
  name: string;
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/** 탭 단위 에러 경계 — 한 탭이 죽어도 앱 전체가 죽지 않게 한다 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`[ErrorBoundary:${this.props.name}]`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-4xl" aria-hidden>
            😵
          </div>
          <p className="font-bold">‘{this.props.name}’ 화면에 문제가 생겼어요</p>
          <p className="text-sm text-sub">{this.state.error.message}</p>
          <button
            type="button"
            className="rounded-full bg-brand px-6 py-2.5 font-bold text-white"
            onClick={() => this.setState({ error: null })}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
