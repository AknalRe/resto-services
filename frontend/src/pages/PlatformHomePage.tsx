import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarCheck2,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Settings2,
  UtensilsCrossed,
} from "lucide-react";
import { resolveAssetUrl } from "../lib/api";
import { withBasePath } from "../lib/basePath";
import type { AuthUser, Tenant } from "../types";

interface PlatformHomePageProps {
  restaurants: Tenant[];
  user: AuthUser | null;
}

const CAPABILITIES = [
  {
    icon: BookOpen,
    title: "Buku Menu Online Selalu Terkini",
    desc: "Perbarui harga, foto hidangan, dan status stok habis langsung dari ponsel tanpa cetak ulang daftar menu.",
  },
  {
    icon: CalendarCheck2,
    title: "Reservasi Meja & Acara ke WhatsApp",
    desc: "Setiap permintaan reservasi tersimpan rapi di buku tamu cabang dan otomatis membuka pesan WhatsApp terformat.",
  },
  {
    icon: Layers,
    title: "Tiga Pilihan Tema dari Panel Admin",
    desc: "Pemilik restoran menentukan sendiri tampilan website (Heritage, Bistro, atau Cafe) beserta warna utama dan logo.",
  },
  {
    icon: ImageIcon,
    title: "Ganti Foto & Promo Kapan Saja",
    desc: "Unggah banner utama, foto makanan, promo musiman, dan ruang privat VIP tanpa perlu bantuan teknisi.",
  },
];

