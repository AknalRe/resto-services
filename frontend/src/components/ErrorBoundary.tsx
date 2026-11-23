import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || "Terjadi kesalahan saat menampilkan halaman." };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Handled via fallback UI
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-3xl font-bold text-stone-900">Halaman Gagal Dimuat</h1>
          <p className="mt-2 text-sm text-stone-600">{this.state.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#0B2A57] px-5 text-xs font-semibold text-white"
          >
            Muat Ulang Halaman
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
