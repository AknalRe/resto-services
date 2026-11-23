import { Link } from "react-router-dom";
import { ArrowRight, Building2, ExternalLink, Settings2, UtensilsCrossed } from "lucide-react";
import { withBasePath } from "../lib/basePath";
import type { AuthUser, Tenant } from "../types";

interface PlatformHomePageProps {
  restaurants: Tenant[];
  user: AuthUser | null;
}

export function PlatformHomePage({ restaurants, user }: PlatformHomePageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.9)", borderColor: "var(--border)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src={withBasePath("/logo.svg")} alt="Reneo Resto" width={34} height={34} className="rounded-lg" />
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                Reneo Resto
              </div>
              <div className="font-mono text-[11px]" style={{ color: "var(--ink-muted)" }}>
                resto.reneo.my.id
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === "superadmin" && (
              <Link
                to="/superadmin/restaurants"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold no-underline"
                style={{ borderColor: "var(--border)", color: "var(--ink)" }}
              >
                <Building2 size={14} strokeWidth={1.75} aria-hidden="true" />
                Portal Superadmin
              </Link>
            )}
            <Link
              to={user ? (user.role === "superadmin" ? "/superadmin/restaurants" : "/admin") : "/login"}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white no-underline"
              style={{ backgroundColor: "#0B2A57" }}
            >
              <Settings2 size={14} strokeWidth={1.75} aria-hidden="true" />
              {user ? "Buka Dashboard" : "Masuk Admin"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <section className="max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--resto-primary)" }}>
            Layanan Website Restoran Multi-Cabang
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
            Website Resmi, Buku Menu Online, dan Reservasi WhatsApp untuk Restoran Anda
          </h1>
          <p className="mt-3 text-sm leading-relaxed sm:text-base" style={{ color: "var(--ink-body)" }}>
            Kelola daftar menu, status ketersediaan hidangan, promo terjadwal, paket ruang acara, dan permintaan reservasi dari satu panel yang ringan di ponsel maupun desktop.
          </p>
        </section>

        <section className="mt-10 border-t pt-8" style={{ borderColor: "var(--border)" }}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold" style={{ color: "var(--ink)" }}>
              Restoran Aktif ({restaurants.length})
            </h2>
          </div>

          {restaurants.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}>
              Belum ada restoran yang terdaftar. Masuk ke Portal Superadmin untuk menambahkan restoran pertama.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((resto) => (
                <article
                  key={resto.id}
                  className="flex flex-col justify-between rounded-xl border p-5 transition-colors hover:border-stone-400"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: resto.primary_color || "#8B1E24" }}
                        >
                          <UtensilsCrossed size={16} strokeWidth={1.75} aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                            {resto.name}
                          </h3>
                          <p className="font-mono text-[11px]" style={{ color: "var(--ink-muted)" }}>
                            {resto.custom_domain || `${resto.slug}.resto.reneo.my.id`}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase" style={{ backgroundColor: "var(--surface-muted)", color: "var(--ink-body)" }}>
                        {resto.theme_preset}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--ink-body)" }}>
                      {resto.tagline || "Website restoran, buku menu online, dan reservasi meja."}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t pt-3.5 text-xs" style={{ borderColor: "var(--border)" }}>
                    <span className="font-mono text-[11px]" style={{ color: "var(--ink-muted)" }}>
                      {resto.branch_count ?? 0} cabang · {resto.menu_count ?? 0} menu
                    </span>
                    <Link
                      to={`/r/${resto.slug}`}
                      className="inline-flex items-center gap-1 font-semibold no-underline hover:underline"
                      style={{ color: resto.primary_color || "var(--resto-primary)" }}
                    >
                      Buka Website
                      <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t py-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-xs sm:px-6" style={{ color: "var(--ink-muted)" }}>
          <span>Reneo Resto Platform</span>
          <a href="https://reneo.my.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono hover:underline" style={{ color: "var(--ink-body)" }}>
            reneo.my.id
            <ExternalLink size={11} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
