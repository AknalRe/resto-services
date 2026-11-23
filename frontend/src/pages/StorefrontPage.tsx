import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
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
}

export function StorefrontPage({ forcedSlug }: StorefrontPageProps) {
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
        document.documentElement.setAttribute("data-preset", res.tenant.theme_preset || "heritage");
        document.documentElement.style.setProperty("--resto-primary", res.tenant.primary_color || "#8B1E24");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat halaman restoran.");
      })
      .finally(() => setLoading(false));

    return () => {
      document.documentElement.removeAttribute("data-preset");
    };
  }, [slug]);

  const activePreset: ThemePreset = data?.tenant.theme_preset || "heritage";

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
  const heroSrc = resolveAssetUrl(tenant.hero_image_url);
  const logoSrc = resolveAssetUrl(tenant.logo_url);
  const isHeritage = activePreset === "heritage";
  const isBistro = activePreset === "bistro";
  const isCafe = activePreset === "cafe";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      {/* Heritage top hospitality info strip */}
      {isHeritage && primaryBranch && (
        <div className="border-b px-4 py-2 text-[11px] text-amber-100" style={{ backgroundColor: "#231214", borderColor: "rgba(184,138,62,0.28)" }}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 sm:px-2">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} strokeWidth={1.75} className="text-amber-300" aria-hidden="true" />
              {primaryBranch.open_hours} · {primaryBranch.name}
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

      {/* Navbar */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          backgroundColor: isBistro ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.94)",
          borderColor: isBistro ? "rgba(148,163,184,0.2)" : "var(--border)",
          color: isBistro ? "#f8fafc" : "var(--ink)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#beranda" className="flex items-center gap-2.5 no-underline">
            {logoSrc ? (
              <img src={logoSrc} alt={tenant.name} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: tenant.primary_color }}
              >
                <UtensilsCrossed size={16} strokeWidth={1.75} aria-hidden="true" />
              </span>
            )}
            <span
              className={isBistro ? "text-base font-bold uppercase tracking-wider" : "font-display text-2xl font-bold tracking-tight"}
              style={{ color: isBistro ? "#f8fafc" : "var(--ink)" }}
            >
              {tenant.name}
            </span>
          </a>

          <nav
            aria-label="Navigasi restoran"
            className="hidden items-center gap-6 text-xs font-semibold sm:flex"
            style={{ color: isBistro ? "#cbd5e1" : "var(--ink-body)" }}
          >
            <a href="#cerita" className="no-underline hover:underline">Tentang Kami</a>
            <a href="#menu" className="no-underline hover:underline">Buku Menu</a>
            {promos.length > 0 && <a href="#promo" className="no-underline hover:underline">Promo</a>}
            {event_packages.length > 0 && <a href="#acara" className="no-underline hover:underline">Ruang Acara</a>}
            <a href="#cabang" className="no-underline hover:underline">Cabang</a>
            <a
              href="#reservasi"
              className={`inline-flex h-9 items-center gap-1.5 px-4 text-xs font-semibold text-white no-underline transition-opacity hover:opacity-90 ${isCafe ? "rounded-full" : "rounded-lg"}`}
              style={{ backgroundColor: tenant.primary_color }}
            >
              <Calendar size={13} strokeWidth={1.75} aria-hidden="true" />
              Reservasi Meja
            </a>
          </nav>

          <a
            href="#reservasi"
            className={`inline-flex h-9 items-center px-3.5 text-xs font-semibold text-white no-underline sm:hidden ${isCafe ? "rounded-full" : "rounded-lg"}`}
            style={{ backgroundColor: tenant.primary_color }}
          >
            Reservasi
          </a>
        </div>
      </header>

      <main>
        {/* HERO: controlled strictly by admin theme_preset */}
        {isHeritage && (
          <section id="beranda" className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-stone-950 text-white">
            {heroSrc && (
              <img
                src={heroSrc}
                alt={tenant.name}
                className="absolute inset-0 h-full w-full object-cover opacity-55"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/50 to-stone-950/85" />
            <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
              <div className="mx-auto mb-4 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-amber-400/70" aria-hidden="true" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-300">
                  {branches.length > 1 ? `${branches.length} Cabang Resmi` : "Sajian Keluarga Klasik"}
                </span>
                <span className="h-px w-10 bg-amber-400/70" aria-hidden="true" />
              </div>

              <h1 className="font-display text-5xl font-bold leading-none tracking-tight text-white sm:text-7xl">
                {tenant.name}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-200 sm:text-lg">
                {tenant.tagline}
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
                <a
                  href="#reservasi"
                  className="inline-flex h-12 items-center gap-2 rounded-lg px-7 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90"
                  style={{ backgroundColor: tenant.primary_color }}
                >
                  <Calendar size={15} strokeWidth={1.75} aria-hidden="true" />
                  Reservasi Meja &amp; Acara
                </a>
                <a
                  href="#menu"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-amber-200/45 bg-stone-950/40 px-7 text-sm font-semibold text-amber-50 no-underline backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  Lihat Buku Menu
                </a>
              </div>
            </div>
          </section>
        )}

        {isBistro && (
          <section id="beranda" className="border-b bg-slate-950 text-white" style={{ borderColor: "rgba(148,163,184,0.2)" }}>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:items-center lg:py-20">
              <div className="lg:col-span-6">
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-400">
                  {primaryBranch?.open_hours || "Modern Dining"}
                </p>
                <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  {tenant.tagline || tenant.name}
                </h1>
                {tenant.story && (
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    {tenant.story}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#menu"
                    className="inline-flex h-11 items-center rounded-lg px-6 text-sm font-semibold text-white no-underline"
                    style={{ backgroundColor: tenant.primary_color }}
                  >
                    Jelajahi Buku Menu
                  </a>
                  <a
                    href="#reservasi"
                    className="inline-flex h-11 items-center rounded-lg border border-slate-600 px-6 text-sm font-semibold text-slate-100 no-underline hover:bg-slate-800"
                  >
                    Pesan Meja
                  </a>
                </div>
              </div>
              <div className="lg:col-span-6">
                {heroSrc && (
                  <div className="overflow-hidden rounded-xl border border-slate-800">
                    <img src={heroSrc} alt={tenant.name} className="h-[340px] w-full object-cover sm:h-[420px]" />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {isCafe && (
          <section id="beranda" className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6">
            <div className="overflow-hidden rounded-3xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="flex flex-col justify-center p-8 sm:p-12 lg:col-span-6">
                  <span className="inline-flex w-fit rounded-full px-3.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: "var(--surface-muted)", color: tenant.primary_color }}>
                    {primaryBranch?.open_hours || "Buka Setiap Hari"}
                  </span>
                  <h1 className="font-display mt-3 text-4xl font-bold leading-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
                    {tenant.tagline || tenant.name}
                  </h1>
                  {tenant.story && (
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-body)" }}>
                      {tenant.story}
                    </p>
                  )}
                  <div className="mt-7 flex flex-wrap gap-2.5">
                    <a
                      href="#menu"
                      className="inline-flex h-11 items-center rounded-full px-6 text-xs font-semibold text-white no-underline"
                      style={{ backgroundColor: tenant.primary_color }}
                    >
                      Lihat Menu Hari Ini
                    </a>
                    <a
                      href="#reservasi"
                      className="inline-flex h-11 items-center rounded-full border px-6 text-xs font-semibold no-underline"
                      style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
                    >
                      Reservasi Meja
                    </a>
                  </div>
                </div>
                <div className="min-h-[280px] lg:col-span-6">
                  {heroSrc && <img src={heroSrc} alt={tenant.name} className="h-full w-full object-cover" />}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Editorial Story / Heritage About Section */}
        <section id="cerita" className="border-b py-14 sm:py-16" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: tenant.primary_color }}>
                Tentang {tenant.name}
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl" style={{ color: "var(--ink)" }}>
                Kehangatan Meja Makan untuk Setiap Momen Bersama
              </h2>
              <p className="mt-4 text-sm leading-relaxed sm:text-[15px]" style={{ color: "var(--ink-body)" }}>
                {tenant.story || "Kami menyajikan hidangan pilihan yang dimasak segar setiap hari dengan ruang makan nyaman untuk keluarga dan kolega."}
              </p>
              <div className="mt-7 grid grid-cols-3 gap-4 border-t pt-5" style={{ borderColor: "var(--border)" }}>
                <div>
                  <div className="font-mono text-2xl font-bold" style={{ color: tenant.primary_color }}>{branches.length}</div>
                  <div className="text-xs" style={{ color: "var(--ink-muted)" }}>Cabang Aktif</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold" style={{ color: tenant.primary_color }}>{data.menu_items.length}</div>
                  <div className="text-xs" style={{ color: "var(--ink-muted)" }}>Pilihan Menu</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold" style={{ color: tenant.primary_color }}>{event_packages.length}</div>
                  <div className="text-xs" style={{ color: "var(--ink-muted)" }}>Paket Acara</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              {primaryBranch && (
                <div
                  className={`border p-6 ${isCafe ? "rounded-2xl" : "rounded-xl"}`}
                  style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
                >
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--resto-gold)" }}>
                    Lokasi Utama
                  </div>
                  <div className="mt-2 text-base font-bold" style={{ color: "var(--ink)" }}>{primaryBranch.name}</div>
                  <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--ink-body)" }}>{primaryBranch.address}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
                    <Clock size={13} strokeWidth={1.75} aria-hidden="true" />
                    {primaryBranch.open_hours}
                  </div>
                  {primaryBranch.maps_url && (
                    <a
                      href={primaryBranch.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-xs font-semibold no-underline hover:underline"
                      style={{ color: tenant.primary_color }}
                    >
                      Buka Petunjuk Arah di Google Maps
                      <ExternalLink size={12} strokeWidth={1.75} aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Signature Dishes Visual Strip (if dishes have photos/badges) */}
        {signatureDishes.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: tenant.primary_color }}>
                  Pilihan Koki
                </p>
                <h2 className="font-display mt-1 text-3xl font-bold" style={{ color: "var(--ink)" }}>
                  Hidangan Unggulan
                </h2>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {signatureDishes.map((dish) => {
                const imgSrc = resolveAssetUrl(dish.image_url);
                return (
                  <article
                    key={dish.id}
                    className={`overflow-hidden border ${isCafe ? "rounded-2xl" : "rounded-xl"}`}
                    style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    {imgSrc && (
                      <div className="h-40 w-full overflow-hidden bg-stone-900">
                        <img src={imgSrc} alt={dish.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
                      </div>
                    )}
                    <div className="p-4">
                      {dish.badge && (
                        <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "var(--amber-bg)", color: "var(--amber)" }}>
                          {dish.badge}
                        </span>
                      )}
                      <h3 className="mt-1.5 text-sm font-bold" style={{ color: "var(--ink)" }}>{dish.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--ink-body)" }}>{dish.description}</p>
                      <div className="mt-2.5 font-mono text-sm font-bold" style={{ color: tenant.primary_color }}>
                        {formatRupiah(dish.price)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Buku Menu Online */}
        <section id="menu" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-end" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: tenant.primary_color }}>
                Daftar Hidangan Lengkap
              </p>
              <h2 className="font-display mt-1 text-3xl font-bold sm:text-4xl" style={{ color: "var(--ink)" }}>
                Buku Menu Online
              </h2>
            </div>

            <div className="relative w-full md:w-72">
              <Search size={15} strokeWidth={1.75} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-muted)" }} />
              <input
                type="search"
                value={menuQuery}
                onChange={(e) => setMenuQuery(e.target.value)}
                placeholder="Cari hidangan..."
                className="resto-field h-10 w-full pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Kategori menu">
            <button
              type="button"
              role="tab"
              aria-selected={activeCatId === "all"}
              onClick={() => setActiveCatId("all")}
              className={`h-8 border px-3 text-xs font-semibold transition-colors ${isCafe ? "rounded-full" : "rounded-lg"}`}
              style={{
                backgroundColor: activeCatId === "all" ? tenant.primary_color : "var(--surface)",
                borderColor: activeCatId === "all" ? tenant.primary_color : "var(--border)",
                color: activeCatId === "all" ? "#ffffff" : "var(--ink-body)",
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
                  className={`h-8 border px-3 text-xs font-semibold transition-colors ${isCafe ? "rounded-full" : "rounded-lg"}`}
                  style={{
                    backgroundColor: active ? tenant.primary_color : "var(--surface)",
                    borderColor: active ? tenant.primary_color : "var(--border)",
                    color: active ? "#ffffff" : "var(--ink-body)",
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {filteredMenu.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed p-10 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}>
              Tidak ada hidangan yang cocok dengan pencarian Anda.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredMenu.map((item) => {
                const imgSrc = resolveAssetUrl(item.image_url);
                return (
                  <article
                    key={item.id}
                    className={`flex items-start gap-4 border p-4 ${isCafe ? "rounded-2xl" : "rounded-xl"}`}
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      opacity: item.is_available ? 1 : 0.62,
                    }}
                  >
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className={`h-20 w-24 shrink-0 object-cover sm:h-24 sm:w-28 ${isCafe ? "rounded-xl" : "rounded-lg"}`}
                        loading="lazy"
                      />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                            {item.name}
                          </h3>
                          {item.badge && item.is_available && (
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                              style={{ backgroundColor: "var(--amber-bg)", color: "var(--amber)" }}
                            >
                              {item.badge}
                            </span>
                          )}
                          {!item.is_available && (
                            <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}>
                              Stok Habis
                            </span>
                          )}
                        </div>
                        <div className="shrink-0 font-mono text-sm font-bold" style={{ color: tenant.primary_color }}>
                          {formatRupiah(item.price)}
                        </div>
                      </div>
                      {item.description && (
                        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--ink-body)" }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Promo Berjalan */}
        {promos.length > 0 && (
          <section id="promo" className="border-y py-12 sm:py-16" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: tenant.primary_color }}>
                Penawaran Aktif
              </p>
              <h2 className="font-display mt-1 text-3xl font-bold" style={{ color: "var(--ink)" }}>
                Promo &amp; Paket Hemat
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {promos.map((promo) => {
                  const bannerSrc = resolveAssetUrl(promo.banner_url);
                  return (
                    <div
                      key={promo.id}
                      className={`overflow-hidden border ${isCafe ? "rounded-2xl" : "rounded-xl"}`}
                      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
                    >
                      {bannerSrc && <img src={bannerSrc} alt={promo.title} className="h-44 w-full object-cover" loading="lazy" />}
                      <div className="border-l-4 p-5" style={{ borderLeftColor: tenant.primary_color }}>
                        <h3 className="text-base font-bold" style={{ color: "var(--ink)" }}>
                          {promo.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ink-body)" }}>
                          {promo.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Ruang Privat & Paket Acara */}
        {event_packages.length > 0 && (
          <section id="acara" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: tenant.primary_color }}>
              Jamuan &amp; Ruang Privat
            </p>
            <h2 className="font-display mt-1 text-3xl font-bold sm:text-4xl" style={{ color: "var(--ink)" }}>
              Paket Acara Keluarga &amp; Korporat
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {event_packages.map((pkg) => {
                const roomSrc = resolveAssetUrl(pkg.image_url);
                return (
                  <article
                    key={pkg.id}
                    className={`flex flex-col justify-between overflow-hidden border ${isCafe ? "rounded-2xl" : "rounded-xl"}`}
                    style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <div>
                      {roomSrc && (
                        <img src={roomSrc} alt={pkg.title} className="h-44 w-full object-cover" loading="lazy" />
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 font-medium" style={{ color: "var(--ink-muted)" }}>
                            <Users size={13} strokeWidth={1.75} aria-hidden="true" />
                            {pkg.capacity}
                          </span>
                          <span className="font-mono font-bold" style={{ color: tenant.primary_color }}>
                            {pkg.price_label}
                          </span>
                        </div>
                        <h3 className="mt-2.5 text-base font-bold" style={{ color: "var(--ink)" }}>
                          {pkg.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--ink-body)" }}>
                          {pkg.description}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 pb-5">
                      <button
                        type="button"
                        onClick={() => prefillEvent(pkg.title)}
                        className={`h-9 w-full border text-xs font-semibold transition-colors hover:bg-stone-100 ${isCafe ? "rounded-full" : "rounded-lg"}`}
                        style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
                      >
                        Tanya &amp; Reservasi Paket Ini
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Cabang & Formulir Reservasi */}
        <section id="reservasi" className="border-t py-12 sm:py-16" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12">
            <div id="cabang" className="space-y-4 lg:col-span-5">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: tenant.primary_color }}>
                Lokasi &amp; Kontak
              </p>
              <h2 className="font-display text-3xl font-bold" style={{ color: "var(--ink)" }}>
                Cabang &amp; Jam Buka
              </h2>

              <div className="space-y-3 pt-1">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className={`border p-4 ${isCafe ? "rounded-2xl" : "rounded-xl"}`}
                    style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
                  >
                    <div className="text-sm font-bold" style={{ color: "var(--ink)" }}>{branch.name}</div>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--ink-body)" }}>{branch.address}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-muted)" }}>
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
                          style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}
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
                          Chat WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div
                className={`border p-6 ${isCafe ? "rounded-2xl" : "rounded-xl"}`}
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
              >
                <h2 className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>
                  Formulir Reservasi Meja &amp; Acara
                </h2>
                <p className="mt-1 text-xs" style={{ color: "var(--ink-muted)" }}>
                  Data reservasi tersimpan otomatis di daftar cabang dan langsung terhubung ke WhatsApp admin untuk konfirmasi meja.
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
                    <p className="mt-1 text-xs" style={{ color: "var(--ink-body)" }}>
                      Lanjutkan ke WhatsApp cabang agar tim kami segera mengonfirmasi ketersediaan meja Anda.
                    </p>
                    {resSuccess.waUrl && (
                      <a
                        href={resSuccess.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-white no-underline"
                        style={{ backgroundColor: "var(--emerald)" }}
                      >
                        <MessageCircle size={14} strokeWidth={1.75} aria-hidden="true" />
                        Kirim Pesan Reservasi via WhatsApp
                      </a>
                    )}
                  </div>
                )}

                <form onSubmit={(e) => void handleReserve(e)} className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="res-name" className="mb-1 block text-xs font-semibold" style={{ color: "var(--ink-body)" }}>
                      Nama Pemesan
                    </label>
                    <input
                      id="res-name"
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Contoh: Ibu Ratna"
                      className="resto-field h-10 w-full px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-phone" className="mb-1 block text-xs font-semibold" style={{ color: "var(--ink-body)" }}>
                      Nomor WhatsApp
                    </label>
                    <input
                      id="res-phone"
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="resto-field h-10 w-full px-3 text-sm"
                    />
                  </div>
                  {branches.length > 0 && (
                    <div>
                      <label htmlFor="res-branch" className="mb-1 block text-xs font-semibold" style={{ color: "var(--ink-body)" }}>
                        Pilih Cabang
                      </label>
                      <select
                        id="res-branch"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        className="resto-field resto-select h-10 w-full pl-3 text-sm"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label htmlFor="res-dt" className="mb-1 block text-xs font-semibold" style={{ color: "var(--ink-body)" }}>
                      Tanggal &amp; Jam
                    </label>
                    <input
                      id="res-dt"
                      type="datetime-local"
                      required
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="resto-field h-10 w-full px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-pax" className="mb-1 block text-xs font-semibold" style={{ color: "var(--ink-body)" }}>
                      Jumlah Tamu (Orang)
                    </label>
                    <input
                      id="res-pax"
                      type="number"
                      min={1}
                      max={300}
                      required
                      value={pax}
                      onChange={(e) => setPax(Number(e.target.value))}
                      className="resto-field h-10 w-full px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-type" className="mb-1 block text-xs font-semibold" style={{ color: "var(--ink-body)" }}>
                      Keperluan / Acara
                    </label>
                    <input
                      id="res-type"
                      type="text"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="resto-field h-10 w-full px-3 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="res-notes" className="mb-1 block text-xs font-semibold" style={{ color: "var(--ink-body)" }}>
                      Catatan Tambahan (opsional)
                    </label>
                    <textarea
                      id="res-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: minta meja bundar dekat jendela atau kursi bayi"
                      className="resto-field w-full p-3 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`h-11 w-full text-sm font-semibold text-white transition-opacity hover:opacity-90 ${isCafe ? "rounded-full" : "rounded-lg"}`}
                      style={{ backgroundColor: tenant.primary_color }}
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

      <footer
        className="border-t py-7"
        style={{
          borderColor: isBistro ? "rgba(148,163,184,0.2)" : "var(--border)",
          backgroundColor: isBistro ? "#0f172a" : "var(--bg)",
          color: isBistro ? "#94a3b8" : "var(--ink-muted)",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-xs sm:px-6">
          <span className="font-semibold" style={{ color: isBistro ? "#f8fafc" : "var(--ink)" }}>
            {tenant.name}
          </span>
          <span>
            Didukung oleh{" "}
            <a
              href="https://reneo.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
              style={{ color: isBistro ? "#e2e8f0" : "var(--ink-body)" }}
            >
              Reneo Resto
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
