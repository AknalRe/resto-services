import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  MessageCircle,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { api, formatRupiah, resolveAssetUrl } from "../lib/api";
import { getStorefrontPaths, PREVIEW_META } from "../lib/storefrontTheme";
import type { StorefrontPayload, ThemePreset } from "../types";

interface MenuPageProps {
  forcedSlug?: string;
  previewPreset?: ThemePreset;
  isCustomDomain?: boolean;
}

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

  const activePreset: ThemePreset = previewPreset || data?.tenant.theme_preset || "heritage";
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

  const isHeritage = activePreset === "heritage";
  const isBistro = activePreset === "bistro";
  const isCafe = activePreset === "cafe";

  const pageBg = isBistro ? "#0B0C0E" : isCafe ? "#F8F4EC" : "#FAF6EE";
  const surfaceBg = isBistro ? "#14161A" : "#FFFFFF";
  const textMain = isBistro ? "#F8FAFC" : isCafe ? "#2E2219" : "#1F1612";
  const textBody = isBistro ? "#CBD5E1" : isCafe ? "#5C4B3E" : "#4E413A";
  const textMuted = isBistro ? "#94A3B8" : isCafe ? "#8A7766" : "#7C6E65";
  const borderCol = isBistro ? "rgba(255,255,255,0.11)" : "rgba(31,22,18,0.12)";

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg, color: textMain }}>
      {/* Preview switcher bar ONLY in /preview/:preset/menu */}
      {previewPreset && (
        <div className="border-b px-4 py-2 text-xs text-white" style={{ backgroundColor: "#0B2A57", borderColor: "rgba(255,255,255,0.15)" }}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="opacity-80">Pratinjau Buku Menu:</span>
              {(["heritage", "bistro", "cafe"] as ThemePreset[]).map((p) => (
                <Link
                  key={p}
                  to={`/preview/${p}/menu`}
                  className="rounded px-2.5 py-1 text-[11px] font-semibold no-underline transition"
                  style={{
                    backgroundColor: previewPreset === p ? "#FFFFFF" : "rgba(255,255,255,0.12)",
                    color: previewPreset === p ? "#0B2A57" : "#FFFFFF",
                  }}
                >
                  {PREVIEW_META[p].shortLabel}
                </Link>
              ))}
            </div>
            <Link to="/" className="inline-flex items-center gap-1 font-semibold text-amber-300 no-underline hover:underline">
              <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
              Beranda Reneo Resto
            </Link>
          </div>
        </div>
      )}

      {/* Top Sticky Menu Bar */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          backgroundColor: isBistro ? "rgba(11,12,14,0.92)" : isCafe ? "rgba(248,244,236,0.94)" : "rgba(250,246,238,0.95)",
          borderColor: borderCol,
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Link
            to={homePath}
            className="inline-flex items-center gap-2 text-xs font-semibold no-underline transition hover:opacity-80"
            style={{ color: textMain }}
          >
            <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" />
            <span>{displayName}</span>
          </Link>

          <div className="flex items-center gap-2">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 px-3.5 text-xs font-semibold text-white no-underline"
                style={{
                  backgroundColor: accentColor,
                  borderRadius: isCafe ? "9999px" : isBistro ? "2px" : "6px",
                }}
              >
                <MessageCircle size={14} strokeWidth={1.75} aria-hidden="true" />
                Pesan / Reservasi
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Menu Book Header styled per theme */}
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
        {isHeritage && (
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em]" style={{ color: "#B8860B" }}>
              Daftar Hidangan Lengkap
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Buku Menu {displayName}</h1>
            <div className="mx-auto mt-4 h-px w-24" style={{ backgroundColor: "#B8860B" }} />
            <p className="mt-3 text-sm" style={{ color: textBody }}>
              Seluruh sajian dimasak segar per pesanan. Harga belum termasuk pajak layanan jika berlaku.
            </p>
          </div>
        )}

        {isBistro && (
          <div className="flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: borderCol }}>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: accentColor }}>
                KITCHEN & GRILL MENU
              </p>
              <h1 className="mt-2 text-3xl font-bold uppercase tracking-[0.06em] sm:text-5xl">Buku Menu</h1>
            </div>
            <p className="max-w-sm text-xs leading-relaxed" style={{ color: textMuted }}>
              {data.menu_items.length} hidangan aktif tersedia dari dapur {displayName}.
            </p>
          </div>
        )}

        {isCafe && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: "rgba(47,72,62,0.12)", color: "#2F483E" }}
              >
                <UtensilsCrossed size={12} strokeWidth={1.75} aria-hidden="true" />
                Menu Lengkap Hari Ini
              </span>
              <h1 className="mt-2.5 font-display text-4xl font-bold sm:text-5xl">Pilih Hidangan Favoritmu</h1>
            </div>
            <p className="text-sm" style={{ color: textBody }}>
              Tersedia untuk makan di tempat maupun bawa pulang.
            </p>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="mt-7 flex flex-col gap-3 md:mt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveCatId("all")}
              className="h-10 shrink-0 px-4 text-xs font-semibold transition sm:h-9"
              style={{
                borderRadius: isCafe ? "9999px" : isBistro ? "2px" : "6px",
                backgroundColor: activeCatId === "all" ? accentColor : surfaceBg,
                color: activeCatId === "all" ? "#FFFFFF" : textMain,
                border: `1px solid ${activeCatId === "all" ? accentColor : borderCol}`,
              }}
            >
              Semua ({data.menu_items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCatId(cat.id)}
                className="h-10 shrink-0 px-4 text-xs font-semibold transition sm:h-9"
                style={{
                  borderRadius: isCafe ? "9999px" : isBistro ? "2px" : "6px",
                  backgroundColor: activeCatId === cat.id ? accentColor : surfaceBg,
                  color: activeCatId === cat.id ? "#FFFFFF" : textMain,
                  border: `1px solid ${activeCatId === cat.id ? accentColor : borderCol}`,
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
              className="inline-flex h-10 shrink-0 items-center gap-1.5 px-3.5 text-xs font-semibold transition sm:h-9"
              style={{
                borderRadius: isCafe ? "9999px" : isBistro ? "2px" : "6px",
                backgroundColor: onlyRecommended ? accentColor : surfaceBg,
                color: onlyRecommended ? "#FFFFFF" : textBody,
                border: `1px solid ${onlyRecommended ? accentColor : borderCol}`,
              }}
            >
              <Flame size={13} strokeWidth={1.75} aria-hidden="true" />
              Terlaris
            </button>
            <div className="relative flex-1 sm:w-60 sm:flex-none">
              <Search
                size={14}
                strokeWidth={1.75}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: textMuted }}
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari menu..."
                className="h-10 w-full pl-9 pr-3 text-xs focus:outline-none sm:h-9"
                style={{
                  borderRadius: isCafe ? "9999px" : isBistro ? "2px" : "6px",
                  backgroundColor: surfaceBg,
                  color: textMain,
                  border: `1px solid ${borderCol}`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Menu Content per Theme */}
      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {groupedCategories.length === 0 ? (
          <div
            className="border p-12 text-center text-sm"
            style={{
              borderRadius: isCafe ? "24px" : isBistro ? "2px" : "8px",
              backgroundColor: surfaceBg,
              borderColor: borderCol,
              color: textMuted,
            }}
          >
            Tidak ada hidangan yang cocok dengan pencarian Anda.
          </div>
        ) : (
          <div className="space-y-12">
            {groupedCategories.map(({ category, items }) => (
              <section key={category.id}>
                {/* Category Heading */}
                {isHeritage && (
                  <div className="mb-6 flex items-center gap-4">
                    <h2 className="font-display text-3xl font-bold">{category.name}</h2>
                    <div className="h-px flex-1" style={{ backgroundColor: "rgba(184,134,11,0.35)" }} />
                    <span className="font-mono text-xs" style={{ color: textMuted }}>
                      {items.length} sajian
                    </span>
                  </div>
                )}

                {isBistro && (
                  <div className="mb-5 flex items-baseline justify-between border-b pb-2.5" style={{ borderColor: borderCol }}>
                    <h2 className="text-lg font-bold uppercase tracking-[0.14em]" style={{ color: accentColor }}>
                      {category.name}
                    </h2>
                    <span className="font-mono text-[11px]" style={{ color: textMuted }}>
                      {String(items.length).padStart(2, "0")} ITEMS
                    </span>
                  </div>
                )}

                {isCafe && (
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-display text-3xl font-bold">{category.name}</h2>
                    <span className="text-xs font-medium" style={{ color: textMuted }}>
                      {items.length} pilihan
                    </span>
                  </div>
                )}

                {/* HERITAGE: Classic Dotted-Leader Banquet Book */}
                {isHeritage && (
                  <div
                    className="rounded-lg border p-5 sm:p-8"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(184,134,11,0.32)" }}
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
                                className="h-20 w-20 shrink-0 rounded-md object-cover"
                                loading="lazy"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <h3 className="font-display text-xl font-bold leading-snug">{item.name}</h3>
                                <span className="flex-1 border-b border-dotted" style={{ borderColor: "rgba(31,22,18,0.22)" }} />
                                <span className="shrink-0 font-mono text-sm font-bold" style={{ color: accentColor }}>
                                  {formatRupiah(item.price)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="mt-1 text-xs leading-relaxed" style={{ color: textBody }}>
                                  {item.description}
                                </p>
                              )}
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {item.badge && (
                                  <span
                                    className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                                    style={{ backgroundColor: "rgba(184,134,11,0.14)", color: "#8C6306" }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                {!item.is_available && (
                                  <span className="rounded bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
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
                )}

                {/* BISTRO: Sharp Dark Editorial Rows */}
                {isBistro && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((item) => {
                      const img = resolveAssetUrl(item.image_url);
                      return (
                        <article
                          key={item.id}
                          className="flex gap-4 border p-4 transition hover:border-white/25"
                          style={{ backgroundColor: surfaceBg, borderColor: borderCol }}
                        >
                          {img && (
                            <img
                              src={img}
                              alt={item.name}
                              className="h-24 w-24 shrink-0 object-cover"
                              loading="lazy"
                            />
                          )}
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-white">{item.name}</h3>
                                <span className="shrink-0 font-mono text-sm font-bold" style={{ color: accentColor }}>
                                  {formatRupiah(item.price)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: textMuted }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="mt-2.5 flex items-center gap-2">
                              {item.badge && (
                                <span className="border border-[#D97736]/40 px-2 py-0.5 font-mono text-[10px] uppercase text-[#F0A46C]">
                                  {item.badge}
                                </span>
                              )}
                              {!item.is_available && (
                                <span className="bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase text-slate-400">
                                  Sold Out
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* CAFE: Airy Rounded Photo Cards */}
                {isCafe && (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => {
                      const img = resolveAssetUrl(item.image_url);
                      return (
                        <article
                          key={item.id}
                          className="flex flex-col overflow-hidden rounded-3xl border bg-white p-3 transition hover:shadow-md"
                          style={{ borderColor: borderCol }}
                        >
                          {img && (
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
                          )}
                          <div className="flex flex-1 flex-col justify-between p-2.5">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-display text-xl font-bold leading-snug">{item.name}</h3>
                                {!img && item.badge && (
                                  <span
                                    className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                                    style={{ backgroundColor: "rgba(47,72,62,0.12)", color: "#2F483E" }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="mt-1 text-xs leading-relaxed" style={{ color: textBody }}>
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
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
