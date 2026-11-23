import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock,
  Flame,
  MapPin,
  Menu,
  Users,
  X,
} from "lucide-react";
import { formatRupiah, resolveAssetUrl } from "../../lib/api";
import { useScrolledPast } from "../../hooks/useScrolledPast";
import { HeroBannerSlider } from "./HeroBannerSlider";
import { ReservationForm } from "../ReservationForm";
import type { TemplateProps } from "./HeritageTemplate";

export function BistroTemplate({
  data,
  slug,
  displayName,
  displayTagline,
  displayStory,
  accentColor,
  heroImages,
  heroTransition,
  heroIntervalMs,
  galleryImages,
  menuPath,
  bestSellers,
  isPreview,
}: TemplateProps) {
  const [selectedEvent, setSelectedEvent] = useState("Dinner / Private Table");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const showMobileBar = useScrolledPast(420);
  const { tenant, branches, promos, event_packages, menu_items } = data;
  const primaryBranch = branches[0];
  const logoSrc = resolveAssetUrl(tenant.logo_url);

  const pickEvent = (title: string) => {
    setSelectedEvent(title);
    document.getElementById("reservasi")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0B0C0E] pb-20 text-slate-100 md:pb-0">
      {/* Minimalist Architectural Top Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0C0E]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#beranda" className="flex min-w-0 items-center gap-2.5 no-underline">
            {logoSrc && !isPreview ? (
              <img src={logoSrc} alt={displayName} className="h-8 w-8 shrink-0 object-cover" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-white" style={{ backgroundColor: accentColor }}>
                <Flame size={15} strokeWidth={1.75} aria-hidden="true" />
              </span>
            )}
            <span className="truncate text-xs font-bold uppercase tracking-[0.18em] text-white sm:text-sm">
              {displayName}
            </span>
          </a>

          <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 md:flex">
            <a href="#terlaris" className="no-underline transition hover:text-white">Signature</a>
            <Link to={menuPath} className="no-underline transition hover:text-white">Buku Menu</Link>
            {event_packages.length > 0 && (
              <a href="#private" className="no-underline transition hover:text-white">Private Table</a>
            )}
            <a href="#reservasi" className="no-underline transition hover:text-white">Reservasi</a>
          </nav>

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Menu navigasi"
            className="inline-flex h-10 w-10 items-center justify-center border border-white/20 text-white md:hidden"
          >
            {mobileNavOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-white/10 bg-[#101216] px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.14em] text-slate-200">
              <a href="#terlaris" onClick={() => setMobileNavOpen(false)} className="px-3 py-2 no-underline hover:bg-white/5">
                Signature Dishes
              </a>
              <Link to={menuPath} onClick={() => setMobileNavOpen(false)} className="px-3 py-2 no-underline hover:bg-white/5">
                Buku Menu Lengkap
              </Link>
              {event_packages.length > 0 && (
                <a href="#private" onClick={() => setMobileNavOpen(false)} className="px-3 py-2 no-underline hover:bg-white/5">
                  Private Table
                </a>
              )}
              <a href="#reservasi" onClick={() => setMobileNavOpen(false)} className="px-3 py-2 no-underline hover:bg-white/5">
                Reservasi Meja
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Asymmetrical 12-Col Editorial Split Hero */}
      <section id="beranda" className="mx-auto grid max-w-6xl items-stretch gap-7 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div className="flex flex-col justify-between border-l-2 pl-4 sm:pl-7 lg:col-span-5" style={{ borderColor: accentColor }}>
          <div>
            {primaryBranch && (
              <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] sm:text-[11px]" style={{ color: accentColor }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                OPEN · {primaryBranch.open_hours}
              </p>
            )}
            <h1 className="mt-4 text-3xl font-bold uppercase leading-[1.04] tracking-[0.02em] text-white sm:mt-5 sm:text-5xl lg:text-6xl">
              {displayName}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:mt-5">
              {displayTagline}
            </p>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
              {displayStory}
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
            <Link
              to={menuPath}
              className="inline-flex h-11 items-center justify-center gap-2 px-6 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white no-underline transition hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Lihat Buku Menu
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
            </Link>
            <a
              href="#reservasi"
              className="inline-flex h-11 items-center justify-center gap-2 border border-white/25 px-6 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 no-underline transition hover:border-white/60 hover:text-white"
            >
              Book A Table
            </a>
          </div>
        </div>

        <div className="relative aspect-[16/11] overflow-hidden border border-white/10 bg-[#14161A] lg:col-span-7 lg:aspect-auto lg:min-h-[500px]">
          <HeroBannerSlider
            images={heroImages}
            alt={displayName}
            transition={heroTransition}
            intervalMs={heroIntervalMs}
            controlsPosition="bottom-right"
            className="h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#0B0C0E]/80 via-transparent to-transparent" />
          <div className="pointer-events-none absolute bottom-3 left-4 right-20 z-[3] flex items-center justify-between border-t border-white/20 pt-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-200">
            <span>WOOD-FIRED GRILL &amp; KITCHEN</span>
            <span className="truncate">{primaryBranch?.name || "MAIN DINING"}</span>
          </div>
        </div>
      </section>

      {/* Moody Visual Diptych: Craft & Fire */}
      {galleryImages.length >= 2 && (
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
          <div className="grid gap-3 sm:grid-cols-12 sm:gap-4">
            <div className="relative aspect-[16/10] overflow-hidden border border-white/10 sm:col-span-7">
              <img src={galleryImages[0]} alt="Signature grill dish" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute bottom-3 left-3 bg-[#0B0C0E]/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-200">
                CHARCOAL SEARED
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden border border-white/10 sm:col-span-5 sm:aspect-auto">
              <img src={galleryImages[1]} alt="Evening dining atmosphere" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute bottom-3 left-3 bg-[#0B0C0E]/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-200">
                EVENING TABLE
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Numbered Signature Best-Sellers (Mobile stacked -> Desktop split) */}
      <section id="terlaris" className="border-t border-white/10 bg-[#101216] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="border-b border-white/10 pb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: accentColor }}>
              01 / CHEF&apos;S SELECTION
            </p>
            <h2 className="mt-2 text-2xl font-bold uppercase tracking-[0.04em] text-white sm:text-4xl">
              Menu Terlaris Malam Ini
            </h2>
          </div>

          <div className="mt-7 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2">
            {bestSellers.slice(0, 4).map((dish, idx) => (
              <article
                key={dish.id}
                className="group flex flex-col overflow-hidden border border-white/10 bg-[#15181D] transition hover:border-white/25 sm:grid sm:grid-cols-12"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#1D2026] sm:col-span-5 sm:aspect-auto">
                  {dish.image_url ? (
                    <img
                      src={resolveAssetUrl(dish.image_url)}
                      alt={dish.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full min-h-[160px] items-center justify-center text-slate-600">
                      <Flame size={24} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-4 sm:col-span-7 sm:p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      {dish.badge && (
                        <span className="border border-white/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-300">
                          {dish.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-base font-bold uppercase tracking-wide text-white">{dish.name}</h3>
                    {dish.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{dish.description}</p>
                    )}
                  </div>
                  <p className="mt-4 font-mono text-sm font-bold text-white">{formatRupiah(dish.price)}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 border border-white/15 bg-[#0B0C0E] p-5 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">FULL MENU BOOK</p>
              <p className="mt-1 text-sm text-slate-200">
                Lihat daftar lengkap makanan, panggangan, dan minuman beserta harga di halaman Buku Menu.
              </p>
            </div>
            <Link
              to={menuPath}
              className="mt-4 inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 px-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white no-underline sm:mt-0 sm:w-auto"
              style={{ backgroundColor: accentColor }}
            >
              Buka Buku Menu ({menu_items.length})
              <ArrowUpRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* Private Table & Promos Band */}
      {(event_packages.length > 0 || promos.length > 0) && (
        <section id="private" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: accentColor }}>
            02 / PRIVATE DINING &amp; PROMOS
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:gap-6">
            {event_packages.map((pkg) => (
              <article key={pkg.id} className="flex flex-col justify-between border border-white/10 bg-[#14161A] p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} strokeWidth={1.75} />
                      {pkg.capacity}
                    </span>
                    <span style={{ color: accentColor }}>{pkg.price_label}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold uppercase tracking-wide text-white">{pkg.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{pkg.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => pickEvent(pkg.title)}
                  className="mt-5 h-10 w-fit border border-white/25 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white"
                >
                  Reservasi Paket Ini
                </button>
              </article>
            ))}

            {promos.map((promo) => (
              <article key={promo.id} className="border border-[#D97736]/35 bg-[#181412] p-5 sm:p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accentColor }}>
                  PROMO {promo.end_date ? `· UNTIL ${promo.end_date}` : ""}
                </p>
                <h3 className="mt-2 text-lg font-bold uppercase text-white">{promo.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{promo.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Architectural 2-Column Location & Reservation */}
      <section id="reservasi" className="border-t border-white/10 bg-[#101216] py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-4 lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: accentColor }}>
              03 / LOCATIONS &amp; HOURS
            </p>
            <h2 className="text-2xl font-bold uppercase tracking-[0.04em] text-white sm:text-3xl">Reserve Your Table</h2>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {branches.map((b) => (
                <div key={b.id} className="py-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">{b.name}</h3>
                  <p className="mt-1.5 flex items-start gap-2 text-xs text-slate-400">
                    <MapPin size={13} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color: accentColor }} />
                    {b.address}
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    <Clock size={12} strokeWidth={1.75} />
                    {b.open_hours}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/12 bg-[#14161A] p-5 sm:p-8 lg:col-span-7">
            <ReservationForm
              slug={slug}
              branches={branches}
              preset="bistro"
              accentColor={accentColor}
              selectedEventType={selectedEvent}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {displayName} · BISTRO &amp; GRILL
      </footer>

      {/* Mobile Sticky Bottom Action Bar (only after scrolling past hero) */}
      {showMobileBar && (
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-white/15 bg-[#0B0C0E]/95 p-2.5 backdrop-blur-md md:hidden">
        <Link
          to={menuPath}
          className="inline-flex h-11 items-center justify-center gap-1.5 border border-white/25 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white no-underline"
        >
          <BookOpen size={14} strokeWidth={1.75} aria-hidden="true" />
          Buku Menu
        </Link>
        <a
          href="#reservasi"
          className="inline-flex h-11 items-center justify-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white no-underline"
          style={{ backgroundColor: accentColor }}
        >
          <Calendar size={14} strokeWidth={1.75} aria-hidden="true" />
          Book Table
        </a>
      </div>
      )}
    </div>
  );
}
