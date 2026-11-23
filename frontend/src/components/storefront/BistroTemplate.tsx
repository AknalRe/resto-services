import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  Flame,
  MapPin,
  Users,
} from "lucide-react";
import { formatRupiah, resolveAssetUrl } from "../../lib/api";
import { ReservationForm } from "../ReservationForm";
import type { TemplateProps } from "./HeritageTemplate";

export function BistroTemplate({
  data,
  slug,
  displayName,
  displayTagline,
  displayStory,
  accentColor,
  menuPath,
  bestSellers,
  isPreview,
}: TemplateProps) {
  const [selectedEvent, setSelectedEvent] = useState("Dinner / Private Table");
  const { tenant, branches, promos, event_packages, menu_items } = data;
  const primaryBranch = branches[0];
  const heroSrc = resolveAssetUrl(tenant.hero_image_url);
  const logoSrc = resolveAssetUrl(tenant.logo_url);

  const pickEvent = (title: string) => {
    setSelectedEvent(title);
    document.getElementById("reservasi")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-slate-100">
      {/* Minimalist Architectural Top Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0C0E]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <a href="#beranda" className="flex items-center gap-3 no-underline">
            {logoSrc && !isPreview ? (
              <img src={logoSrc} alt={displayName} className="h-8 w-8 object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center text-white" style={{ backgroundColor: accentColor }}>
                <Flame size={15} strokeWidth={1.75} aria-hidden="true" />
              </span>
            )}
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">{displayName}</span>
          </a>

          <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 md:flex">
            <a href="#terlaris" className="no-underline transition hover:text-white">Signature</a>
            <Link to={menuPath} className="no-underline transition hover:text-white">Buku Menu</Link>
            {event_packages.length > 0 && (
              <a href="#private" className="no-underline transition hover:text-white">Private Table</a>
            )}
            <a href="#reservasi" className="no-underline transition hover:text-white">Reservasi</a>
          </nav>

          <Link
            to={menuPath}
            className="inline-flex h-9 items-center gap-1.5 px-4 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white no-underline transition hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            <BookOpen size={13} strokeWidth={1.75} aria-hidden="true" />
            Buku Menu
          </Link>
        </div>
      </header>

      {/* Asymmetrical 12-Col Editorial Split Hero */}
      <section id="beranda" className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-16">
        <div className="flex flex-col justify-between border-l-2 pl-5 sm:pl-7 lg:col-span-5" style={{ borderColor: accentColor }}>
          <div>
            {primaryBranch && (
              <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: accentColor }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                OPEN · {primaryBranch.open_hours}
              </p>
            )}
            <h1 className="mt-5 text-4xl font-bold uppercase leading-[1.02] tracking-[0.02em] text-white sm:text-5xl lg:text-6xl">
              {displayName}
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-slate-300">
              {displayTagline}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              {displayStory}
            </p>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to={menuPath}
              className="inline-flex h-11 items-center gap-2 px-6 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white no-underline transition hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Lihat Buku Menu
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
            </Link>
            <a
              href="#reservasi"
              className="inline-flex h-11 items-center gap-2 border border-white/25 px-6 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 no-underline transition hover:border-white/60 hover:text-white"
            >
              Book A Table
            </a>
          </div>
        </div>

        <div className="relative min-h-[340px] overflow-hidden border border-white/10 bg-[#14161A] lg:col-span-7 lg:min-h-[500px]">
          {heroSrc && (
            <img src={heroSrc} alt={displayName} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E]/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between border-t border-white/20 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-200">
            <span>CHEF&apos;S GRILL &amp; KITCHEN</span>
            <span>{primaryBranch?.name || "MAIN DINING"}</span>
          </div>
        </div>
      </section>

      {/* Numbered Signature Best-Sellers (Only Top Picks) */}
      <section id="terlaris" className="border-t border-white/10 bg-[#101216] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: accentColor }}>
                01 / CHEF&apos;S SELECTION
              </p>
              <h2 className="mt-2 text-3xl font-bold uppercase tracking-[0.04em] text-white sm:text-4xl">
                Menu Terlaris Malam Ini
              </h2>
            </div>
            <Link
              to={menuPath}
              className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] no-underline hover:underline"
              style={{ color: accentColor }}
            >
              Buka Semua {menu_items.length} Menu
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {bestSellers.slice(0, 4).map((dish, idx) => (
              <article
                key={dish.id}
                className="group grid grid-cols-12 overflow-hidden border border-white/10 bg-[#15181D] transition hover:border-white/25"
              >
                <div className="col-span-5 aspect-square overflow-hidden bg-[#1D2026] sm:aspect-auto">
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
                <div className="col-span-7 flex flex-col justify-between p-5">
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
                    <h3 className="mt-2.5 text-base font-bold uppercase tracking-wide text-white">{dish.name}</h3>
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
              className="mt-4 inline-flex h-10 shrink-0 items-center gap-2 px-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white no-underline sm:mt-0"
              style={{ backgroundColor: accentColor }}
            >
              Buka Buku Menu
              <ArrowUpRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* Private Table & Promos Band */}
      {(event_packages.length > 0 || promos.length > 0) && (
        <section id="private" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: accentColor }}>
            02 / PRIVATE DINING &amp; PROMOS
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {event_packages.map((pkg) => (
              <article key={pkg.id} className="flex flex-col justify-between border border-white/10 bg-[#14161A] p-6">
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-slate-400">
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
                  className="mt-5 w-fit border border-white/25 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white"
                >
                  Reservasi Paket Ini
                </button>
              </article>
            ))}

            {promos.map((promo) => (
              <article key={promo.id} className="border border-[#D97736]/35 bg-[#181412] p-6">
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
      <section id="reservasi" className="border-t border-white/10 bg-[#101216] py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: accentColor }}>
              03 / LOCATIONS &amp; HOURS
            </p>
            <h2 className="text-3xl font-bold uppercase tracking-[0.04em] text-white">Reserve Your Table</h2>
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

          <div className="border border-white/12 bg-[#14161A] p-6 sm:p-8 lg:col-span-7">
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
    </div>
  );
}
