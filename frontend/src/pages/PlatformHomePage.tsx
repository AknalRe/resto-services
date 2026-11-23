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
} from "lucide-react";
import { withBasePath } from "../lib/basePath";
import type { AuthUser, Tenant, ThemePreset } from "../types";

interface PlatformHomePageProps {
  restaurants: Tenant[];
  user: AuthUser | null;
}

const TEMPLATE_SHOWCASE: ReadonlyArray<{
  preset: ThemePreset;
  name: string;
  vibe: string;
  summary: string;
  image: string;
  accent: string;
  bestFor: string;
}> = [
  {
    preset: "heritage",
    name: "Restoran Keluarga & Banquet",
    vibe: "Hangat, Elegan & Klasik",
    summary:
      "Banner suasana ruang makan penuh, daftar hidangan andalan bergambar besar, tata letak buku menu klasik, dan etalase ruang privat VIP.",
    image: "/demo/hero-heritage.jpg",
    accent: "#8B1E24",
    bestFor: "Restoran keluarga, Chinese food, rumah makan legendaris, jamuan & sangjit",
  },
  {
    preset: "bistro",
    name: "Modern Bistro & Grill",
    vibe: "Gelap, Kontras & Editorial",
    summary:
      "Nuansa charcoal dan tembaga yang menonjolkan warna makanan, papan menu modern berjarak lega, dan formulir reservasi meja cepat.",
    image: "/demo/hero-bistro.jpg",
    accent: "#D97736",
    bestFor: "Steakhouse, bistro modern, bar & grill, restoran fine casual",
  },
  {
    preset: "cafe",
    name: "Artisan Cafe & Kitchen",
    vibe: "Krem Hangat & Santai",
    summary:
      "Tampilan cerah bernuansa kopi dan roti hangat, tab kategori cepat di layar ponsel, serta kartu menu bergambar yang ringan digulir.",
    image: "/demo/hero-cafe.jpg",
    accent: "#2F483E",
    bestFor: "Kedai kopi, bakery, brunch cafe, kedai makan harian",
  },
];

const CAPABILITIES = [
  {
    icon: BookOpen,
    title: "Buku Menu Online Selalu Terkini",
    desc: "Ubah harga, foto hidangan, dan tanda stok habis langsung dari ponsel tanpa perlu cetak ulang menu.",
  },
  {
    icon: CalendarCheck2,
    title: "Reservasi Langsung ke WhatsApp Cabang",
    desc: "Tamu mengisi jadwal dan jumlah kursi, data tersimpan rapi di panel resto lalu langsung membuka WhatsApp admin cabang.",
  },
  {
    icon: Layers,
    title: "Tema Dikontrol Penuh oleh Admin Resto",
    desc: "Pilih gaya tampilan, warna utama, dan logo dari dashboard pengelola; pengunjung selalu melihat identitas resmi restoran.",
  },
  {
    icon: ImageIcon,
    title: "Ganti Foto & Promo Kapan Saja",
    desc: "Unggah foto banner, hidangan baru, promo musiman, dan ruang privat VIP dalam beberapa klik.",
  },
];

export function PlatformHomePage({ user }: PlatformHomePageProps) {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      {/* Clean sticky header */}
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
            <a
              href="#contoh-tema"
              className="hidden h-9 items-center rounded-lg border px-3 text-xs font-semibold no-underline transition-colors hover:bg-stone-100 sm:inline-flex"
              style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
            >
              Lihat Contoh Tema
            </a>
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
        {/* Warm culinary Hero */}
        <section className="relative overflow-hidden bg-stone-950 text-white">
          <img
            src={withBasePath("/demo/hero-heritage.jpg")}
            alt="Suasana ruang makan restoran"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/80 to-stone-950/60" />

          <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:items-center lg:py-20">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                Website Kuliner, Buku Menu &amp; Reservasi Meja
              </p>
              <h1 className="font-display mt-3 text-4xl font-bold leading-tight text-white sm:text-6xl">
                Tampilkan Menu dan Suasana Restoran Anda Lebih Menggugah Selera
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-200 sm:text-base">
                Khusus untuk pemilik restoran, kafe, dan kedai makan. Tamu dari Instagram atau Google Maps langsung melihat
                foto hidangan, harga terbaru, promo aktif, ruang privat, dan memesan meja lewat WhatsApp.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#contoh-tema"
                  className="inline-flex h-12 items-center gap-2 rounded-lg px-6 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#8B1E24" }}
                >
                  Coba Contoh Tema F&amp;B
                  <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                </a>
                <Link
                  to={user ? (user.role === "superadmin" ? "/superadmin/restaurants" : "/admin") : "/login"}
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-6 text-sm font-semibold text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Masuk Panel Pengelola
                </Link>
              </div>
            </div>

            <div className="hidden lg:col-span-5 lg:grid lg:grid-cols-2 lg:gap-3">
              <img
                src={withBasePath("/demo/dish-ayam.jpg")}
                alt="Hidangan andalan ayam goreng mentega"
                className="h-52 w-full rounded-xl border border-white/15 object-cover"
              />
              <img
                src={withBasePath("/demo/dish-gurame.jpg")}
                alt="Hidangan gurame asam manis"
                className="mt-6 h-52 w-full rounded-xl border border-white/15 object-cover"
              />
            </div>
          </div>
        </section>

        {/* Live Template Showcase: 3 F&B styles directly tryable */}
        <section id="contoh-tema" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B1E24" }}>
              Contoh Langsung Berdasarkan Gaya F&amp;B
            </p>
            <h2 className="font-display mt-1.5 text-3xl font-bold sm:text-4xl" style={{ color: "var(--ink)" }}>
              Pilih Gaya Tampilan yang Paling Cocok untuk Konsep Dapur Anda
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-body)" }}>
              Klik salah satu tema di bawah untuk mencoba tampilan website secara penuh. Setelah aktif, tema ditentukan
              sepenuhnya dari Panel Admin restoran.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {TEMPLATE_SHOWCASE.map((tpl) => (
              <article
                key={tpl.preset}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border transition-colors hover:border-stone-400"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-stone-900">
                    <img
                      src={withBasePath(tpl.image)}
                      alt={tpl.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <span
                      className="absolute left-3.5 top-3.5 rounded-md px-2.5 py-1 text-[11px] font-semibold text-white"
                      style={{ backgroundColor: tpl.accent }}
                    >
                      {tpl.vibe}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>
                      {tpl.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--ink-body)" }}>
                      {tpl.summary}
                    </p>
                    <p className="mt-3 border-t pt-3 text-[11px]" style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}>
                      <strong style={{ color: "var(--ink-body)" }}>Cocok untuk:</strong> {tpl.bestFor}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <Link
                    to={`/preview/${tpl.preset}`}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold text-white no-underline transition-opacity hover:opacity-90"
                    style={{ backgroundColor: tpl.accent }}
                  >
                    Lihat Contoh Live
                    <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Concrete restaurant owner capabilities */}
        <section className="border-t py-14" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: "#0B2A57" }}>
                Praktis untuk Operasional Harian
              </p>
              <h2 className="font-display mt-1.5 text-3xl font-bold" style={{ color: "var(--ink)" }}>
                Semua Kebutuhan Website Restoran dalam Satu Panel
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
