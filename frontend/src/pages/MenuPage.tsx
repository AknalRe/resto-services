import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Flame, MessageCircle, Search, UtensilsCrossed } from "lucide-react";
import { api, formatRupiah, resolveAssetUrl } from "../lib/api";
import {
  ALL_THEME_PRESETS,
  getStorefrontPaths,
  normalizeThemePreset,
  PREVIEW_META,
} from "../lib/storefrontTheme";
import type { StorefrontPayload, ThemePreset } from "../types";

interface MenuPageProps {
  forcedSlug?: string;
  previewPreset?: ThemePreset;
  isCustomDomain?: boolean;
}

const THEME_PALETTE: Record<
  ThemePreset,
  {
    pageBg: string;
    surfaceBg: string;
    barBg: string;
    textMain: string;
    textBody: string;
    textMuted: string;
    borderCol: string;
    radius: string;
  }
> = {
  banquet: {
    pageBg: "#FAF6EE",
    surfaceBg: "#FFFFFF",
    barBg: "rgba(250,246,238,0.95)",
    textMain: "#1F1612",
    textBody: "#4E413A",
    textMuted: "#7C6E65",
    borderCol: "rgba(184,134,11,0.28)",
    radius: "6px",
  },
  bistro: {
    pageBg: "#0B0C0E",
    surfaceBg: "#14161A",
    barBg: "rgba(11,12,14,0.94)",
    textMain: "#F8FAFC",
    textBody: "#CBD5E1",
    textMuted: "#94A3B8",
    borderCol: "rgba(255,255,255,0.12)",
    radius: "2px",
  },
  cafe: {
    pageBg: "#F8F4EC",
    surfaceBg: "#FFFFFF",
    barBg: "rgba(248,244,236,0.95)",
    textMain: "#2E2219",
    textBody: "#5C4B3E",
    textMuted: "#8A7766",
    borderCol: "rgba(46,34,25,0.12)",
    radius: "9999px",
  },
  omakase: {
    pageBg: "#F5F2EB",
    surfaceBg: "#FFFFFF",
    barBg: "rgba(245,242,235,0.95)",
    textMain: "#181A1F",
    textBody: "#52555D",
    textMuted: "#7A7D85",
    borderCol: "rgba(24,26,31,0.12)",
    radius: "0px",
  },
  coastal: {
    pageBg: "#F8FBFD",
    surfaceBg: "#FFFFFF",
    barBg: "rgba(248,251,253,0.95)",
    textMain: "#0E2A3F",
    textBody: "#4E6B80",
    textMuted: "#6B8699",
    borderCol: "rgba(15,76,117,0.14)",
    radius: "12px",
  },
  street: {
    pageBg: "#FFF8EB",
    surfaceBg: "#FFFFFF",
    barBg: "rgba(255,248,235,0.96)",
    textMain: "#181512",
    textBody: "#4A4036",
    textMuted: "#6E6256",
    borderCol: "#181512",
    radius: "8px",
  },
};

