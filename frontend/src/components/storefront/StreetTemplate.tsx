import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
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

export function StreetTemplate({
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
  const [selectedEvent, setSelectedEvent] = useState("Makan Rombongan");
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
    <div className="min-h-screen overflow-x-clip pb-20 md:pb-0" style={{ backgroundColor: "#FFF8EB", color: "#181512" }}>
      {/* Bold Ink-Bordered Poster Header (text links only, zero duplicate CTA button) */}
      <header className="sticky top-0 z-30 border-b-2 border-[#181512] bg-[#FFF8EB]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#beranda" className="flex min-w-0 items-center gap-2.5 no-underline">
            {logoSrc && !isPreview ? (
              <img src={logoSrc} alt={displayName} className="h-9 w-9 shrink-0 rounded-md border-2 border-[#181512] object-cover" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 border-[#181512] text-white" style={{ backgroundColor: accentColor }}>
                <Flame size={16} strokeWidth={2} aria-hidden="true" />
              </span>
            )}
            <span className="truncate text-base font-black uppercase tracking-tight text-[#181512] sm:text-lg">
              {displayName}
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-xs font-extrabold uppercase tracking-wider text-[#181512] md:flex">
            <a href="#terlaris" className="no-underline hover:underline">Terlaris</a>
            <Link to={menuPath} className="no-underline hover:underline">Buku Menu</Link>
            <a href="#reservasi" className="no-underline hover:underline">Outlet &amp; Pesan</a>
          </nav>

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Menu navigasi"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border-2 border-[#181512] bg-white text-[#181512] md:hidden"
          >
            {mobileNavOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="border-t-2 border-[#181512] bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1 text-xs font-extrabold uppercase tracking-wider text-[#181512]">
              <a href="#terlaris" onClick={() => setMobileNavOpen(false)} className="rounded px-3 py-2.5 no-underline hover:bg-[#FFF8EB]">Menu Terlaris</a>
              <Link to={menuPath} onClick={() => setMobileNavOpen(false)} className="rounded px-3 py-2.5 no-underline hover:bg-[#FFF8EB]">Buku Menu Lengkap</Link>
              <a href="#reservasi" onClick={() => setMobileNavOpen(false)} className="rounded px-3 py-2.5 no-underline hover:bg-[#FFF8EB]">Outlet &amp; Reservasi</a>
            </nav>
          </div>
        )}
      </header>

      {/* Bold Street Poster Hero */}
      <section id="beranda" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid items-stretch gap-6 lg:grid-cols-12">
          <div
            className="flex flex-col justify-between rounded-2xl border-2 border-[#181512] p-5 sm:p-8 lg:col-span-5"
            style={{ backgroundColor: "#F6C945", boxShadow: "4px 4px 0 #181512" }}
          >
            <div>
              {primaryBranch && (
                <span className="inline-flex items-center gap-1.5 rounded border-2 border-[#181512] bg-white px-2.5 py-1 font-mono text-[11px] font-bold">
                  <Clock size={12} strokeWidth={2} />
                  BUKA {primaryBranch.open_hours}
                </span>
              )}
              <h1 className="mt-4 text-3xl font-black uppercase leading-[1.02] tracking-tight sm:text-5xl">
                {displayName}
              </h1>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-[#2D251C]">
                {displayTagline}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#3E3429]">{displayStory}</p>
            </div>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <Link
                to={menuPath}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#181512] px-5 text-xs font-extrabold uppercase tracking-wider text-white no-underline transition active:translate-y-0.5"
                style={{ backgroundColor: accentColor, boxShadow: "3px 3px 0 #181512" }}
              >
                <BookOpen size={14} strokeWidth={2} />
                Buka Buku Menu
              </Link>
              <a
                href="#reservasi"
                className="inline-flex h-11 items-center justify-center rounded-lg border-2 border-[#181512] bg-white px-5 text-xs font-extrabold uppercase tracking-wider text-[#181512] no-underline"
              >
                Pesan Meja
              </a>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl border-2 border-[#181512] bg-white lg:col-span-7"
            style={{ boxShadow: "4px 4px 0 #181512" }}
          >
            <div className="aspect-[16/10] h-full w-full">
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
      </section>

      {/* Punchy Best-Sellers Grid */}
      <section id="terlaris" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="inline-block rounded-lg border-2 border-[#181512] bg-white px-4 py-1.5 text-xs font-black uppercase tracking-wider" style={{ boxShadow: "3px 3px 0 #181512" }}>
          Wajib Coba · Paling Laris
        </div>
        <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">Favorit Pelanggan</h2>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.slice(0, 4).map((dish) => (
            <article
              key={dish.id}
              className="flex flex-col overflow-hidden rounded-xl border-2 border-[#181512] bg-white"
              style={{ boxShadow: "4px 4px 0 #181512" }}
            >
              <div className="relative aspect-[4/3] border-b-2 border-[#181512] bg-[#F4E6CE]">
                {dish.image_url && (
                  <img src={resolveAssetUrl(dish.image_url)} alt={dish.name} className="h-full w-full object-cover" loading="lazy" />
                )}
                {dish.badge && (
                  <span
                    className="absolute left-2.5 top-2.5 rounded border-2 border-[#181512] px-2 py-0.5 text-[10px] font-black uppercase text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {dish.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h3 className="text-base font-black leading-snug">{dish.name}</h3>
                  {dish.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-[#544A3F]">{dish.description}</p>
                  )}
                </div>
                <p className="mt-3 font-mono text-sm font-black" style={{ color: accentColor }}>
                  {formatRupiah(dish.price)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-9 text-center">
          <Link
            to={menuPath}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#181512] px-7 text-xs font-black uppercase tracking-wider text-white no-underline sm:w-auto"
            style={{ backgroundColor: accentColor, boxShadow: "4px 4px 0 #181512" }}
          >
            Lihat Buku Menu Lengkap ({menu_items.length} Menu)
            <ArrowRight size={15} strokeWidth={2.2} />
          </Link>
        </div>
      </section>

      {/* Promos & Group Packs */}
      {(promos.length > 0 || event_packages.length > 0) && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            {promos.map((promo) => (
              <div key={promo.id} className="rounded-xl border-2 border-[#181512] bg-[#FFE6A7] p-6" style={{ boxShadow: "4px 4px 0 #181512" }}>
                <span className="rounded border border-[#181512] bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                  PROMO {promo.end_date ? `· s/d ${promo.end_date}` : ""}
                </span>
                <h3 className="mt-2.5 text-xl font-black uppercase">{promo.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#3E3429]">{promo.description}</p>
              </div>
            ))}
            {event_packages.map((pkg) => (
              <div key={pkg.id} className="flex flex-col justify-between rounded-xl border-2 border-[#181512] bg-white p-6" style={{ boxShadow: "4px 4px 0 #181512" }}>
                <div>
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#544A3F]">
                    <Users size={12} strokeWidth={2} />
                    {pkg.capacity} · {pkg.price_label}
                  </span>
                  <h3 className="mt-2 text-xl font-black uppercase">{pkg.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#544A3F]">{pkg.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => pickEvent(pkg.title)}
                  className="mt-4 h-9 w-fit rounded-lg border-2 border-[#181512] px-4 text-xs font-extrabold uppercase text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Pesan Rombongan
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Outlets & Reservation */}
      <section id="reservasi" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <h2 className="text-3xl font-black uppercase">Outlet &amp; Jam Buka</h2>
            <div className="space-y-3">
              {branches.map((b) => (
                <div key={b.id} className="rounded-xl border-2 border-[#181512] bg-white p-4" style={{ boxShadow: "4px 4px 0 #181512" }}>
                  <h3 className="text-base font-black uppercase">{b.name}</h3>
                  <p className="mt-1 flex items-start gap-2 text-xs text-[#4A4036]">
                    <MapPin size={13} strokeWidth={2} className="mt-0.5 shrink-0" style={{ color: accentColor }} />
                    {b.address}
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-mono text-[11px] font-bold text-[#6E6256]">
                    <Clock size={12} strokeWidth={2} />
                    {b.open_hours}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#181512] bg-white p-6 sm:p-8 lg:col-span-7" style={{ boxShadow: "6px 6px 0 #181512" }}>
            <h3 className="text-2xl font-black uppercase">Booking Meja / Pesan Rombongan</h3>
            <p className="mt-1 text-xs text-[#544A3F]">Konfirmasi langsung lewat WhatsApp outlet pilihan Anda.</p>
            <div className="mt-5">
              <ReservationForm
                slug={slug}
                branches={branches}
                preset="street"
                accentColor={accentColor}
                selectedEventType={selectedEvent}
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-[#181512] bg-[#181512] py-8 text-center text-xs text-amber-100/80">
        <p className="text-lg font-black uppercase text-[#F6C945]">{displayName}</p>
        <p className="mt-1 px-4">{displayTagline}</p>
      </footer>

      {showMobileBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t-2 border-[#181512] bg-[#FFF8EB] p-2.5 md:hidden">
          <Link
            to={menuPath}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border-2 border-[#181512] bg-white text-xs font-black uppercase text-[#181512] no-underline"
          >
            <BookOpen size={14} strokeWidth={2} />
            Buku Menu
          </Link>
          <a
            href="#reservasi"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border-2 border-[#181512] text-xs font-black uppercase text-white no-underline"
            style={{ backgroundColor: accentColor }}
          >
            <Calendar size={14} strokeWidth={2} />
            Pesan Meja
          </a>
        </div>
      )}
    </div>
  );
}
