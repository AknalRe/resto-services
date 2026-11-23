import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
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

export function OmakaseTemplate({
  data,
  slug,
  displayName,
  displayTagline,
  displayStory,
  accentColor,
  heroImages,
  heroTransition,
  heroIntervalMs,
  menuPath,
  bestSellers,
  isPreview,
}: TemplateProps) {
  const [selectedEvent, setSelectedEvent] = useState("Counter Omakase");
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
    <div className="min-h-screen overflow-x-clip pb-20 md:pb-0" style={{ backgroundColor: "#F5F2EB", color: "#181A1F" }}>
      {/* Serene Minimalist Zen Header (text links only, no duplicate CTA button) */}
      <header className="sticky top-0 z-30 border-b bg-[#F5F2EB]/92 backdrop-blur-md" style={{ borderColor: "rgba(24,26,31,0.1)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <a href="#beranda" className="flex min-w-0 items-center gap-3 no-underline">
            {logoSrc && !isPreview ? (
              <img src={logoSrc} alt={displayName} className="h-8 w-8 shrink-0 object-cover" />
            ) : (
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center border text-xs font-bold"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                味
              </span>
            )}
            <span className="truncate font-display text-xl font-semibold tracking-[0.06em] text-[#181A1F] sm:text-2xl">
              {displayName}
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-xs tracking-[0.14em] text-[#575A63] uppercase md:flex">
            <a href="#kurasi" className="no-underline transition hover:text-[#181A1F]">Kurasi</a>
            <Link to={menuPath} className="no-underline transition hover:text-[#181A1F]">Buku Menu</Link>
            {event_packages.length > 0 && (
              <a href="#ruang" className="no-underline transition hover:text-[#181A1F]">Counter Privat</a>
            )}
            <a href="#reservasi" className="no-underline transition hover:text-[#181A1F]">Reservasi</a>
          </nav>

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Menu navigasi"
            className="inline-flex h-10 w-10 items-center justify-center border border-[#181A1F]/15 text-[#181A1F] md:hidden"
          >
            {mobileNavOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="border-t bg-[#F5F2EB] px-4 py-3 md:hidden" style={{ borderColor: "rgba(24,26,31,0.1)" }}>
            <nav className="flex flex-col gap-1 text-xs uppercase tracking-[0.16em] text-[#181A1F]">
              <a href="#kurasi" onClick={() => setMobileNavOpen(false)} className="px-3 py-2.5 no-underline hover:bg-black/5">Kurasi Hidangan</a>
              <Link to={menuPath} onClick={() => setMobileNavOpen(false)} className="px-3 py-2.5 no-underline hover:bg-black/5">Buku Menu Lengkap</Link>
              <a href="#reservasi" onClick={() => setMobileNavOpen(false)} className="px-3 py-2.5 no-underline hover:bg-black/5">Reservasi Counter</a>
            </nav>
          </div>
        )}
      </header>

      {/* Zen Editorial Hero: Framed Wide Photo Above + Quiet Centered Typographic Intro */}
      <section id="beranda" className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="overflow-hidden border bg-[#E8E3D8]" style={{ borderColor: "rgba(24,26,31,0.12)" }}>
          <div className="aspect-[16/10] sm:aspect-[21/10]">
            <HeroBannerSlider
              images={heroImages}
              alt={displayName}
              transition={heroTransition}
              intervalMs={heroIntervalMs}
              className="h-full w-full"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <div className="flex items-center gap-3">
              <span className="inline-block h-2 w-2" style={{ backgroundColor: accentColor }} />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#6B6E75]">
                SEASONAL COUNTER · {primaryBranch?.open_hours || "17.00 - 22.00"}
              </span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              {displayTagline}
            </h1>
          </div>

          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[#52555D]">{displayStory}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                to={menuPath}
                className="inline-flex h-11 items-center gap-2 px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white no-underline transition hover:opacity-90"
                style={{ backgroundColor: "#181A1F" }}
              >
                Buka Buku Menu
                <ArrowRight size={13} strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <a
                href="#reservasi"
                className="text-xs font-semibold uppercase tracking-[0.16em] no-underline underline-offset-4 hover:underline"
                style={{ color: accentColor }}
              >
                Reservasi Meja
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Curated Best-Sellers */}
      <section id="kurasi" className="border-t py-16 sm:py-20" style={{ borderColor: "rgba(24,26,31,0.1)" }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: accentColor }}>
            CHEF&apos;S CURATION
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Pilihan Musiman &amp; Terlaris</h2>

          <div className="mt-8 divide-y border-y sm:mt-10" style={{ borderColor: "rgba(24,26,31,0.12)" }}>
            {bestSellers.slice(0, 4).map((dish, idx) => (
              <article key={dish.id} className="flex flex-col gap-3 py-5 sm:grid sm:grid-cols-12 sm:items-center sm:gap-5 sm:py-6">
                <div className="hidden font-mono text-xs text-[#7A7D85] sm:col-span-1 sm:block">
                  0{idx + 1}
                </div>
                <div className="flex items-start gap-3.5 sm:contents">
                  {dish.image_url && (
                    <div className="h-20 w-24 shrink-0 overflow-hidden bg-[#E8E3D8] sm:col-span-3 sm:h-auto sm:w-full sm:aspect-[4/3]">
                      <img src={resolveAssetUrl(dish.image_url)} alt={dish.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 sm:col-span-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-[#7A7D85] sm:hidden">0{idx + 1}</span>
                      <h3 className="font-display text-xl font-semibold sm:text-2xl">{dish.name}</h3>
                      {dish.badge && (
                        <span
                          className="border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                          style={{ borderColor: accentColor, color: accentColor }}
                        >
                          {dish.badge}
                        </span>
                      )}
                    </div>
                    {dish.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#575A63] sm:mt-1.5">{dish.description}</p>
                    )}
                    <div className="mt-2 font-mono text-xs font-semibold sm:hidden" style={{ color: accentColor }}>
                      {formatRupiah(dish.price)}
                    </div>
                  </div>
                </div>
                <div className="hidden font-mono text-sm font-semibold sm:col-span-2 sm:block sm:text-right">
                  {formatRupiah(dish.price)}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to={menuPath}
              className="inline-flex h-11 items-center gap-2 border border-[#181A1F] px-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#181A1F] no-underline transition hover:bg-[#181A1F] hover:text-white"
            >
              <BookOpen size={14} strokeWidth={1.75} aria-hidden="true" />
              Lihat Seluruh {menu_items.length} Hidangan
            </Link>
          </div>
        </div>
      </section>

      {/* Private Counter & Promos */}
      {(event_packages.length > 0 || promos.length > 0) && (
        <section id="ruang" className="border-t bg-[#EFECE3] py-14 sm:py-18" style={{ borderColor: "rgba(24,26,31,0.1)" }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid gap-6 md:grid-cols-2">
              {event_packages.map((pkg) => (
                <div key={pkg.id} className="flex flex-col justify-between border bg-[#F5F2EB] p-6" style={{ borderColor: "rgba(24,26,31,0.12)" }}>
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#6B6E75]">
                      <Users size={12} strokeWidth={1.75} />
                      {pkg.capacity} · {pkg.price_label}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-semibold">{pkg.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#575A63]">{pkg.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => pickEvent(pkg.title)}
                    className="mt-5 w-fit border-b pb-1 text-xs font-semibold uppercase tracking-[0.14em]"
                    style={{ borderColor: accentColor, color: accentColor }}
                  >
                    Tanya Ketersediaan
                  </button>
                </div>
              ))}
              {promos.map((promo) => (
                <div key={promo.id} className="border bg-white p-6" style={{ borderColor: "rgba(24,26,31,0.12)" }}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accentColor }}>
                    SEASONAL OFFER {promo.end_date ? `· ${promo.end_date}` : ""}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold">{promo.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#575A63]">{promo.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location & Reservation */}
      <section id="reservasi" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: accentColor }}>
              LOCATION
            </p>
            <h2 className="font-display text-3xl font-semibold">Reservasi Counter &amp; Meja</h2>
            <div className="divide-y border-y" style={{ borderColor: "rgba(24,26,31,0.12)" }}>
              {branches.map((b) => (
                <div key={b.id} className="py-4">
                  <h3 className="font-display text-xl font-semibold">{b.name}</h3>
                  <p className="mt-1 flex items-start gap-2 text-xs text-[#575A63]">
                    <MapPin size={13} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                    {b.address}
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-mono text-[11px] text-[#7A7D85]">
                    <Clock size={12} strokeWidth={1.75} />
                    {b.open_hours}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border bg-white p-6 sm:p-8 lg:col-span-7" style={{ borderColor: "rgba(24,26,31,0.12)" }}>
            <ReservationForm
              slug={slug}
              branches={branches}
              preset="omakase"
              accentColor={accentColor}
              selectedEventType={selectedEvent}
            />
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[#7A7D85]" style={{ borderColor: "rgba(24,26,31,0.1)" }}>
        {displayName}
      </footer>

      {showMobileBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t bg-[#F5F2EB]/95 p-2.5 backdrop-blur-md md:hidden" style={{ borderColor: "rgba(24,26,31,0.12)" }}>
          <Link
            to={menuPath}
            className="inline-flex h-11 items-center justify-center gap-1.5 border border-[#181A1F] text-xs font-semibold uppercase tracking-wider text-[#181A1F] no-underline"
          >
            <BookOpen size={14} strokeWidth={1.75} />
            Buku Menu
          </Link>
          <a
            href="#reservasi"
            className="inline-flex h-11 items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white no-underline"
            style={{ backgroundColor: accentColor }}
          >
            <Calendar size={14} strokeWidth={1.75} />
            Reservasi
          </a>
        </div>
      )}
    </div>
  );
}
