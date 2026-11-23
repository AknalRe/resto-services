import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Menu,
  Phone,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { formatRupiah, resolveAssetUrl } from "../../lib/api";
import { useScrolledPast } from "../../hooks/useScrolledPast";
import { HeroBannerSlider } from "./HeroBannerSlider";
import { ReservationForm } from "../ReservationForm";
import type { HeroTransition, MenuItem, StorefrontPayload } from "../../types";

export interface TemplateProps {
  data: StorefrontPayload;
  slug: string;
  displayName: string;
  displayTagline: string;
  displayStory: string;
  accentColor: string;
  heroImageUrl: string;
  heroImages: string[];
  heroTransition: HeroTransition;
  heroIntervalMs: number;
  galleryImages: string[];
  menuPath: string;
  bestSellers: MenuItem[];
  isPreview: boolean;
}

export function HeritageTemplate({
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
  isPreview,
}: TemplateProps) {
  const [selectedEvent, setSelectedEvent] = useState("Jamuan Keluarga / VIP");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const showMobileBar = useScrolledPast(420);
  const { tenant, branches, promos, event_packages, menu_items } = data;
  const primaryBranch = branches[0];
  const logoSrc = resolveAssetUrl(tenant.logo_url);

  const spotlightDish = bestSellers[0];
  const otherBestSellers = bestSellers.slice(1, 4);

  const pickEvent = (title: string) => {
    setSelectedEvent(title);
    document.getElementById("reservasi")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-clip pb-20 md:pb-0" style={{ backgroundColor: "#FAF6EE", color: "#1F1612" }}>
      {/* Classic Burgundy Top Hospitality Strip */}
      {primaryBranch && (
        <div className="border-b px-4 py-2 text-[11px] text-amber-100" style={{ backgroundColor: "#260D10", borderColor: "rgba(212,175,55,0.28)" }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
              <Clock size={12} strokeWidth={1.75} className="shrink-0 text-amber-300" aria-hidden="true" />
              <span className="truncate">Buka {primaryBranch.open_hours} · {primaryBranch.name}</span>
            </span>
            {primaryBranch.whatsapp_number && (
              <a
                href={`https://wa.me/${primaryBranch.whatsapp_number.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden shrink-0 items-center gap-1.5 font-mono text-amber-200 no-underline hover:underline sm:inline-flex"
              >
                <Phone size={11} strokeWidth={1.75} aria-hidden="true" />
                +{primaryBranch.whatsapp_number.replace(/[^0-9]/g, "")}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Responsive Centered Crest Navigation */}
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-md" style={{ borderColor: "rgba(184,134,11,0.28)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr]">
          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#4E413A] md:flex">
            <a href="#rekomendasi" className="no-underline hover:text-[#8B1E24]">Andalan</a>
            <Link to={menuPath} className="no-underline hover:text-[#8B1E24]">Buku Menu</Link>
            {event_packages.length > 0 && (
              <a href="#acara" className="no-underline hover:text-[#8B1E24]">Ruang VIP</a>
            )}
          </nav>

          <a href="#beranda" className="flex min-w-0 items-center gap-2.5 no-underline md:justify-center">
            {logoSrc && !isPreview ? (
              <img src={logoSrc} alt={displayName} className="h-9 w-9 shrink-0 rounded object-cover" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-amber-200" style={{ backgroundColor: accentColor }}>
                <UtensilsCrossed size={16} strokeWidth={1.75} aria-hidden="true" />
              </span>
            )}
            <span className="truncate font-display text-xl font-bold tracking-tight text-[#1F1612] sm:text-2xl">
              {displayName}
            </span>
          </a>

          <div className="flex shrink-0 items-center justify-end gap-6">
            <a
              href="#reservasi"
              className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-[#4E413A] no-underline hover:text-[#8B1E24] md:inline-block"
            >
              Lokasi &amp; Reservasi
            </a>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Menu navigasi"
              className="inline-flex h-10 w-10 items-center justify-center rounded border md:hidden"
              style={{ borderColor: "rgba(184,134,11,0.38)", color: "#1F1612" }}
            >
              {mobileNavOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileNavOpen && (
          <div className="border-t bg-white px-4 py-3 md:hidden" style={{ borderColor: "rgba(184,134,11,0.22)" }}>
            <nav className="flex flex-col gap-2 text-sm font-semibold text-[#1F1612]">
              <a href="#rekomendasi" onClick={() => setMobileNavOpen(false)} className="rounded px-3 py-2 no-underline hover:bg-[#FAF6EE]">
                Hidangan Andalan
              </a>
              <Link to={menuPath} onClick={() => setMobileNavOpen(false)} className="rounded px-3 py-2 no-underline hover:bg-[#FAF6EE]">
                Buku Menu Lengkap
              </Link>
              {event_packages.length > 0 && (
                <a href="#acara" onClick={() => setMobileNavOpen(false)} className="rounded px-3 py-2 no-underline hover:bg-[#FAF6EE]">
                  Paket Ruang VIP
                </a>
              )}
              <a href="#reservasi" onClick={() => setMobileNavOpen(false)} className="rounded px-3 py-2 no-underline hover:bg-[#FAF6EE]">
                Lokasi &amp; Reservasi
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Full-Bleed Grand Banquet Hero with Centered Gold Crest */}
      <section id="beranda" className="relative flex min-h-[62vh] items-center justify-center overflow-hidden px-4 py-12 text-center sm:min-h-[80vh] sm:py-24">
        {heroImages.length > 0 ? (
          <HeroBannerSlider
            images={heroImages}
            alt={displayName}
            transition={heroTransition}
            intervalMs={heroIntervalMs}
            className="absolute inset-0 h-full w-full"
          />
        ) : heroImageUrl ? (
          <img src={heroImageUrl} alt={displayName} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: "#260D10" }} />
        )}
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background: "linear-gradient(180deg, rgba(24,10,12,0.72) 0%, rgba(24,10,12,0.52) 50%, rgba(24,10,12,0.86) 100%)",
          }}
        />
        <div
          className="relative z-10 mx-auto w-full max-w-3xl border px-5 py-9 sm:px-12 sm:py-14"
          style={{
            borderColor: "rgba(212,175,55,0.48)",
            backgroundColor: "rgba(24,10,12,0.52)",
            backdropFilter: "blur(4px)",
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-300 sm:text-[11px]">
            Santap Keluarga &amp; Ruang Jamuan
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.06] text-white sm:mt-4 sm:text-6xl">
            {displayName}
          </h1>
          <div className="mx-auto my-4 h-px w-20 bg-amber-400/75 sm:my-5" />
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-amber-50/90 sm:text-base">
            {displayTagline}
          </p>
          <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <Link
              to={menuPath}
              className="inline-flex h-11 items-center justify-center gap-2 rounded px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white no-underline transition hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              <BookOpen size={14} strokeWidth={1.75} aria-hidden="true" />
              Buka Buku Menu
            </Link>
            <a
              href="#reservasi"
              className="inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-300/65 px-6 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100 no-underline transition hover:bg-white/10"
            >
              Reservasi Meja
            </a>
          </div>
        </div>
      </section>

      {/* Editorial Visual Strip: Suasana & Sajian */}
      {galleryImages.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {galleryImages.map((src, i) => (
              <div
                key={src + i}
                className={`overflow-hidden rounded-lg border bg-[#EFE8DA] ${
                  i === 0 ? "col-span-2 aspect-[16/9] sm:col-span-1 sm:aspect-[4/3]" : "aspect-[4/3]"
                }`}
                style={{ borderColor: "rgba(184,134,11,0.32)" }}
              >
                <img src={src} alt={`Suasana dan hidangan ${displayName}`} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rekomendasi & Hidangan Terlaris */}
      <section id="rekomendasi" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "#B8860B" }}>
            Pilihan Terlaris Meja Keluarga
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Hidangan Andalan Dapur Kami</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5A4B42]">{displayStory}</p>
        </div>

        {/* Featured Spotlight Dish */}
        {spotlightDish && (
          <div
            className="mt-8 grid overflow-hidden rounded-lg border bg-white md:mt-10 md:grid-cols-12"
            style={{ borderColor: "rgba(184,134,11,0.32)" }}
          >
            <div className="aspect-[16/10] bg-[#EFE8DA] md:col-span-6 md:aspect-auto">
              {spotlightDish.image_url ? (
                <img
                  src={resolveAssetUrl(spotlightDish.image_url)}
                  alt={spotlightDish.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center text-[#8C7B70]">
                  <UtensilsCrossed size={32} strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10 md:col-span-6">
              <span
                className="w-fit rounded px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ backgroundColor: "rgba(184,134,11,0.14)", color: "#8C6306" }}
              >
                {spotlightDish.badge || "Paling Banyak Dipesan"}
              </span>
              <h3 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{spotlightDish.name}</h3>
              {spotlightDish.description && (
                <p className="mt-2.5 text-sm leading-relaxed text-[#5A4B42]">{spotlightDish.description}</p>
              )}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "rgba(31,22,18,0.1)" }}>
                <span className="font-mono text-lg font-bold" style={{ color: accentColor }}>
                  {formatRupiah(spotlightDish.price)}
                </span>
                <Link
                  to={menuPath}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider no-underline hover:underline"
                  style={{ color: accentColor }}
                >
                  Lihat di Buku Menu
                  <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3 Secondary Best-Sellers */}
        {otherBestSellers.length > 0 && (
          <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-3 sm:gap-5">
            {otherBestSellers.map((dish) => (
              <article
                key={dish.id}
                className="overflow-hidden rounded-lg border bg-white"
                style={{ borderColor: "rgba(184,134,11,0.28)" }}
              >
                {dish.image_url && (
                  <div className="aspect-[16/10] overflow-hidden bg-[#EFE8DA] sm:aspect-[4/3]">
                    <img src={resolveAssetUrl(dish.image_url)} alt={dish.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-4 sm:p-5">
                  {dish.badge && (
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#B8860B" }}>
                      {dish.badge}
                    </span>
                  )}
                  <h3 className="mt-1 font-display text-2xl font-bold leading-snug">{dish.name}</h3>
                  {dish.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#5A4B42]">{dish.description}</p>
                  )}
                  <p className="mt-3 font-mono text-sm font-bold" style={{ color: accentColor }}>
                    {formatRupiah(dish.price)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:mt-10">
          <Link
            to={menuPath}
            className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded border-2 px-6 text-xs font-semibold uppercase tracking-[0.14em] no-underline transition hover:bg-[#8B1E24] hover:text-white sm:w-auto"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            <BookOpen size={15} strokeWidth={1.75} aria-hidden="true" />
            Lihat Buku Menu Lengkap ({menu_items.length} Hidangan)
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* VIP Banquet & Event Packages */}
      {event_packages.length > 0 && (
        <section id="acara" className="border-y py-14 sm:py-20" style={{ backgroundColor: "#F2ECE0", borderColor: "rgba(184,134,11,0.25)" }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "#B8860B" }}>
                Ruang Privat &amp; Jamuan Besar
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Paket Acara &amp; Ruang VIP</h2>
            </div>

            <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2 md:gap-6">
              {event_packages.map((pkg) => (
                <article key={pkg.id} className="flex flex-col overflow-hidden rounded-lg border bg-white" style={{ borderColor: "rgba(184,134,11,0.28)" }}>
                  {pkg.image_url && (
                    <div className="aspect-[16/9] overflow-hidden bg-[#E9E1D2]">
                      <img src={resolveAssetUrl(pkg.image_url)} alt={pkg.title} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display text-2xl font-bold">{pkg.title}</h3>
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-[#6B5A4E]">
                          <Users size={13} strokeWidth={1.75} aria-hidden="true" />
                          {pkg.capacity}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[#5A4B42]">{pkg.description}</p>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "rgba(31,22,18,0.1)" }}>
                      <span className="font-mono text-sm font-bold" style={{ color: accentColor }}>
                        {pkg.price_label}
                      </span>
                      <button
                        type="button"
                        onClick={() => pickEvent(pkg.title)}
                        className="h-10 rounded px-4 text-xs font-semibold uppercase tracking-wider text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        Tanya Ruang VIP
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Active Promos */}
      {promos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="flex flex-col justify-between rounded-lg border bg-white p-5 sm:p-6"
                style={{ borderColor: "rgba(184,134,11,0.35)" }}
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
                    Penawaran Khusus {promo.end_date ? `· s/d ${promo.end_date}` : ""}
                  </span>
                  <h3 className="mt-1.5 font-display text-2xl font-bold">{promo.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5A4B42]">{promo.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Branches + Classic Reservation Frame */}
      <section id="reservasi" className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "#B8860B" }}>
              Lokasi &amp; Jam Buka
            </p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Kunjungi Cabang Kami</h2>
            <div className="space-y-3 pt-1">
              {branches.map((b) => (
                <div key={b.id} className="rounded-lg border bg-white p-4" style={{ borderColor: "rgba(31,22,18,0.12)" }}>
                  <h3 className="font-display text-xl font-bold">{b.name}</h3>
                  <p className="mt-1 flex items-start gap-2 text-xs text-[#5A4B42]">
                    <MapPin size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color: accentColor }} />
                    {b.address}
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-[#7C6E65]">
                    <Clock size={12} strokeWidth={1.75} />
                    {b.open_hours}
                  </p>
                  {b.maps_url && (
                    <a
                      href={b.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold no-underline hover:underline"
                      style={{ color: accentColor }}
                    >
                      Petunjuk Arah
                      <ExternalLink size={11} strokeWidth={2} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-lg border-2 bg-white p-5 sm:p-8 lg:col-span-7"
            style={{ borderColor: "rgba(184,134,11,0.38)" }}
          >
            <h3 className="font-display text-3xl font-bold">Reservasi Meja &amp; Ruang VIP</h3>
            <p className="mt-1 text-xs text-[#5A4B42]">
              Isi jadwal kunjungan Anda, lalu konfirmasi instan melalui WhatsApp cabang pilihan.
            </p>
            <div className="mt-6">
                <ReservationForm
                slug={slug}
                branches={branches}
                preset="banquet"
                accentColor={accentColor}
                selectedEventType={selectedEvent}
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-amber-100/75" style={{ backgroundColor: "#260D10", borderColor: "rgba(212,175,55,0.22)" }}>
        <p className="font-display text-xl font-bold text-amber-100">{displayName}</p>
        <p className="mt-1 px-4">{displayTagline}</p>
      </footer>

      {/* Mobile Sticky Bottom Action Bar (only after scrolling past hero) */}
      {showMobileBar && (
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t bg-white/95 p-2.5 backdrop-blur-md md:hidden" style={{ borderColor: "rgba(184,134,11,0.3)" }}>
        <Link
          to={menuPath}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded border text-xs font-semibold uppercase tracking-wider no-underline"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          <BookOpen size={14} strokeWidth={1.75} aria-hidden="true" />
          Buku Menu
        </Link>
        <a
          href="#reservasi"
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded text-xs font-semibold uppercase tracking-wider text-white no-underline"
          style={{ backgroundColor: accentColor }}
        >
          <Calendar size={14} strokeWidth={1.75} aria-hidden="true" />
          Reservasi
        </a>
      </div>
      )}
    </div>
  );
}