export function MenuPage({ forcedSlug, previewPreset, isCustomDomain }: MenuPageProps) {
  const params = useParams<{ slug: string }>();
  const slug = forcedSlug || params.slug || "";

  const [data, setData] = useState<StorefrontPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCatId, setActiveCatId] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [onlyRecommended, setOnlyRecommended] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api
      .getStorefront(slug)
      .then((res) => setData(res))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat buku menu."))
      .finally(() => setLoading(false));
  }, [slug]);

  const activePreset: ThemePreset = previewPreset || normalizeThemePreset(data?.tenant.theme_preset);
  const accentColor = previewPreset ? PREVIEW_META[previewPreset].color : data?.tenant.primary_color || "#8B1E24";

  useEffect(() => {
    document.documentElement.setAttribute("data-preset", activePreset);
    document.documentElement.style.setProperty("--resto-primary", accentColor);
    window.scrollTo({ top: 0 });
    return () => {
      document.documentElement.removeAttribute("data-preset");
    };
  }, [activePreset, accentColor]);

  const { homePath } = getStorefrontPaths(slug, previewPreset, isCustomDomain);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.menu_items.filter((item) => {
      if (activeCatId !== "all" && item.category_id !== activeCatId) return false;
      if (onlyRecommended && !item.badge) return false;
      if (q && !`${item.name} ${item.description} ${item.badge}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, activeCatId, query, onlyRecommended]);

  const groupedCategories = useMemo(() => {
    if (!data) return [];
    const cats = activeCatId === "all" ? data.categories : data.categories.filter((c) => c.id === activeCatId);
    return cats
      .map((cat) => ({
        category: cat,
        items: filteredItems.filter((item) => item.category_id === cat.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [data, activeCatId, filteredItems]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm" style={{ color: "var(--ink-muted)" }}>
        Membuka buku menu...
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-3xl font-bold">Buku Menu Tidak Ditemukan</h1>
        <p className="mt-2 text-sm opacity-75">{error || "Data menu tidak tersedia."}</p>
        <Link
          to={homePath}
          className="mt-5 inline-flex h-10 items-center rounded-lg px-4 text-xs font-semibold text-white no-underline"
          style={{ backgroundColor: "#0B2A57" }}
        >
          Kembali ke Beranda Restoran
        </Link>
      </main>
    );
  }

  const { tenant, branches, categories } = data;
  const primaryBranch = branches[0];
  const displayName = previewPreset ? PREVIEW_META[previewPreset].sampleTitle : tenant.name;
  const waHref = primaryBranch?.whatsapp_number
    ? `https://wa.me/${primaryBranch.whatsapp_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Halo ${displayName}, saya ingin bertanya tentang menu dan reservasi.`
      )}`
    : null;

  const palette = THEME_PALETTE[activePreset];
  const isBistro = activePreset === "bistro";
  const isCafe = activePreset === "cafe";
  const isStreet = activePreset === "street";
  const isBanquet = activePreset === "banquet";

  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.pageBg, color: palette.textMain }}>
      {/* Preview switcher bar ONLY in /preview/:preset/menu */}
      {previewPreset && (
        <div className="border-b px-3 py-2 text-xs text-white sm:px-4" style={{ backgroundColor: "#0B2A57", borderColor: "rgba(255,255,255,0.15)" }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <span className="hidden opacity-80 sm:inline">Tema Menu:</span>
              {ALL_THEME_PRESETS.map((p) => (
                <Link
                  key={p}
                  to={`/preview/${p}/menu`}
                  className="rounded px-2.5 py-1 text-[11px] font-semibold no-underline transition"
                  style={{
                    backgroundColor: previewPreset === p ? "#FFFFFF" : "rgba(255,255,255,0.14)",
                    color: previewPreset === p ? "#0B2A57" : "#FFFFFF",
                  }}
                >
                  {PREVIEW_META[p].shortLabel}
                </Link>
              ))}
            </div>
            <Link to="/" className="inline-flex shrink-0 items-center gap-1 font-semibold text-amber-300 no-underline hover:underline">
              <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
              <span className="hidden sm:inline">Beranda</span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Sticky Menu Header */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          backgroundColor: palette.barBg,
          borderColor: palette.borderCol,
          borderBottomWidth: isStreet ? "2px" : "1px",
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            to={homePath}
            className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold no-underline transition hover:opacity-80"
            style={{ color: palette.textMain }}
          >
            <ArrowLeft size={15} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{displayName}</span>
          </Link>

          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 px-3.5 text-xs font-semibold text-white no-underline"
              style={{ backgroundColor: accentColor, borderRadius: palette.radius }}
            >
              <MessageCircle size={14} strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden sm:inline">Pesan / Reservasi</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          )}
        </div>
      </header>

      {/* Menu Book Intro */}
      <section className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 sm:pt-10">
        <div className={isBanquet ? "mx-auto max-w-2xl text-center" : "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"}>
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
              Daftar Hidangan Lengkap
            </p>
            <h1 className={isBistro || isStreet ? "mt-1.5 text-3xl font-black uppercase tracking-tight sm:text-4xl" : "mt-1.5 font-display text-4xl font-bold sm:text-5xl"}>
              Buku Menu {displayName}
            </h1>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: palette.textMuted }}>
            {data.menu_items.length} sajian tersedia dari dapur kami.
          </p>
        </div>
      </section>

      {/* STICKY Search & Category Filter Bar */}
      <div
        className="sticky top-14 z-20 border-y backdrop-blur-md"
        style={{
          backgroundColor: palette.barBg,
          borderColor: palette.borderCol,
          borderTopWidth: isStreet ? "2px" : "1px",
          borderBottomWidth: isStreet ? "2px" : "1px",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveCatId("all")}
              className="h-9 shrink-0 px-3.5 text-xs font-semibold transition"
              style={{
                borderRadius: palette.radius,
                backgroundColor: activeCatId === "all" ? accentColor : palette.surfaceBg,
                color: activeCatId === "all" ? "#FFFFFF" : palette.textMain,
                border: `${isStreet ? "2px" : "1px"} solid ${activeCatId === "all" ? (isStreet ? "#181512" : accentColor) : palette.borderCol}`,
              }}
            >
              Semua ({data.menu_items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCatId(cat.id)}
                className="h-9 shrink-0 px-3.5 text-xs font-semibold transition"
                style={{
                  borderRadius: palette.radius,
                  backgroundColor: activeCatId === cat.id ? accentColor : palette.surfaceBg,
                  color: activeCatId === cat.id ? "#FFFFFF" : palette.textMain,
                  border: `${isStreet ? "2px" : "1px"} solid ${activeCatId === cat.id ? (isStreet ? "#181512" : accentColor) : palette.borderCol}`,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyRecommended((v) => !v)}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 px-3 text-xs font-semibold transition"
              style={{
                borderRadius: palette.radius,
                backgroundColor: onlyRecommended ? accentColor : palette.surfaceBg,
                color: onlyRecommended ? "#FFFFFF" : palette.textBody,
                border: `${isStreet ? "2px" : "1px"} solid ${onlyRecommended ? (isStreet ? "#181512" : accentColor) : palette.borderCol}`,
              }}
            >
              <Flame size={13} strokeWidth={1.75} aria-hidden="true" />
              Terlaris
            </button>
            <div className="relative flex-1 sm:w-56 sm:flex-none">
              <Search
                size={14}
                strokeWidth={1.75}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: palette.textMuted }}
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari menu..."
                className="h-9 w-full pl-9 pr-3 text-xs focus:outline-none"
                style={{
                  borderRadius: palette.radius,
                  backgroundColor: palette.surfaceBg,
                  color: palette.textMain,
                  border: `${isStreet ? "2px" : "1px"} solid ${palette.borderCol}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        {groupedCategories.length === 0 ? (
          <div
            className="border p-12 text-center text-sm"
            style={{
              borderRadius: isCafe ? "24px" : palette.radius,
              backgroundColor: palette.surfaceBg,
              borderColor: palette.borderCol,
              color: palette.textMuted,
            }}
          >
            Tidak ada hidangan yang cocok dengan pencarian Anda.
          </div>
        ) : (
          <div className="space-y-12">
            {groupedCategories.map(({ category, items }) => (
              <section key={category.id}>
                <div className="mb-5 flex items-center gap-4">
                  <h2 className={isBistro || isStreet ? "text-lg font-black uppercase tracking-[0.08em]" : "font-display text-3xl font-bold"}>
                    {category.name}
                  </h2>
                  <div className="h-px flex-1" style={{ backgroundColor: palette.borderCol }} />
                  <span className="font-mono text-xs" style={{ color: palette.textMuted }}>
                    {items.length} sajian
                  </span>
                </div>

                {/* Dotted-leader book for Banquet & Omakase */}
                {isBanquet || activePreset === "omakase" ? (
                  <div
                    className="border p-5 sm:p-8"
                    style={{
                      backgroundColor: palette.surfaceBg,
                      borderColor: palette.borderCol,
                      borderRadius: palette.radius,
                    }}
                  >
                    <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                      {items.map((item) => {
                        const img = resolveAssetUrl(item.image_url);
                        return (
                          <article key={item.id} className="flex gap-4">
                            {img && (
                              <img
                                src={img}
                                alt={item.name}
                                className="h-20 w-20 shrink-0 object-cover"
                                style={{ borderRadius: palette.radius }}
                                loading="lazy"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <h3 className="font-display text-xl font-bold leading-snug">{item.name}</h3>
                                <span className="flex-1 border-b border-dotted" style={{ borderColor: palette.borderCol }} />
                                <span className="shrink-0 font-mono text-sm font-bold" style={{ color: accentColor }}>
                                  {formatRupiah(item.price)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="mt-1 text-xs leading-relaxed" style={{ color: palette.textBody }}>
                                  {item.description}
                                </p>
                              )}
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {item.badge && (
                                  <span
                                    className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                                    style={{ backgroundColor: "rgba(184,134,11,0.14)", color: accentColor, borderRadius: palette.radius }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                {!item.is_available && (
                                  <span className="bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                                    Habis
                                  </span>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ) : isCafe ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => {
                      const img = resolveAssetUrl(item.image_url);
                      return (
                        <article
                          key={item.id}
                          className="flex flex-col overflow-hidden rounded-3xl border bg-white p-3 transition hover:shadow-md"
                          style={{ borderColor: palette.borderCol }}
                        >
                          {img ? (
                            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#F0E8DC]">
                              <img src={img} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                              {item.badge && (
                                <span
                                  className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
                                  style={{ backgroundColor: accentColor }}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex h-12 items-center justify-between rounded-2xl bg-[#F8F4EC] px-3">
                              <UtensilsCrossed size={15} style={{ color: palette.textMuted }} />
                              {item.badge && (
                                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: accentColor }}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex flex-1 flex-col justify-between p-2.5">
                            <div>
                              <h3 className="font-display text-xl font-bold leading-snug">{item.name}</h3>
                              {item.description && (
                                <p className="mt-1 text-xs leading-relaxed" style={{ color: palette.textBody }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="mt-3 flex items-center justify-between pt-2">
                              <span className="font-mono text-sm font-bold" style={{ color: accentColor }}>
                                {formatRupiah(item.price)}
                              </span>
                              {!item.is_available && (
                                <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-[10px] font-semibold text-stone-600">
                                  Habis
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((item) => {
                      const img = resolveAssetUrl(item.image_url);
                      return (
                        <article
                          key={item.id}
                          className="flex gap-4 p-4 transition"
                          style={{
                            backgroundColor: palette.surfaceBg,
                            border: `${isStreet ? "2px" : "1px"} solid ${palette.borderCol}`,
                            borderRadius: palette.radius,
                            boxShadow: isStreet ? "4px 4px 0 #181512" : undefined,
                          }}
                        >
                          {img && (
                            <img
                              src={img}
                              alt={item.name}
                              className="h-24 w-24 shrink-0 object-cover"
                              style={{ borderRadius: palette.radius }}
                              loading="lazy"
                            />
                          )}
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <h3 className={isBistro || isStreet ? "text-sm font-bold uppercase tracking-wide" : "font-display text-xl font-bold"}>
                                  {item.name}
                                </h3>
                                <span className="shrink-0 font-mono text-sm font-bold" style={{ color: accentColor }}>
                                  {formatRupiah(item.price)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: palette.textBody }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="mt-2.5 flex items-center gap-2">
                              {item.badge && (
                                <span
                                  className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase"
                                  style={{
                                    backgroundColor: isBistro ? "rgba(217,119,54,0.18)" : isStreet ? "#F6C945" : "rgba(15,76,117,0.1)",
                                    color: isBistro ? "#F0A46C" : isStreet ? "#181512" : accentColor,
                                    borderRadius: palette.radius,
                                  }}
                                >
                                  {item.badge}
                                </span>
                              )}
                              {!item.is_available && (
                                <span className="bg-stone-500/20 px-2 py-0.5 font-mono text-[10px] uppercase">
                                  Habis
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