export function PlatformHomePage({ restaurants, user }: PlatformHomePageProps) {
  const demoResto = restaurants[0];

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      {/* Clean sticky platform header */}
      <header className="sticky top-0 z-20 border-b backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.92)", borderColor: "var(--border)" }}>
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

          <nav aria-label="Navigasi utama" className="flex items-center gap-2">
            {demoResto && (
              <Link
                to={`/r/${demoResto.slug}`}
                className="hidden h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold no-underline transition-colors hover:bg-stone-100 sm:inline-flex"
                style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
              >
                Lihat Demo Website
              </Link>
            )}
            {user?.role === "superadmin" && (
              <Link
                to="/superadmin/restaurants"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold no-underline"
                style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
              >
                <Building2 size={14} strokeWidth={1.75} aria-hidden="true" />
                Superadmin
              </Link>
            )}
            <Link
              to={user ? (user.role === "superadmin" ? "/superadmin/restaurants" : "/admin") : "/login"}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white no-underline transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0B2A57" }}
            >
              <Settings2 size={14} strokeWidth={1.75} aria-hidden="true" />
              {user ? "Dashboard" : "Masuk Admin"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Asymmetric Hero with real culinary & dining hall preview */}
        <section className="border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:items-center lg:py-16">
            <div className="lg:col-span-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B1E24" }}>
                Website Resmi Restoran &amp; Kafe
              </p>
              <h1 className="font-display mt-2.5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
                Satu Tempat untuk Buku Menu, Promo, dan Reservasi Meja Restoran Anda
              </h1>
              <p className="mt-4 text-sm leading-relaxed sm:text-[15px]" style={{ color: "var(--ink-body)" }}>
                Dirancang agar tamu yang membuka tautan dari Instagram atau Google Maps langsung melihat foto hidangan,
                jam buka cabang, ruang acara, dan bisa memesan meja ke WhatsApp dalam hitungan detik.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                {demoResto && (
                  <Link
                    to={`/r/${demoResto.slug}`}
                    className="inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#8B1E24" }}
                  >
                    Buka Contoh Website Resto
                    <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                  </Link>
                )}
                <Link
                  to={user ? (user.role === "superadmin" ? "/superadmin/restaurants" : "/admin") : "/login"}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-semibold no-underline transition-colors hover:bg-stone-100"
                  style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
                >
                  Masuk Panel Pengelola
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
                  <img
                    src={withBasePath("/demo/hero-heritage.jpg")}
                    alt="Suasana ruang makan restoran klasik"
                    className="h-64 w-full object-cover sm:h-72"
                  />
                </div>
                <div className="col-span-4 flex flex-col gap-3">
                  <div className="flex-1 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
                    <img
                      src={withBasePath("/demo/dish-ayam.jpg")}
                      alt="Hidangan ayam goreng mentega"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
                    <img
                      src={withBasePath("/demo/room-vip.jpg")}
                      alt="Ruang makan privat VIP"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Concrete restaurant owner benefits (flat clean grid, zero nested cards) */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: "#0B2A57" }}>
              Dirancang untuk Operasional Harian
            </p>
            <h2 className="font-display mt-1.5 text-3xl font-bold" style={{ color: "var(--ink)" }}>
              Kendali Penuh dari Pemilik dan Tim Restoran
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="border-t pt-4" style={{ borderColor: "var(--border-strong)" }}>
                  <Icon size={18} strokeWidth={1.75} style={{ color: "#8B1E24" }} aria-hidden="true" />
                  <h3 className="mt-3 text-sm font-bold" style={{ color: "var(--ink)" }}>
                    {cap.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--ink-body)" }}>
                    {cap.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Active Restaurants Directory */}
        <section className="border-t py-12" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B1E24" }}>
                  Direktori Aktif
                </p>
                <h2 className="font-display mt-1 text-3xl font-bold" style={{ color: "var(--ink)" }}>
                  Restoran di Reneo Resto ({restaurants.length})
                </h2>
              </div>
            </div>

            {restaurants.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed p-10 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}>
                Belum ada restoran yang terdaftar. Masuk ke Portal Superadmin untuk menambahkan restoran pertama.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((resto) => {
                  const thumb = resolveAssetUrl(resto.hero_image_url) || withBasePath("/demo/hero-heritage.jpg");
                  return (
                    <article
                      key={resto.id}
                      className="flex flex-col justify-between overflow-hidden rounded-xl border transition-colors hover:border-stone-400"
                      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
                    >
                      <div>
                        <div className="relative h-40 w-full overflow-hidden bg-stone-900">
                          <img src={thumb} alt={resto.name} className="h-full w-full object-cover" loading="lazy" />
                          <span
                            className="absolute right-3 top-3 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-white"
                            style={{ backgroundColor: "rgba(15,23,42,0.78)" }}
                          >
                            Tema {resto.theme_preset}
                          </span>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                              style={{ backgroundColor: resto.primary_color || "#8B1E24" }}
                            >
                              <UtensilsCrossed size={14} strokeWidth={1.75} aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <h3 className="truncate text-base font-bold" style={{ color: "var(--ink)" }}>
                                {resto.name}
                              </h3>
                              <p className="truncate font-mono text-[11px]" style={{ color: "var(--ink-muted)" }}>
                                {resto.custom_domain || `${resto.slug}.resto.reneo.my.id`}
                              </p>
                            </div>
                          </div>
                          <p className="mt-3 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--ink-body)" }}>
                            {resto.tagline || "Website restoran, buku menu online, dan reservasi meja."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t px-5 py-3.5 text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
                        <span className="font-mono text-[11px]" style={{ color: "var(--ink-muted)" }}>
                          {resto.branch_count ?? 0} cabang · {resto.menu_count ?? 0} menu
                        </span>
                        <Link
                          to={`/r/${resto.slug}`}
                          className="inline-flex items-center gap-1 font-semibold no-underline hover:underline"
                          style={{ color: resto.primary_color || "#8B1E24" }}
                        >
                          Buka Website
                          <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t py-6" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-xs sm:px-6" style={{ color: "var(--ink-muted)" }}>
          <span>Reneo Resto</span>
          <a href="https://reneo.my.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono hover:underline" style={{ color: "var(--ink-body)" }}>
            reneo.my.id
            <ExternalLink size={11} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
