import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api, resolveAssetUrl } from "../lib/api";
import {
  ALL_THEME_PRESETS,
  getStorefrontPaths,
  normalizeThemePreset,
  PREVIEW_META,
} from "../lib/storefrontTheme";
import { HeritageTemplate } from "../components/storefront/HeritageTemplate";
import { BistroTemplate } from "../components/storefront/BistroTemplate";
import { CafeTemplate } from "../components/storefront/CafeTemplate";
import { OmakaseTemplate } from "../components/storefront/OmakaseTemplate";
import { CoastalTemplate } from "../components/storefront/CoastalTemplate";
import { StreetTemplate } from "../components/storefront/StreetTemplate";
import type { StorefrontPayload, ThemePreset } from "../types";

interface StorefrontPageProps {
  forcedSlug?: string;
  previewPreset?: ThemePreset;
  isCustomDomain?: boolean;
}

export function StorefrontPage({ forcedSlug, previewPreset, isCustomDomain }: StorefrontPageProps) {
  const params = useParams<{ slug: string }>();
  const slug = forcedSlug || params.slug || "";

  const [data, setData] = useState<StorefrontPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api
      .getStorefront(slug)
      .then((res) => setData(res))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat halaman restoran."))
      .finally(() => setLoading(false));
  }, [slug]);

  const activePreset: ThemePreset = previewPreset || normalizeThemePreset(data?.tenant.theme_preset);
  const accentColor = previewPreset ? PREVIEW_META[previewPreset].color : data?.tenant.primary_color || "#8B1E24";

  useEffect(() => {
    document.documentElement.setAttribute("data-preset", activePreset);
    document.documentElement.style.setProperty("--resto-primary", accentColor);
    return () => {
      document.documentElement.removeAttribute("data-preset");
    };
  }, [activePreset, accentColor]);

  const bestSellers = useMemo(() => {
    if (!data) return [];
    const available = data.menu_items.filter((item) => item.is_available);
    const prioritized = [
      ...available.filter((item) => Boolean(item.badge) && Boolean(item.image_url)),
      ...available.filter((item) => Boolean(item.badge) && !item.image_url),
      ...available.filter((item) => !item.badge && Boolean(item.image_url)),
      ...available.filter((item) => !item.badge && !item.image_url),
    ];
    const seen = new Set<number>();
    const picked = prioritized
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, 4);

    if (previewPreset && previewPreset !== "banquet") {
      const sampleImgs = PREVIEW_META[previewPreset].sampleGallery;
      return picked.map((item, idx) => ({
        ...item,
        image_url: sampleImgs[idx % sampleImgs.length] || item.image_url,
      }));
    }
    return picked;
  }, [data, previewPreset]);

  const galleryImages = useMemo(() => {
    if (previewPreset) {
      return PREVIEW_META[previewPreset].sampleGallery.map((url) => resolveAssetUrl(url));
    }
    if (!data) return [];
    const urls = [
      ...data.menu_items.map((m) => m.image_url),
      ...data.event_packages.map((e) => e.image_url),
      data.tenant.hero_image_url,
    ]
      .filter(Boolean)
      .map((u) => resolveAssetUrl(u));
    return Array.from(new Set(urls)).slice(0, 3);
  }, [data, previewPreset]);

  const heroImages = useMemo(() => {
    if (previewPreset) {
      const list = [PREVIEW_META[previewPreset].sampleHero, ...PREVIEW_META[previewPreset].sampleGallery];
      return Array.from(new Set(list)).map((u) => resolveAssetUrl(u));
    }
    if (!data) return [];
    const fromArray = Array.isArray(data.tenant.hero_images) ? data.tenant.hero_images.filter(Boolean) : [];
    const list = fromArray.length > 0 ? fromArray : data.tenant.hero_image_url ? [data.tenant.hero_image_url] : [];
    return list.map((u) => resolveAssetUrl(u));
  }, [data, previewPreset]);

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
        <Link
          to="/"
          className="mt-5 inline-flex h-10 items-center rounded-lg px-4 text-xs font-semibold text-white no-underline"
          style={{ backgroundColor: "#0B2A57" }}
        >
          Kembali ke Beranda Reneo Resto
        </Link>
      </main>
    );
  }

  const { menuPath } = getStorefrontPaths(slug, previewPreset, isCustomDomain);
  const displayName = previewPreset ? PREVIEW_META[previewPreset].sampleTitle : data.tenant.name;
  const displayTagline = previewPreset ? PREVIEW_META[previewPreset].sampleTagline : data.tenant.tagline;
  const displayStory = previewPreset
    ? PREVIEW_META[previewPreset].sampleStory
    : data.tenant.story || PREVIEW_META[activePreset].sampleStory;

  const heroTransition = previewPreset
    ? previewPreset === "bistro" || previewPreset === "street"
      ? "slide"
      : previewPreset === "omakase" || previewPreset === "banquet"
        ? "zoom"
        : "fade"
    : data?.tenant.hero_transition || "fade";

  const heroIntervalMs = previewPreset ? 4500 : (data?.tenant.hero_interval_ms ?? 5000);

  const heroImageUrl = heroImages[0] || "";

  const templateProps = {
    data,
    slug,
    displayName,
    displayTagline,
    displayStory,
    accentColor,
    heroImageUrl,
    heroImages,
    heroTransition,
    heroIntervalMs,
    galleryImages,
    menuPath,
    bestSellers,
    isPreview: Boolean(previewPreset),
  };

  return (
    <>
      {/* Preview switcher bar ONLY on /preview/:preset (never shown to real customers on /r/:slug or custom domains) */}
      {previewPreset && (
        <div className="border-b px-3 py-2 text-xs text-white sm:px-4" style={{ backgroundColor: "#0B2A57", borderColor: "rgba(255,255,255,0.15)" }}>
          <div className="mx-auto flex max-w-6xl items-center gap-2.5">
            <Link
              to="/"
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded bg-white/10 px-2.5 font-semibold text-amber-300 no-underline hover:bg-white/20"
            >
              <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
              <span>Kembali</span>
            </Link>
            <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto whitespace-nowrap">
              {ALL_THEME_PRESETS.map((p) => (
                <Link
                  key={p}
                  to={`/preview/${p}`}
                  className="inline-flex h-8 shrink-0 items-center rounded px-3 text-[11px] font-semibold no-underline transition"
                  style={{
                    backgroundColor: previewPreset === p ? "#FFFFFF" : "rgba(255,255,255,0.14)",
                    color: previewPreset === p ? "#0B2A57" : "#FFFFFF",
                  }}
                >
                  {PREVIEW_META[p].shortLabel}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {activePreset === "bistro" ? (
        <BistroTemplate {...templateProps} />
      ) : activePreset === "cafe" ? (
        <CafeTemplate {...templateProps} />
      ) : activePreset === "omakase" ? (
        <OmakaseTemplate {...templateProps} />
      ) : activePreset === "coastal" ? (
        <CoastalTemplate {...templateProps} />
      ) : activePreset === "street" ? (
        <StreetTemplate {...templateProps} />
      ) : (
        <HeritageTemplate {...templateProps} />
      )}
    </>
  );
}
