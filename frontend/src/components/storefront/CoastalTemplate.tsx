import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Anchor,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
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

export function CoastalTemplate({
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
  const [selectedEvent, setSelectedEvent] = useState("Santap Seafood Keluarga");
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
    <div className="min-h-screen overflow-x-clip bg-white pb-20 text-[#0E2A3F] md:pb-0">
      {/* Crisp Marine Header (text links only, zero duplicate buttons) */}
      <header className="sticky top-0 z-30 border-b border-[#0F4C75]/10 bg-white/94 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <a href="#beranda" className="flex min-w-0 items-center gap-2.5 no-underline">
            {logoSrc && !isPreview ? (
              <img src={logoSrc} alt={displayName} className="h-9 w-9 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: accentColor }}>
                <Anchor size={16} strokeWidth={1.75} aria-hidden="true" />
              </span>
            )}
            <span className="truncate font-display text-xl font-bold text-[#0E2A3F] sm:text-2xl">
              {displayName}
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-xs font-semibold text-[#3C5A70] md:flex">
            <a href="#tangkapan" className="no-underline hover:text-[#0F4C75]">Tangkapan Segar</a>
            <Link to={menuPath} className="no-underline hover:text-[#0F4C75]">Buku Menu</Link>
            <a href="#reservasi" className="no-underline hover:text-[#0F4C75]">Cabang &amp; Reservasi</a>
          </nav>

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Menu navigasi"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#0F4C75]/15 text-[#0E2A3F] md:hidden"
          >
            {mobileNavOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-[#0F4C75]/10 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1 text-sm font-semibold text-[#0E2A3F]">
              <a href="#tangkapan" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-2.5 no-underline hover:bg-[#EFF6F8]">Tangkapan Segar</a>
              <Link to={menuPath} onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-2.5 no-underline hover:bg-[#EFF6F8]">Buku Menu Lengkap</Link>
              <a href="#reservasi" onClick={() => setMobileNavOpen(false)} className="rounded-xl px-3 py-2.5 no-underline hover:bg-[#EFF6F8]">Reservasi Meja</a>
            </nav>
          </div>
        )}
      </header>

      {/* Breezy Coastal Split Banner on Ocean Mist */}
      <section id="beranda" style={{ backgroundColor: "#EFF6F8" }}>
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-5">
            {primaryBranch && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-[#0F4C75] shadow-xs">
                <Clock size={12} strokeWidth={1.75} />
                Segar Hari Ini · {primaryBranch.open_hours}
              </span>
            )}
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.06] text-[#0E2A3F] sm:text-5xl">
              {displayName}
            </h1>
            <p className="mt-3.5 text-sm leading-relaxed text-[#35546A] sm:text-base">{displayTagline}</p>
            <p className="mt-2.5 text-xs leading-relaxed text-[#577489]">{displayStory}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to={menuPath}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-xs font-semibold text-white no-underline transition hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                <BookOpen size={14} strokeWidth={1.75} />
                Buka Buku Menu
              </Link>
              <a
                href="#reservasi"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#0F4C75]/25 bg-white px-6 text-xs font-semibold text-[#0E2A3F] no-underline hover:bg-[#E4F0F4]"
              >
                Reservasi Meja
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-[#0F4C75]/10 bg-white p-2 shadow-sm">
              <div className="aspect-[16/10] overflow-hidden rounded-xl">
                <HeroBannerSlider
                  images={heroImages}
                  alt={displayName}
                  transition={heroTransition}
                  intervalMs={heroIntervalMs}
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fresh Catch Best-Sellers */}
      <section id="tangkapan" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#D95D39" }}>
            Favorit Pesisir
          </p>
          <h2 className="mt-1.5 font-display text-3xl font-bold sm:text-4xl">Menu Terlaris &amp; Rekomendasi</h2>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {bestSellers.slice(0, 4).map((dish) => (
            <article
              key={dish.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#0F4C75]/12 bg-white transition hover:border-[#0F4C75]/30 sm:flex-row"
            >
              {dish.image_url && (
                <div className="aspect-[16/10] shrink-0 bg-[#EFF6F8] sm:aspect-auto sm:w-44">
                  <img src={resolveAssetUrl(dish.image_url)} alt={dish.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  {dish.badge && (
                    <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "rgba(217,93,57,0.12)", color: "#C24A27" }}>
                      {dish.badge}
                    </span>
                  )}
                  <h3 className="mt-1.5 font-display text-2xl font-bold">{dish.name}</h3>
                  {dish.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4E6B80]">{dish.description}</p>
                  )}
                </div>
                <p className="mt-3 font-mono text-sm font-bold" style={{ color: accentColor }}>
                  {formatRupiah(dish.price)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-9 text-center">
          <Link
            to={menuPath}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-7 text-xs font-semibold text-white no-underline transition hover:opacity-90 sm:w-auto"
            style={{ backgroundColor: accentColor }}
          >
            Lihat Buku Menu Lengkap ({menu_items.length} Hidangan)
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Promos & Gathering */}
      {(promos.length > 0 || event_packages.length > 0) && (
        <section className="py-12" style={{ backgroundColor: "#EFF6F8" }}>
          <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-2">
            {promos.map((promo) => (
              <div key={promo.id} className="rounded-2xl border border-[#0F4C75]/10 bg-white p-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#D95D39" }}>
                  Promo Pesisir {promo.end_date ? `· s/d ${promo.end_date}` : ""}
                </span>
                <h3 className="mt-1.5 font-display text-2xl font-bold">{promo.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4E6B80]">{promo.description}</p>
              </div>
            ))}
            {event_packages.map((pkg) => (
              <div key={pkg.id} className="flex flex-col justify-between rounded-2xl border border-[#0F4C75]/10 bg-white p-6">
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3C5A70]">
                    <Users size={12} strokeWidth={1.75} />
                    {pkg.capacity} · {pkg.price_label}
                  </span>
                  <h3 className="mt-1.5 font-display text-2xl font-bold">{pkg.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#4E6B80]">{pkg.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => pickEvent(pkg.title)}
                  className="mt-4 h-9 w-fit rounded-xl px-4 text-xs font-semibold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Tanya Paket
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Branches + Reservation */}
      <section id="reservasi" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#D95D39" }}>
              Lokasi &amp; Jam Buka
            </p>
            <h2 className="font-display text-3xl font-bold">Kunjungi Cabang Kami</h2>
            <div className="space-y-3">
              {branches.map((b) => (
                <div key={b.id} className="rounded-2xl border border-[#0F4C75]/12 bg-[#F8FBFD] p-4">
                  <h3 className="font-display text-xl font-bold">{b.name}</h3>
                  <p className="mt-1 flex items-start gap-2 text-xs text-[#4E6B80]">
                    <MapPin size={13} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color: accentColor }} />
                    {b.address}
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-mono text-[11px] text-[#577489]">
                    <Clock size={12} strokeWidth={1.75} />
                    {b.open_hours}
                  </p>
                  {b.maps_url && (
                    <a
                      href={b.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold no-underline hover:underline"
                      style={{ color: accentColor }}
                    >
                      Google Maps
                      <ExternalLink size={11} strokeWidth={2} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#0F4C75]/15 bg-[#F8FBFD] p-6 sm:p-8 lg:col-span-7">
            <h3 className="font-display text-3xl font-bold">Reservasi Meja</h3>
            <p className="mt-1 text-xs text-[#4E6B80]">Amankan meja keluarga Anda dan konfirmasi langsung ke WhatsApp cabang.</p>
            <div className="mt-6">
              <ReservationForm
                slug={slug}
                branches={branches}
                preset="coastal"
                accentColor={accentColor}
                selectedEventType={selectedEvent}
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#0F4C75]/10 bg-[#0E2A3F] py-8 text-center text-xs text-sky-100/80">
        <p className="font-display text-xl font-bold text-white">{displayName}</p>
        <p className="mt-1 px-4">{displayTagline}</p>
      </footer>

      {showMobileBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-[#0F4C75]/15 bg-white/95 p-2.5 backdrop-blur-md md:hidden">
          <Link
            to={menuPath}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#0F4C75] text-xs font-semibold text-[#0F4C75] no-underline"
          >
            <BookOpen size={14} strokeWidth={1.75} />
            Buku Menu
          </Link>
          <a
            href="#reservasi"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-white no-underline"
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
