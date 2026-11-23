import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { api, formatRupiah, resolveAssetUrl } from "../lib/api";
import type { StorefrontPayload, ThemePreset } from "../types";

interface StorefrontPageProps {
  forcedSlug?: string;
  previewPreset?: ThemePreset;
}

const PREVIEW_META: Record<ThemePreset, { label: string; color: string; sampleTitle: string; sampleTagline: string }> = {
  heritage: {
    label: "Restoran Keluarga & Banquet",
    color: "#8B1E24",
    sampleTitle: "Rumah Makan Nusantara",
    sampleTagline: "Sajian Klasik Keluarga, Dimasak Segar dari Dapur Kami Setiap Hari",
  },
  bistro: {
    label: "Modern Bistro & Grill",
    color: "#C87D32",
    sampleTitle: "Ember Bistro & Grill",
    sampleTagline: "Api Arang, Rempah Pilihan, dan Meja Hangat untuk Makan Malam Berkesan",
  },
  cafe: {
    label: "Artisan Cafe & Kitchen",
    color: "#9A4A24",
    sampleTitle: "Kopi & Dapur Pagi",
    sampleTagline: "Hidangan Hangat, Kopi Seduh Segar, dan Ruang Santai Sepanjang Hari",
  },
};

export function StorefrontPage({ forcedSlug, previewPreset }: StorefrontPageProps) {
  const params = useParams<{ slug: string }>();
  const slug = forcedSlug || params.slug || "";

  const [data, setData] = useState<StorefrontPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCatId, setActiveCatId] = useState<number | "all">("all");
  const [menuQuery, setMenuQuery] = useState("");

  // Reservation form state
  const [branchId, setBranchId] = useState<string>("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [eventType, setEventType] = useState("Makan Keluarga");
  const [dateTime, setDateTime] = useState("");
  const [pax, setPax] = useState(4);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resError, setResError] = useState<string | null>(null);
  const [resSuccess, setResSuccess] = useState<{ waUrl: string } | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api
      .getStorefront(slug)
      .then((res) => {
        setData(res);
        if (res.branches.length > 0) setBranchId(String(res.branches[0].id));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat halaman restoran.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const activePreset: ThemePreset = previewPreset || data?.tenant.theme_preset || "heritage";
  const accentColor = previewPreset ? PREVIEW_META[previewPreset].color : data?.tenant.primary_color || "#8B1E24";

  useEffect(() => {
    document.documentElement.setAttribute("data-preset", activePreset);
    document.documentElement.style.setProperty("--resto-primary", accentColor);
    return () => {
      document.documentElement.removeAttribute("data-preset");
    };
  }, [activePreset, accentColor]);

  const signatureDishes = useMemo(() => {
    if (!data) return [];
    return data.menu_items.filter((item) => item.is_available && (item.image_url || item.badge)).slice(0, 4);
  }, [data]);

  const filteredMenu = useMemo(() => {
    if (!data) return [];
    const q = menuQuery.trim().toLowerCase();
    return data.menu_items.filter((item) => {
      if (activeCatId !== "all" && item.category_id !== activeCatId) return false;
      if (q && !`${item.name} ${item.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, activeCatId, menuQuery]);

  const handleReserve = async (e: FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    setSubmitting(true);
    setResError(null);
    setResSuccess(null);
    try {
      const res = await api.submitReservation(slug, {
        branch_id: branchId ? Number(branchId) : undefined,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
        event_type: eventType,
        date_time: dateTime.trim(),
        pax,
        notes: notes.trim(),
      });
      setResSuccess({ waUrl: res.whatsapp_url });
      setGuestName("");
      setGuestPhone("");
      setNotes("");
    } catch (err) {
      setResError(err instanceof Error ? err.message : "Gagal mengirim permintaan reservasi.");
    } finally {
      setSubmitting(false);
    }
  };

  const prefillEvent = (title: string) => {
    setEventType(title);
    const el = document.getElementById("reservasi");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 text-sm" style={{ color: "var(--ink-muted)" }}>
        Memuat halaman restoran...
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Restoran Tidak Ditemukan
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-body)" }}>
          {error || "Tautan halaman restoran tidak aktif atau sudah berubah."}
        </p>
        <Link to="/" className="mt-5 inline-flex h-10 items-center rounded-lg px-4 text-xs font-semibold text-white no-underline" style={{ backgroundColor: "#0B2A57" }}>
          Kembali ke Beranda Reneo Resto
        </Link>
      </main>
    );
  }

  const { tenant, branches, categories, promos, event_packages } = data;
  const primaryBranch = branches[0];
  const displayName = previewPreset ? PREVIEW_META[previewPreset].sampleTitle : tenant.name;
  const displayTagline = previewPreset ? PREVIEW_META[previewPreset].sampleTagline : tenant.tagline;
  const heroSrc = resolveAssetUrl(tenant.hero_image_url);
  const logoSrc = resolveAssetUrl(tenant.logo_url);
  const isHeritage = activePreset === "heritage";
  const isBistro = activePreset === "bistro";
  const isCafe = activePreset === "cafe";

  const pageBg = isBistro ? "#111315" : isCafe ? "#FBF7F0" : "#FAF6EE";
  const surfaceBg = isBistro ? "#181B20" : "#FFFFFF";
  const mutedBg = isBistro ? "#1F2329" : isCafe ? "#F2E8D8" : "#F2ECE0";
  const textMain = isBistro ? "#F8FAFC" : isCafe ? "#2C1E16" : "#1F1612";
  const textBody = isBistro ? "#CBD5E1" : isCafe ? "#5C4738" : "#4E413A";
  const textMuted = isBistro ? "#94A3B8" : isCafe ? "#8A7160" : "#7C6E65";
  const borderCol = isBistro ? "rgba(255,255,255,0.11)" : "rgba(31,22,18,0.12)";

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg, color: textMain }}>
      {/* Preview banner ONLY on /preview/:preset (never shown to real restaurant visitors on /r/:slug) */}
      {previewPreset && (
        <div className="border-b px-4 py-2 text-xs text-white" style={{ backgroundColor: "#0B2A57", borderColor: "rgba(255,255,255,0.15)" }}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <span className="font-medium">
              Mode Pratinjau Template: <strong>{PREVIEW_META[previewPreset].label}</strong>
            </span>
            <Link to="/" className="inline-flex items-center gap-1 font-semibold text-amber-300 no-underline hover:underline">
              <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
              Kembali ke Pilihan Tema
            </Link>
          </div>
        </div>
      )}

      {/* Top hospitality bar for Classic Family Dining */}
      {isHeritage && primaryBranch && (
        <div className="border-b px-4 py-2 text-[11px] text-amber-100" style={{ backgroundColor: "#261012", borderColor: "rgba(212,175,55,0.28)" }}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} strokeWidth={1.75} className="text-amber-300" aria-hidden="true" />
              Buka {primaryBranch.open_hours} · {primaryBranch.name}
            </span>
            {primaryBranch.whatsapp_number && (
              <a
                href={`https://wa.me/${primaryBranch.whatsapp_number.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-amber-200 no-underline hover:underline"
              >
                <Phone size={11} strokeWidth={1.75} aria-hidden="true" />
                Reservasi: +{primaryBranch.whatsapp_number.replace(/[^0-9]/g, "")}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Sticky F&B Navigation */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          backgroundColor: isBistro ? "rgba(17,19,21,0.92)" : isCafe ? "rgba(251,247,240,0.94)" : "rgba(255,255,255,0.94)",
          borderColor: borderCol,
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#beranda" className="flex items-center gap-2.5 no-underline">
            {logoSrc && !previewPreset ? (
              <img src={logoSrc} alt={displayName} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <span
                className={`flex h-9 w-9 items-center justify-center text-white ${isCafe ? "rounded-full" : "rounded-lg"}`}
                style={{ backgroundColor: accentColor }}
              >
                <UtensilsCrossed size={16} strokeWidth={1.75} aria-hidden="true" />
              </span>
            )}
            <span
              className={isBistro ? "text-base font-bold uppercase tracking-[0.14em]" : "font-display text-2xl font-bold tracking-tight"}
              style={{ color: textMain }}
            >
              {displayName}
            </span>
          </a>

          <nav aria-label="Navigasi restoran" className="hidden items-center gap-6 text-xs font-semibold sm:flex" style={{ color: textBody }}>
            <a href="#andalan" className="no-underline hover:underline">Andalan</a>
            <a href="#menu" className="no-underline hover:underline">Daftar Menu</a>
            {promos.length > 0 && <a href="#promo" className="no-underline hover:underline">Promo</a>}
            {event_packages.length > 0 && <a href="#acara" className="no-underline hover:underline">Ruang Privat</a>}
            <a href="#cabang" className="no-underline hover:underline">Lokasi</a>
            <a
              href="#reservasi"
              className={`inline-flex h-9 items-center gap-1.5 px-4 text-xs font-semibold text-white no-underline transition-opacity hover:opacity-90 ${isCafe ? "rounded-full" : "rounded-lg"}`}
              style={{ backgroundColor: accentColor }}
            >
              <Calendar size={13} strokeWidth={1.75} aria-hidden="true" />
              Reservasi Meja
            </a>
          </nav>

          <a
            href="#reservasi"
            className={`inline-flex h-9 items-center px-3.5 text-xs font-semibold text-white no-underline sm:hidden ${isCafe ? "rounded-full" : "rounded-lg"}`}
            style={{ backgroundColor: accentColor }}
          >
            Pesan Meja
          </a>
        </div>
      </header>

      <main>
        {/* HERO: Pure F&B Atmosphere (No corporate widgets) */}
        {isHeritage && (
          <section id="beranda" className="relative flex min-h-[82vh] items-center justify-center overflow-hidden bg-stone-950 text-white">
            {heroSrc && (
              <img src={heroSrc} alt={displayName} className="absolute inset-0 h-full w-full object-cover opacity-55" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950/75 via-stone-950/45 to-stone-950/90" />
            <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
              <div className="mx-auto mb-5 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-amber-300/70" aria-hidden="true" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                  Dapur Klasik &amp; Jamuan Keluarga
                </span>
                <span className="h-px w-10 bg-amber-300/70" aria-hidden="true" />
              </div>

              <h1 className="font-display text-5xl font-bold leading-none text-white sm:text-7xl">
                {displayName}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-200 sm:text-lg">
                {displayTagline}
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
                <a
                  href="#menu"
                  className="inline-flex h-12 items-center gap-2 rounded-lg px-7 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90"
                  style={{ backgroundColor: accentColor }}
                >
                  Lihat Buku Menu
                </a>
                <a
                  href="#reservasi"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-amber-200/50 bg-stone-950/45 px-7 text-sm font-semibold text-amber-50 no-underline backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  <Calendar size={15} strokeWidth={1.75} aria-hidden="true" />
                  Reservasi Meja
                </a>
              </div>
            </div>
          </section>
        )}

        {isBistro && (
          <section id="beranda" className="border-b" style={{ borderColor: borderCol }}>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:items-center lg:py-20">
              <div className="lg:col-span-6">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: accentColor }}>
                  {primaryBranch?.open_hours || "Open Daily"} · Grill &amp; Kitchen
                </p>
                <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                  {displayTagline}
                </h1>
                {tenant.story && (
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">{tenant.story}</p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#menu"
                    className="inline-flex h-12 items-center rounded-lg px-6 text-sm font-semibold text-white no-underline"
                    style={{ backgroundColor: accentColor }}
                  >
                    Buka Menu Malam Ini
                  </a>
                  <a
                    href="#reservasi"
                    className="inline-flex h-12 items-center rounded-lg border border-white/25 px-6 text-sm font-semibold text-white no-underline hover:bg-white/10"
                  >
                    Reservasi Meja
                  </a>
                </div>
              </div>
              <div className="lg:col-span-6">
                <div className="grid grid-cols-12 gap-3">
                  {heroSrc && (
                    <img
                      src={heroSrc}
                      alt={displayName}
                      className="col-span-12 h-64 w-full rounded-xl object-cover sm:h-80"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {isCafe && (
          <section id="beranda" className="mx-auto max-w-6xl px-4 pt-8 pb-4 sm:px-6">
            <div className="overflow-hidden rounded-3xl border" style={{ backgroundColor: surfaceBg, borderColor: borderCol }}>
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-6">
                  <span className="inline-flex w-fit rounded-full px-3.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: mutedBg, color: accentColor }}>
                    {primaryBranch?.open_hours || "Buka Setiap Hari"}
                  </span>
                  <h1 className="font-display mt-3 text-4xl font-bold leading-tight sm:text-5xl" style={{ color: textMain }}>
                    {displayTagline}
                  </h1>
                  {tenant.story && (
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: textBody }}>{tenant.story}</p>
                  )}
                  <div className="mt-7 flex flex-wrap gap-2.5">
                    <a
                      href="#menu"
                      className="inline-flex h-11 items-center rounded-full px-6 text-xs font-semibold text-white no-underline"
                      style={{ backgroundColor: accentColor }}
                    >
                      Lihat Menu Hari Ini
                    </a>
                    <a
                      href="#reservasi"
                      className="inline-flex h-11 items-center rounded-full border px-6 text-xs font-semibold no-underline"
                      style={{ borderColor: borderCol, color: textMain }}
                    >
                      Pesan Tempat
                    </a>
                  </div>
                </div>
                <div className="min-h-[280px] lg:col-span-6">
                  {heroSrc && <img src={heroSrc} alt={displayName} className="h-full w-full object-cover" />}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SIGNATURE DISHES: Appetizing visual strip first */}
        {signatureDishes.length > 0 && (
          <section id="andalan" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
                  <Flame size={13} strokeWidth={1.75} aria-hidden="true" />
                  Rekomendasi Dapur
                </p>
                <h2 className="font-display mt-1 text-3xl font-bold sm:text-4xl" style={{ color: textMain }}>
                  Hidangan Favorit Tamu
                </h2>
              </div>
              <a href="#menu" className="text-xs font-semibold no-underline hover:underline" style={{ color: accentColor }}>
                Lihat semua {data.menu_items.length} menu -&gt;
              </a>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {signatureDishes.map((dish) => {
                const imgSrc = resolveAssetUrl(dish.image_url);
                return (
                  <article
                    key={dish.id}
                    className={`overflow-hidden border transition-transform duration-200 hover:-translate-y-0.5 ${isCafe ? "rounded-3xl" : "rounded-xl"}`}
                    style={{ backgroundColor: surfaceBg, borderColor: borderCol }}
                  >
                    {imgSrc && (
                      <div className="relative h-48 w-full overflow-hidden bg-stone-900">
                        <img src={imgSrc} alt={dish.name} className="h-full w-full object-cover" loading="lazy" />
                        {dish.badge && (
                          <span
                            className="absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                            style={{ backgroundColor: accentColor }}
                          >
                            {dish.badge}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-sm font-bold leading-snug" style={{ color: textMain }}>{dish.name}</h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed" style={{ color: textBody }}>{dish.description}</p>
                      <div className="mt-3 font-mono text-sm font-bold" style={{ color: accentColor }}>
                        {formatRupiah(dish.price)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* BUKU MENU: Authentic F&B Menu Book Layout */}
        <section id="menu" className="border-y py-14 sm:py-16" style={{ borderColor: borderCol, backgroundColor: surfaceBg }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-4 pb-6 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
                  Buku Menu
                </p>
                <h2 className="font-display mt-1 text-3xl font-bold sm:text-4xl" style={{ color: textMain }}>
                  Daftar Hidangan &amp; Minuman
                </h2>
              </div>

              <div className="relative w-full md:w-72">
                <Search size={15} strokeWidth={1.75} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
                <input
                  type="search"
                  value={menuQuery}
                  onChange={(e) => setMenuQuery(e.target.value)}
                  placeholder="Cari menu (ayam, gurame, sup...)"
                  className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none"
                  style={{ backgroundColor: pageBg, borderColor: borderCol, color: textMain }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 border-b pb-5" role="tablist" aria-label="Kategori menu" style={{ borderColor: borderCol }}>
              <button
                type="button"
                role="tab"
                aria-selected={activeCatId === "all"}
                onClick={() => setActiveCatId("all")}
                className={`h-8 border px-3.5 text-xs font-semibold transition-colors ${isCafe ? "rounded-full" : "rounded-lg"}`}
                style={{
                  backgroundColor: activeCatId === "all" ? accentColor : pageBg,
                  borderColor: activeCatId === "all" ? accentColor : borderCol,
                  color: activeCatId === "all" ? "#ffffff" : textBody,
                }}
              >
                Semua Menu
              </button>
              {categories.map((cat) => {
                const active = activeCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCatId(cat.id)}
                    className={`h-8 border px-3.5 text-xs font-semibold transition-colors ${isCafe ? "rounded-full" : "rounded-lg"}`}
                    style={{
                      backgroundColor: active ? accentColor : pageBg,
                      borderColor: active ? accentColor : borderCol,
                      color: active ? "#ffffff" : textBody,
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {filteredMenu.length === 0 ? (
              <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm" style={{ borderColor: borderCol, color: textMuted }}>
                Tidak ada hidangan yang cocok dengan pencarian Anda.
              </div>
            ) : (
              <div className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                {filteredMenu.map((item) => {
                  const imgSrc = resolveAssetUrl(item.image_url);
                  return (
                    <article
                      key={item.id}
                      className="flex items-start gap-4 border-b pb-5"
                      style={{
                        borderColor: borderCol,
                        opacity: item.is_available ? 1 : 0.55,
                      }}
                    >
                      {imgSrc && (
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className={`h-20 w-24 shrink-0 object-cover ${isCafe ? "rounded-2xl" : "rounded-lg"}`}
                          loading="lazy"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="text-[15px] font-bold" style={{ color: textMain }}>
                            {item.name}
                          </h3>
                          <span className="hidden flex-1 border-b border-dotted sm:block" style={{ borderColor: borderCol }} aria-hidden="true" />
                          <span className="shrink-0 font-mono text-sm font-bold" style={{ color: accentColor }}>
                            {formatRupiah(item.price)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="mt-1 text-xs leading-relaxed" style={{ color: textBody }}>
                            {item.description}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-2">
                          {item.badge && item.is_available && (
                            <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: mutedBg, color: accentColor }}>
                              {item.badge}
                            </span>
                          )}
                          {!item.is_available && (
                            <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}>
                              Stok Habis
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* PROMO */}
        {promos.length > 0 && (
          <section id="promo" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
              Penawaran Khusus
            </p>
            <h2 className="font-display mt-1 text-3xl font-bold" style={{ color: textMain }}>
              Promo Berjalan
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              {promos.map((promo) => {
                const bannerSrc = resolveAssetUrl(promo.banner_url);
                return (
                  <div
                    key={promo.id}
                    className={`overflow-hidden border ${isCafe ? "rounded-3xl" : "rounded-xl"}`}
                    style={{ backgroundColor: surfaceBg, borderColor: borderCol }}
                  >
                    {bannerSrc && <img src={bannerSrc} alt={promo.title} className="h-44 w-full object-cover" loading="lazy" />}
                    <div className="border-l-4 p-5" style={{ borderLeftColor: accentColor }}>
                      <h3 className="text-base font-bold" style={{ color: textMain }}>{promo.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: textBody }}>{promo.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* RUANG PRIVAT & ACARA */}
        {event_packages.length > 0 && (
          <section id="acara" className="border-y py-14 sm:py-16" style={{ borderColor: borderCol, backgroundColor: surfaceBg }}>
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
                Ruang Privat &amp; Jamuan
              </p>
              <h2 className="font-display mt-1 text-3xl font-bold sm:text-4xl" style={{ color: textMain }}>
                Rayakan Momen Spesial Bersama Kami
              </h2>

              <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
                {event_packages.map((pkg) => {
                  const roomSrc = resolveAssetUrl(pkg.image_url);
                  return (
                    <article
                      key={pkg.id}
                      className={`flex flex-col justify-between overflow-hidden border ${isCafe ? "rounded-3xl" : "rounded-xl"}`}
                      style={{ backgroundColor: pageBg, borderColor: borderCol }}
                    >
                      <div>
                        {roomSrc && <img src={roomSrc} alt={pkg.title} className="h-48 w-full object-cover" loading="lazy" />}
                        <div className="p-5">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 font-medium" style={{ color: textMuted }}>
                              <Users size={13} strokeWidth={1.75} aria-hidden="true" />
                              {pkg.capacity}
                            </span>
                            <span className="font-mono font-bold" style={{ color: accentColor }}>
                              {pkg.price_label}
                            </span>
                          </div>
                          <h3 className="mt-2 text-base font-bold" style={{ color: textMain }}>{pkg.title}</h3>
                          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: textBody }}>{pkg.description}</p>
                        </div>
                      </div>
                      <div className="px-5 pb-5">
                        <button
                          type="button"
                          onClick={() => prefillEvent(pkg.title)}
                          className={`h-9 w-full border text-xs font-semibold transition-opacity hover:opacity-85 ${isCafe ? "rounded-full" : "rounded-lg"}`}
                          style={{ borderColor: accentColor, color: accentColor }}
                        >
                          Tanya &amp; Reservasi Paket Ini
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* LOKASI & RESERVASI MEJA */}
        <section id="reservasi" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div id="cabang" className="space-y-4 lg:col-span-5">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
                Kunjungi Kami
              </p>
              <h2 className="font-display text-3xl font-bold" style={{ color: textMain }}>
                Cabang &amp; Jam Buka
              </h2>

              <div className="space-y-3 pt-1">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className={`border p-4 ${isCafe ? "rounded-2xl" : "rounded-xl"}`}
                    style={{ backgroundColor: surfaceBg, borderColor: borderCol }}
                  >
                    <div className="text-sm font-bold" style={{ color: textMain }}>{branch.name}</div>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: textBody }}>{branch.address}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: textMuted }}>
                      <Clock size={12} strokeWidth={1.75} aria-hidden="true" />
                      {branch.open_hours}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {branch.maps_url && (
                        <a
                          href={branch.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-semibold no-underline"
                          style={{ borderColor: borderCol, color: textMain }}
                        >
                          <MapPin size={12} strokeWidth={1.75} aria-hidden="true" />
                          Google Maps
                          <ExternalLink size={11} strokeWidth={1.75} aria-hidden="true" />
                        </a>
                      )}
                      {branch.whatsapp_number && (
                        <a
                          href={`https://wa.me/${branch.whatsapp_number.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-semibold text-white no-underline"
                          style={{ backgroundColor: "var(--emerald)" }}
                        >
                          <MessageCircle size={12} strokeWidth={1.75} aria-hidden="true" />
                          WhatsApp Cabang
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div
                className={`border p-6 ${isCafe ? "rounded-3xl" : "rounded-xl"}`}
                style={{ backgroundColor: surfaceBg, borderColor: borderCol }}
              >
                <h2 className="font-display text-2xl font-bold" style={{ color: textMain }}>
                  Reservasi Meja &amp; Acara
                </h2>
                <p className="mt-1 text-xs" style={{ color: textMuted }}>
                  Isi jadwal kunjungan Anda untuk konfirmasi meja langsung via WhatsApp cabang.
                </p>

                {resError && (
                  <div role="alert" className="mt-4 rounded-lg border px-3 py-2 text-xs font-medium" style={{ backgroundColor: "var(--danger-bg)", borderColor: "var(--danger)", color: "var(--danger)" }}>
                    {resError}
                  </div>
                )}

                {resSuccess && (
                  <div role="status" className="mt-4 rounded-lg border p-4" style={{ backgroundColor: "var(--emerald-bg)", borderColor: "var(--emerald)", color: "var(--emerald)" }}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <CheckCircle2 size={16} strokeWidth={2} aria-hidden="true" />
                      Permintaan reservasi tercatat
                    </div>
                    {resSuccess.waUrl && (
                      <a
                        href={resSuccess.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-white no-underline"
                        style={{ backgroundColor: "var(--emerald)" }}
                      >
                        <MessageCircle size={14} strokeWidth={1.75} aria-hidden="true" />
                        Konfirmasi via WhatsApp
                      </a>
                    )}
                  </div>
                )}

                <form onSubmit={(e) => void handleReserve(e)} className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="res-name" className="mb-1 block text-xs font-semibold" style={{ color: textBody }}>Nama Pemesan</label>
                    <input
                      id="res-name"
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Contoh: Ibu Ratna"
                      className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                      style={{ backgroundColor: pageBg, borderColor: borderCol, color: textMain }}
                    />
                  </div>
                  <div>
                    <label htmlFor="res-phone" className="mb-1 block text-xs font-semibold" style={{ color: textBody }}>Nomor WhatsApp</label>
                    <input
                      id="res-phone"
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                      style={{ backgroundColor: pageBg, borderColor: borderCol, color: textMain }}
                    />
                  </div>
                  {branches.length > 0 && (
                    <div>
                      <label htmlFor="res-branch" className="mb-1 block text-xs font-semibold" style={{ color: textBody }}>Pilih Cabang</label>
                      <select
                        id="res-branch"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        className="resto-select h-10 w-full rounded-lg border pl-3 text-sm outline-none"
                        style={{ backgroundColor: pageBg, borderColor: borderCol, color: textMain }}
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label htmlFor="res-dt" className="mb-1 block text-xs font-semibold" style={{ color: textBody }}>Tanggal &amp; Jam</label>
                    <input
                      id="res-dt"
                      type="datetime-local"
                      required
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                      style={{ backgroundColor: pageBg, borderColor: borderCol, color: textMain }}
                    />
                  </div>
                  <div>
                    <label htmlFor="res-pax" className="mb-1 block text-xs font-semibold" style={{ color: textBody }}>Jumlah Tamu</label>
                    <input
                      id="res-pax"
                      type="number"
                      min={1}
                      max={300}
                      required
                      value={pax}
                      onChange={(e) => setPax(Number(e.target.value))}
                      className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                      style={{ backgroundColor: pageBg, borderColor: borderCol, color: textMain }}
                    />
                  </div>
                  <div>
                    <label htmlFor="res-type" className="mb-1 block text-xs font-semibold" style={{ color: textBody }}>Keperluan</label>
                    <input
                      id="res-type"
                      type="text"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                      style={{ backgroundColor: pageBg, borderColor: borderCol, color: textMain }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="res-notes" className="mb-1 block text-xs font-semibold" style={{ color: textBody }}>Catatan (opsional)</label>
                    <textarea
                      id="res-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: meja dekat jendela atau kursi bayi"
                      className="w-full rounded-lg border p-3 text-sm outline-none"
                      style={{ backgroundColor: pageBg, borderColor: borderCol, color: textMain }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`h-11 w-full text-sm font-semibold text-white transition-opacity hover:opacity-90 ${isCafe ? "rounded-full" : "rounded-lg"}`}
                      style={{ backgroundColor: accentColor }}
                    >
                      {submitting ? "Mengirim Reservasi..." : "Kirim Permintaan Reservasi"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-7" style={{ borderColor: borderCol, backgroundColor: surfaceBg }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-xs sm:px-6" style={{ color: textMuted }}>
          <span className="font-semibold" style={{ color: textMain }}>{displayName}</span>
          <span>
            Didukung oleh{" "}
            <a href="https://reneo.my.id" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: textBody }}>
              Reneo Resto
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
