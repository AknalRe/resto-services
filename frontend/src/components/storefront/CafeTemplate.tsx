import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Coffee,
  ExternalLink,
  MapPin,
  Menu,
  Users,
  X,
} from "lucide-react";
import { formatRupiah, resolveAssetUrl } from "../../lib/api";
import { useScrolledPast } from "../../hooks/useScrolledPast";
import { ReservationForm } from "../ReservationForm";
import type { TemplateProps } from "./HeritageTemplate";

export function CafeTemplate({
  data,
  slug,
  displayName,
  displayTagline,
  displayStory,
  accentColor,
  heroImageUrl,
  galleryImages,
  menuPath,
  bestSellers,
  isPreview,
}: TemplateProps) {
  const [selectedEvent, setSelectedEvent] = useState("Kumpul Santai / Arisan");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const showMobileBar = useScrolledPast(420);
  const { tenant, branches, promos, event_packages, menu_items } = data;
  const primaryBranch = branches[0];
  const logoSrc = resolveAssetUrl(tenant.logo_url);

  const collagePhotoA = galleryImages[0] || (bestSellers[0]?.image_url ? resolveAssetUrl(bestSellers[0].image_url) : "");
  const collagePhotoB = galleryImages[2] || galleryImages[1] || (bestSellers[1]?.image_url ? resolveAssetUrl(bestSellers[1].image_url) : "");

  const pickEvent = (title: string) => {
    setSelectedEvent(title);
    document.getElementById("reservasi")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-clip pb-20 md:pb-0" style={{ backgroundColor: "#F8F4EC", color: "#2E2219" }}>
      {/* Floating Pill Navbar */}
      <div className="sticky top-2.5 z-30 mx-auto max-w-5xl px-3 sm:top-3 sm:px-4">
        <header
          className="flex items-center justify-between gap-2 rounded-full border bg-white/94 px-3.5 py-2 shadow-sm backdrop-blur-md sm:px-5 sm:py-2.5"
          style={{ borderColor: "rgba(46,34,25,0.1)" }}
        >
          <a href="#beranda" className="flex min-w-0 items-center gap-2 no-underline">
            {logoSrc && !isPreview ? (
              <img src={logoSrc} alt={displayName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: accentColor }}>
                <Coffee size={15} strokeWidth={1.75} aria-hidden="true" />
              </span>
            )}
            <span className="truncate font-display text-lg font-bold text-[#2E2219] sm:text-xl">{displayName}</span>
          </a>

          <nav className="hidden items-center gap-6 text-xs font-semibold text-[#5C4B3E] md:flex">
            <a href="#terlaris" className="no-underline hover:text-[#2E2219]">Favorit</a>
            <Link to={menuPath} className="no-underline hover:text-[#2E2219]">Buku Menu</Link>
            <a href="#cabang" className="no-underline hover:text-[#2E2219]">Kedai Kami</a>
          </nav>

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Menu navigasi"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border md:hidden"
            style={{ borderColor: "rgba(46,34,25,0.16)", color: "#2E2219" }}
          >
            {mobileNavOpen ? <X size={16} strokeWidth={1.75} /> : <Menu size={16} strokeWidth={1.75} />}
          </button>
        </header>

        {mobileNavOpen && (
          <div className="mt-2 rounded-3xl border bg-white p-3 shadow-md md:hidden" style={{ borderColor: "rgba(46,34,25,0.1)" }}>
            <nav className="flex flex-col gap-1 text-sm font-semibold text-[#2E2219]">
              <a href="#terlaris" onClick={() => setMobileNavOpen(false)} className="rounded-2xl px-3.5 py-2.5 no-underline hover:bg-[#F8F4EC]">
                Favorit Minggu Ini
              </a>
              <Link to={menuPath} onClick={() => setMobileNavOpen(false)} className="rounded-2xl px-3.5 py-2.5 no-underline hover:bg-[#F8F4EC]">
                Buku Menu Lengkap
              </Link>
              <a href="#cabang" onClick={() => setMobileNavOpen(false)} className="rounded-2xl px-3.5 py-2.5 no-underline hover:bg-[#F8F4EC]">
                Lokasi &amp; Pesan Meja
              </a>
            </nav>
          </div>
        )}
      </div>

      {/* Bright Magazine Hero with Organic 3-Photo Collage */}
      <section id="beranda" className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:py-16">
        <div className="lg:col-span-6">
          {primaryBranch && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: "rgba(47,72,62,0.12)", color: accentColor }}
            >
              <Clock size={12} strokeWidth={1.75} aria-hidden="true" />
              Buka Hari Ini · {primaryBranch.open_hours}
            </span>
          )}
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.06] tracking-tight sm:text-6xl">
            {displayName}
          </h1>
          <p className="mt-3.5 text-sm leading-relaxed text-[#5C4B3E] sm:mt-4 sm:text-base">{displayTagline}</p>
          <p className="mt-2 text-xs leading-relaxed text-[#7D6959] sm:text-sm">{displayStory}</p>

          <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:items-center sm:gap-3">
            <Link
              to={menuPath}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-xs font-semibold text-white no-underline transition hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Lihat Buku Menu
              <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
            </Link>
            <a
              href="#reservasi"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border bg-white px-6 text-xs font-semibold text-[#2E2219] no-underline transition hover:bg-[#F1E9DC]"
              style={{ borderColor: "rgba(46,34,25,0.16)" }}
            >
              Pesan Meja Santai
            </a>
          </div>
        </div>

        {/* Organic 3-Photo Collage */}
        <div className="grid grid-cols-12 gap-2.5 sm:gap-3.5 lg:col-span-6">
          <div className="col-span-7 aspect-[3/4] overflow-hidden rounded-t-[84px] rounded-b-3xl bg-[#E8DEC9] shadow-sm sm:rounded-t-[110px]">
            {heroImageUrl && <img src={heroImageUrl} alt={displayName} className="h-full w-full object-cover" />}
          </div>
          <div className="col-span-5 flex flex-col gap-2.5 sm:gap-3.5">
            <div className="aspect-square flex-1 overflow-hidden rounded-2xl bg-[#E8DEC9] shadow-sm sm:rounded-3xl">
              {collagePhotoA && <img src={collagePhotoA} alt="Menu favorit" className="h-full w-full object-cover" />}
            </div>
            <div className="aspect-square flex-1 overflow-hidden rounded-2xl bg-[#E8DEC9] shadow-sm sm:rounded-3xl">
              {collagePhotoB && <img src={collagePhotoB} alt="Sajian hangat" className="h-full w-full object-cover" />}
            </div>
          </div>
        </div>
      </section>

      {/* Lookbook / Polaroid Best-Sellers Grid */}
      <section id="terlaris" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: accentColor }}>
            Rekomendasi &amp; Terlaris
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Favorit Tamu Minggu Ini</h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-7 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {bestSellers.slice(0, 4).map((dish) => (
            <article
              key={dish.id}
              className="flex flex-col rounded-3xl border bg-white p-3 shadow-sm transition hover:shadow-md"
              style={{ borderColor: "rgba(46,34,25,0.08)" }}
            >
              <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-[#F0E7D8] sm:aspect-square">
                {dish.image_url ? (
                  <img src={resolveAssetUrl(dish.image_url)} alt={dish.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#9A8573]">
                    <Coffee size={24} />
                  </div>
                )}
                {dish.badge && (
                  <span
                    className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {dish.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between px-1.5 pb-1.5 pt-3">
                <div>
                  <h3 className="font-display text-xl font-bold leading-snug">{dish.name}</h3>
                  {dish.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6E5B4D]">{dish.description}</p>
                  )}
                </div>
                <p className="mt-3 font-mono text-sm font-bold" style={{ color: accentColor }}>
                  {formatRupiah(dish.price)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center sm:mt-9">
          <Link
            to={menuPath}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-7 text-xs font-semibold text-white no-underline transition hover:opacity-90 sm:w-auto"
            style={{ backgroundColor: accentColor }}
          >
            <BookOpen size={14} strokeWidth={1.75} aria-hidden="true" />
            Buka Buku Menu Lengkap ({menu_items.length} Menu)
          </Link>
        </div>
      </section>

      {/* Cozy Promos & Gathering Strip */}
      {(promos.length > 0 || event_packages.length > 0) && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {promos.map((promo) => (
              <div key={promo.id} className="rounded-3xl p-6 sm:p-7" style={{ backgroundColor: "#EFE5D6" }}>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold" style={{ color: accentColor }}>
                  Promo Kedai {promo.end_date ? `· s/d ${promo.end_date}` : ""}
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold">{promo.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5C4B3E]">{promo.description}</p>
              </div>
            ))}
            {event_packages.map((pkg) => (
              <div key={pkg.id} className="flex flex-col justify-between rounded-3xl border bg-white p-6 sm:p-7" style={{ borderColor: "rgba(46,34,25,0.1)" }}>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F8F4EC] px-3 py-1 text-[10px] font-semibold text-[#5C4B3E]">
                    <Users size={11} strokeWidth={1.75} />
                    {pkg.capacity}
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-bold">{pkg.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5C4B3E]">{pkg.description}</p>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-sm font-bold" style={{ color: accentColor }}>
                    {pkg.price_label}
                  </span>
                  <button
                    type="button"
                    onClick={() => pickEvent(pkg.title)}
                    className="h-10 rounded-full px-4 text-xs font-semibold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    Tanya Jadwal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Branches + Cozy Reservation */}
      <section id="cabang" className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20">
        <div id="reservasi" className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: accentColor }}>
              Mampir ke Kedai
            </p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Lokasi &amp; Jam Buka</h2>
            <div className="space-y-3 pt-1">
              {branches.map((b) => (
                <div key={b.id} className="rounded-3xl border bg-white p-5" style={{ borderColor: "rgba(46,34,25,0.09)" }}>
                  <h3 className="font-display text-xl font-bold">{b.name}</h3>
                  <p className="mt-1.5 flex items-start gap-2 text-xs text-[#5C4B3E]">
                    <MapPin size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" style={{ color: accentColor }} />
                    {b.address}
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-[#8A7766]">
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
                      Buka Google Maps
                      <ExternalLink size={11} strokeWidth={2} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-8 lg:col-span-7" style={{ borderColor: "rgba(46,34,25,0.09)" }}>
            <h3 className="font-display text-3xl font-bold">Pesan Meja Lebih Awal</h3>
            <p className="mt-1 text-xs text-[#5C4B3E]">
              Mau kumpul santai, kerja bareng, atau arisan? Pilih tanggal dan konfirmasi langsung ke WhatsApp kami.
            </p>
            <div className="mt-6">
              <ReservationForm
                slug={slug}
                branches={branches}
                preset="cafe"
                accentColor={accentColor}
                selectedEventType={selectedEvent}
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-[#7D6959]" style={{ borderColor: "rgba(46,34,25,0.1)" }}>
        <p className="font-display text-lg font-bold text-[#2E2219]">{displayName}</p>
        <p className="mt-0.5 px-4">{displayTagline}</p>
      </footer>

      {/* Mobile Sticky Bottom Action Bar (only after scrolling past hero) */}
      {showMobileBar && (
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t bg-white/95 p-2.5 backdrop-blur-md md:hidden" style={{ borderColor: "rgba(46,34,25,0.1)" }}>
        <Link
          to={menuPath}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border text-xs font-semibold no-underline"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          <BookOpen size={14} strokeWidth={1.75} aria-hidden="true" />
          Buku Menu
        </Link>
        <a
          href="#reservasi"
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-white no-underline"
          style={{ backgroundColor: accentColor }}
        >
          <Calendar size={14} strokeWidth={1.75} aria-hidden="true" />
          Pesan Meja
        </a>
      </div>
      )}
    </div>
  );
}
