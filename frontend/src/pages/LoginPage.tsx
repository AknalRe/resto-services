import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { api } from "../lib/api";
import { withBasePath } from "../lib/basePath";
import type { AuthUser } from "../types";

interface LoginPageProps {
  onSuccess: (user: AuthUser) => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("admin@reneo.my.id");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.login(email.trim(), password);
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk ke sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold no-underline hover:underline" style={{ color: "var(--ink-body)" }}>
          <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
          Kembali ke Beranda
        </Link>
        <img src={withBasePath("/logo.svg")} alt="Reneo Resto" width={30} height={30} className="rounded-lg" />
      </div>

      <div className="rounded-xl border p-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--surface-muted)", color: "var(--ink)" }}>
            <Lock size={16} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-bold" style={{ color: "var(--ink)" }}>
              Masuk Dashboard Reneo Resto
            </h1>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
              Gunakan akun Admin Restoran atau Superadmin Reneo.
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border px-3 py-2 text-xs font-medium" style={{ backgroundColor: "var(--danger-bg)", borderColor: "var(--danger)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
          <div>
            <label htmlFor="resto-email" className="mb-1 block text-xs font-semibold" style={{ color: "var(--ink-body)" }}>
              Email
            </label>
            <input
              id="resto-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="resto-field h-10 w-full px-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="resto-pass" className="mb-1 block text-xs font-semibold" style={{ color: "var(--ink-body)" }}>
              Kata Sandi
            </label>
            <input
              id="resto-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="resto-field h-10 w-full px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="h-10 w-full rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--resto-primary)" }}
          >
            {submitting ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
