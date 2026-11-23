import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, ExternalLink, LogOut, Plus, Trash2 } from "lucide-react";
import { api, formatRupiah, resolveAssetUrl } from "../lib/api";
import type { AuthUser, TenantOverviewPayload, ThemePreset } from "../types";
import { ImageUploadField } from "../components/ImageUploadField";

interface TenantAdminPageProps {
  user: AuthUser;
  onLogout: () => void;
}

const THEME_CARDS: ReadonlyArray<{ key: ThemePreset; title: string; desc: string }> = [
  { key: "heritage", title: "Heritage (Klasik)", desc: "Banner penuh gelap elegan ala restoran keluarga klasik, tipografi serif hangat." },
  { key: "bistro", title: "Bistro (Modern)", desc: "Tata letak split kontras tinggi dengan header gelap dan kartu menu tajam." },
  { key: "cafe", title: "Cafe (Artisan)", desc: "Nuansa krem hangat dengan sudut membulat lembut dan navigasi pil." },
];

export function TenantAdminPage({ user, onLogout }: TenantAdminPageProps) {
  const params = useParams<{ tenantId: string }>();
  const tenantId = params.tenantId ? Number(params.tenantId) : user.tenantId || 1;

  const [tab, setTab] = useState<"menu" | "reservations" | "promos" | "events" | "branches" | "profile">("menu");
  const [data, setData] = useState<TenantOverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Forms
  const [catName, setCatName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("45000");
  const [itemCat, setItemCat] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemBadge, setItemBadge] = useState("");
  const [itemImage, setItemImage] = useState("");

  const [promoTitle, setPromoTitle] = useState("");
  const [promoDesc, setPromoDesc] = useState("");
  const [promoBanner, setPromoBanner] = useState("");

  const [evtTitle, setEvtTitle] = useState("");
  const [evtCapacity, setEvtCapacity] = useState("");
  const [evtPrice, setEvtPrice] = useState("");
  const [evtDesc, setEvtDesc] = useState("");
  const [evtImage, setEvtImage] = useState("");

  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchHours, setBranchHours] = useState("10.00 - 22.00 WIB");
  const [branchWa, setBranchWa] = useState("");

  const [profName, setProfName] = useState("");
  const [profTagline, setProfTagline] = useState("");
  const [profStory, setProfStory] = useState("");
  const [profPreset, setProfPreset] = useState<ThemePreset>("heritage");
  const [profColor, setProfColor] = useState("#8B1E24");
  const [profLogo, setProfLogo] = useState("");
  const [profHero, setProfHero] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTenantOverview(tenantId);
      setData(res);
      setProfName(res.tenant.name);
      setProfTagline(res.tenant.tagline);
      setProfStory(res.tenant.story);
      setProfPreset(res.tenant.theme_preset);
      setProfColor(res.tenant.primary_color);
      setProfLogo(res.tenant.logo_url || "");
      setProfHero(res.tenant.hero_image_url || "");
      if (!itemCat && res.categories[0]) setItemCat(String(res.categories[0].id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data restoran.");
    } finally {
      setLoading(false);
    }
  }, [tenantId, itemCat]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const flash = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 2500);
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    await api.createCategory(tenantId, catName.trim());
    setCatName("");
    flash("Kategori menu ditambahkan.");
    await loadOverview();
  };

  const handleAddMenuItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    await api.createMenuItem(tenantId, {
      name: itemName.trim(),
      price: Number(itemPrice) || 0,
      category_id: itemCat ? Number(itemCat) : null,
      description: itemDesc.trim(),
      badge: itemBadge.trim(),
      image_url: itemImage.trim(),
      is_available: true,
    });
    setItemName("");
    setItemDesc("");
    setItemBadge("");
    setItemImage("");
    flash("Menu baru disimpan.");
    await loadOverview();
  };

  const handleToggleAvailable = async (id: number, current: boolean) => {
    await api.updateMenuItem(tenantId, id, { is_available: !current });
    await loadOverview();
  };

  const handleAddPromo = async (e: FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim()) return;
    await api.createPromo(tenantId, {
      title: promoTitle.trim(),
      description: promoDesc.trim(),
      banner_url: promoBanner.trim(),
    });
    setPromoTitle("");
    setPromoDesc("");
    setPromoBanner("");
    flash("Promo aktif ditambahkan.");
    await loadOverview();
  };

  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;
    await api.createEventPackage(tenantId, {
      title: evtTitle.trim(),
      capacity: evtCapacity.trim(),
      price_label: evtPrice.trim(),
      description: evtDesc.trim(),
      image_url: evtImage.trim(),
    });
    setEvtTitle("");
    setEvtCapacity("");
    setEvtPrice("");
    setEvtDesc("");
    setEvtImage("");
    flash("Paket ruang acara ditambahkan.");
    await loadOverview();
  };

  const handleAddBranch = async (e: FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;
    await api.createBranch(tenantId, {
      name: branchName.trim(),
      address: branchAddress.trim(),
      open_hours: branchHours.trim(),
      whatsapp_number: branchWa.trim(),
    });
    setBranchName("");
    setBranchAddress("");
    setBranchWa("");
    flash("Cabang baru ditambahkan.");
    await loadOverview();
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    await api.updateTenantProfile(tenantId, {
      name: profName.trim(),
      tagline: profTagline.trim(),
      story: profStory.trim(),
      theme_preset: profPreset,
      primary_color: profColor,
      logo_url: profLogo.trim(),
      hero_image_url: profHero.trim(),
    });
    flash("Profil, gambar, dan tema restoran diperbarui.");
    await loadOverview();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header className="sticky top-0 z-20 border-b" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {user.role === "superadmin" && (
              <Link to="/superadmin/restaurants" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border" style={{ borderColor: "var(--border)", color: "var(--ink)" }}>
                <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            )}
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                {data?.tenant.name || "Dashboard Restoran"}
              </div>
              <div className="font-mono text-[11px]" style={{ color: "var(--ink-muted)" }}>
                Panel Admin Tenant
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data && (
              <Link
                to={`/r/${data.tenant.slug}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold no-underline"
                style={{ borderColor: "var(--border)", color: "var(--ink)" }}
              >
                Lihat Website
                <ExternalLink size={12} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold"
              style={{ borderColor: "var(--border)", color: "var(--danger)" }}
            >
              <LogOut size={13} strokeWidth={1.75} aria-hidden="true" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap gap-1.5 border-b pb-3" style={{ borderColor: "var(--border)" }}>
          {(
            [
              { id: "menu", label: `Menu (${data?.menu_items.length ?? 0})` },
              { id: "reservations", label: `Reservasi (${data?.reservations.length ?? 0})` },
              { id: "promos", label: `Promo (${data?.promos.length ?? 0})` },
              { id: "events", label: `Ruang Acara (${data?.event_packages.length ?? 0})` },
              { id: "branches", label: `Cabang (${data?.branches.length ?? 0})` },
              { id: "profile", label: "Profil, Gambar & Tema" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="h-8 rounded-lg px-3 text-xs font-semibold transition-colors"
              style={{
                backgroundColor: tab === t.id ? "#0B2A57" : "var(--surface)",
                color: tab === t.id ? "#ffffff" : "var(--ink-body)",
                border: tab === t.id ? "1px solid #0B2A57" : "1px solid var(--border)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {notice && (
          <div className="mt-4 rounded-lg border px-3.5 py-2 text-xs font-semibold" style={{ backgroundColor: "var(--emerald-bg)", borderColor: "var(--emerald)", color: "var(--emerald)" }}>
            {notice}
          </div>
        )}

        {error && (
          <div role="alert" className="mt-4 rounded-lg border px-3.5 py-2 text-xs font-semibold" style={{ backgroundColor: "var(--danger-bg)", borderColor: "var(--danger)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        {loading || !data ? (
          <div className="py-12 text-center text-sm" style={{ color: "var(--ink-muted)" }}>
            Memuat panel restoran...
          </div>
        ) : (
          <div className="mt-5">
            {tab === "menu" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-4">
                  <form onSubmit={(e) => void handleAddMenuItem(e)} className="space-y-3 rounded-xl border p-4" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                    <h2 className="text-sm font-bold" style={{ color: "var(--ink)" }}>Tambah Hidangan</h2>
                    <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Nama menu" className="resto-field h-9 w-full px-3 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" required value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="Harga (Rp)" className="resto-field h-9 w-full px-3 text-sm font-mono" />
                      <select value={itemCat} onChange={(e) => setItemCat(e.target.value)} className="resto-field resto-select h-9 w-full pl-2.5 text-xs">
                        <option value="">Tanpa kategori</option>
                        {data.categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <input type="text" value={itemBadge} onChange={(e) => setItemBadge(e.target.value)} placeholder="Label opsional (Terlaris / Baru)" className="resto-field h-9 w-full px-3 text-xs" />
                    <textarea rows={2} value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Deskripsi singkat hidangan" className="resto-field w-full p-2.5 text-xs" />
                    <ImageUploadField tenantId={tenantId} label="Foto Hidangan" value={itemImage} onChange={setItemImage} aspectClass="h-24" />
                    <button type="submit" className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: "#0B2A57" }}>
                      <Plus size={14} strokeWidth={2} aria-hidden="true" />
                      Simpan Menu
                    </button>
                  </form>

                  <form onSubmit={(e) => void handleAddCategory(e)} className="space-y-2.5 rounded-xl border p-4" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                    <h2 className="text-sm font-bold" style={{ color: "var(--ink)" }}>Kategori Menu</h2>
                    <div className="flex gap-2">
                      <input type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Nama kategori baru" className="resto-field h-9 flex-1 px-3 text-xs" />
                      <button type="submit" className="h-9 rounded-lg px-3 text-xs font-semibold text-white" style={{ backgroundColor: "#0B2A57" }}>Tambah</button>
                    </div>
                    <div className="space-y-1 pt-1">
                      {data.categories.map((c) => (
                        <div key={c.id} className="flex items-center justify-between rounded-md px-2 py-1 text-xs" style={{ backgroundColor: "var(--bg)" }}>
                          <span>{c.name}</span>
                          <button type="button" onClick={() => void api.deleteCategory(tenantId, c.id).then(loadOverview)} aria-label={`Hapus ${c.name}`} style={{ color: "var(--danger)" }}>
                            <Trash2 size={12} strokeWidth={1.75} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </form>
                </div>

                <div className="divide-y rounded-xl border lg:col-span-8" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                  {data.menu_items.map((item) => {
                    const thumb = resolveAssetUrl(item.image_url);
                    return (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {thumb && <img src={thumb} alt={item.name} className="h-11 w-14 shrink-0 rounded-md object-cover" />}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold" style={{ color: "var(--ink)" }}>{item.name}</div>
                            <div className="font-mono text-xs" style={{ color: "var(--ink-muted)" }}>{formatRupiah(item.price)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleToggleAvailable(item.id, item.is_available)}
                            className="h-7 rounded-md border px-2.5 text-xs font-semibold"
                            style={{
                              backgroundColor: item.is_available ? "var(--emerald-bg)" : "var(--danger-bg)",
                              borderColor: item.is_available ? "var(--emerald)" : "var(--danger)",
                              color: item.is_available ? "var(--emerald)" : "var(--danger)",
                            }}
                          >
                            {item.is_available ? "Tersedia" : "Habis"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void api.deleteMenuItem(tenantId, item.id).then(loadOverview)}
                            aria-label={`Hapus ${item.name}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border"
                            style={{ borderColor: "var(--border)", color: "var(--danger)" }}
                          >
                            <Trash2 size={12} strokeWidth={1.75} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === "reservations" && (
              <div className="overflow-x-auto rounded-xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                {data.reservations.length === 0 ? (
                  <div className="p-10 text-center text-sm" style={{ color: "var(--ink-muted)" }}>
                    Belum ada permintaan reservasi yang masuk.
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}>
                        <th className="px-4 py-2.5 font-semibold">Tamu</th>
                        <th className="px-4 py-2.5 font-semibold">Cabang &amp; Jadwal</th>
                        <th className="px-4 py-2.5 font-semibold">Acara</th>
                        <th className="px-4 py-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                      {data.reservations.map((r) => (
                        <tr key={r.id}>
                          <td className="px-4 py-3">
                            <div className="font-semibold" style={{ color: "var(--ink)" }}>{r.guest_name}</div>
                            <div className="font-mono text-[11px]" style={{ color: "var(--ink-muted)" }}>{r.guest_phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div>{r.branch_name || "Cabang Utama"}</div>
                            <div className="font-mono text-[11px]" style={{ color: "var(--ink-muted)" }}>{r.date_time} · {r.pax} org</div>
                          </td>
                          <td className="px-4 py-3">
                            <div>{r.event_type}</div>
                            {r.notes && <div className="text-[11px]" style={{ color: "var(--ink-muted)" }}>{r.notes}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={r.status}
                              onChange={(e) => void api.updateReservationStatus(tenantId, r.id, e.target.value as typeof r.status).then(loadOverview)}
                              className="resto-field resto-select h-8 pl-2.5 text-xs font-semibold"
                            >
                              <option value="new">Baru</option>
                              <option value="confirmed">Dikonfirmasi</option>
                              <option value="completed">Selesai</option>
                              <option value="cancelled">Batal</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "promos" && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                <form onSubmit={(e) => void handleAddPromo(e)} className="space-y-3 rounded-xl border p-4 md:col-span-5" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                  <h2 className="text-sm font-bold">Tambah Promo</h2>
                  <input type="text" required value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} placeholder="Judul promo" className="resto-field h-9 w-full px-3 text-sm" />
                  <textarea rows={3} value={promoDesc} onChange={(e) => setPromoDesc(e.target.value)} placeholder="Keterangan dan syarat promo" className="resto-field w-full p-2.5 text-xs" />
                  <ImageUploadField tenantId={tenantId} label="Banner Promo (opsional)" value={promoBanner} onChange={setPromoBanner} aspectClass="h-24" />
                  <button type="submit" className="h-9 rounded-lg px-4 text-xs font-semibold text-white" style={{ backgroundColor: "#0B2A57" }}>Simpan Promo</button>
                </form>
                <div className="divide-y rounded-xl border md:col-span-7" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                  {data.promos.map((p) => (
                    <div key={p.id} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold">{p.title}</div>
                        <div className="mt-0.5 text-xs" style={{ color: "var(--ink-muted)" }}>{p.description}</div>
                      </div>
                      <button type="button" onClick={() => void api.deletePromo(tenantId, p.id).then(loadOverview)} style={{ color: "var(--danger)" }}>
                        <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "events" && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                <form onSubmit={(e) => void handleAddEvent(e)} className="space-y-3 rounded-xl border p-4 md:col-span-5" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                  <h2 className="text-sm font-bold">Tambah Paket Ruang Acara</h2>
                  <input type="text" required value={evtTitle} onChange={(e) => setEvtTitle(e.target.value)} placeholder="Nama paket / ruangan" className="resto-field h-9 w-full px-3 text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={evtCapacity} onChange={(e) => setEvtCapacity(e.target.value)} placeholder="Kapasitas (mis: 20 Tamu)" className="resto-field h-9 w-full px-3 text-xs" />
                    <input type="text" value={evtPrice} onChange={(e) => setEvtPrice(e.target.value)} placeholder="Harga (mis: Mulai Rp 3jt)" className="resto-field h-9 w-full px-3 text-xs" />
                  </div>
                  <textarea rows={2} value={evtDesc} onChange={(e) => setEvtDesc(e.target.value)} placeholder="Fasilitas dan rincian paket" className="resto-field w-full p-2.5 text-xs" />
                  <ImageUploadField tenantId={tenantId} label="Foto Ruangan / Acara" value={evtImage} onChange={setEvtImage} aspectClass="h-24" />
                  <button type="submit" className="h-9 rounded-lg px-4 text-xs font-semibold text-white" style={{ backgroundColor: "#0B2A57" }}>Simpan Paket Acara</button>
                </form>
                <div className="divide-y rounded-xl border md:col-span-7" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                  {data.event_packages.map((ev) => {
                    const thumb = resolveAssetUrl(ev.image_url);
                    return (
                      <div key={ev.id} className="flex items-start justify-between gap-3 px-4 py-3">
                        <div className="flex items-start gap-3">
                          {thumb && <img src={thumb} alt={ev.title} className="h-12 w-16 shrink-0 rounded-md object-cover" />}
                          <div>
                            <div className="text-sm font-semibold">{ev.title}</div>
                            <div className="text-xs" style={{ color: "var(--ink-muted)" }}>{ev.capacity} · {ev.price_label}</div>
                          </div>
                        </div>
                        <button type="button" onClick={() => void api.deleteEventPackage(tenantId, ev.id).then(loadOverview)} style={{ color: "var(--danger)" }}>
                          <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === "branches" && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                <form onSubmit={(e) => void handleAddBranch(e)} className="space-y-3 rounded-xl border p-4 md:col-span-5" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                  <h2 className="text-sm font-bold">Tambah Cabang</h2>
                  <input type="text" required value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="Nama cabang" className="resto-field h-9 w-full px-3 text-sm" />
                  <input type="text" value={branchAddress} onChange={(e) => setBranchAddress(e.target.value)} placeholder="Alamat lengkap" className="resto-field h-9 w-full px-3 text-xs" />
                  <input type="text" value={branchHours} onChange={(e) => setBranchHours(e.target.value)} placeholder="Jam buka" className="resto-field h-9 w-full px-3 text-xs" />
                  <input type="text" value={branchWa} onChange={(e) => setBranchWa(e.target.value)} placeholder="No. WhatsApp (628xxx)" className="resto-field h-9 w-full px-3 font-mono text-xs" />
                  <button type="submit" className="h-9 rounded-lg px-4 text-xs font-semibold text-white" style={{ backgroundColor: "#0B2A57" }}>Simpan Cabang</button>
                </form>
                <div className="divide-y rounded-xl border md:col-span-7" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                  {data.branches.map((b) => (
                    <div key={b.id} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold">{b.name}</div>
                        <div className="text-xs" style={{ color: "var(--ink-muted)" }}>{b.address} · {b.open_hours}</div>
                        <div className="font-mono text-[11px]" style={{ color: "var(--ink-body)" }}>WA: {b.whatsapp_number || "-"}</div>
                      </div>
                      <button type="button" onClick={() => void api.deleteBranch(tenantId, b.id).then(loadOverview)} style={{ color: "var(--danger)" }}>
                        <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "profile" && (
              <form onSubmit={(e) => void handleSaveProfile(e)} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 rounded-xl border p-5 lg:col-span-7" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                  <h2 className="text-sm font-bold">Identitas &amp; Pilihan Tema Tampilan</h2>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Nama Restoran</label>
                    <input type="text" required value={profName} onChange={(e) => setProfName(e.target.value)} className="resto-field h-9 w-full px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Tagline Utama</label>
                    <input type="text" value={profTagline} onChange={(e) => setProfTagline(e.target.value)} className="resto-field h-9 w-full px-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Cerita Singkat Restoran</label>
                    <textarea rows={3} value={profStory} onChange={(e) => setProfStory(e.target.value)} className="resto-field w-full p-2.5 text-sm" />
                  </div>

                  <div>
                    <span className="mb-2 block text-xs font-semibold">Pilih Tema Tampilan Website</span>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      {THEME_CARDS.map((card) => {
                        const active = profPreset === card.key;
                        return (
                          <button
                            key={card.key}
                            type="button"
                            onClick={() => setProfPreset(card.key)}
                            aria-pressed={active}
                            className="flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors"
                            style={{
                              borderColor: active ? "#0B2A57" : "var(--border)",
                              backgroundColor: active ? "var(--surface-muted)" : "var(--surface)",
                            }}
                          >
                            <div className="flex w-full items-center justify-between text-xs font-bold" style={{ color: "var(--ink)" }}>
                              <span>{card.title}</span>
                              {active && <Check size={13} strokeWidth={2.5} aria-hidden="true" />}
                            </div>
                            <p className="text-[11px] leading-snug" style={{ color: "var(--ink-muted)" }}>
                              {card.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">Warna Aksen Utama</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={profColor} onChange={(e) => setProfColor(e.target.value)} className="h-9 w-12 rounded border p-0.5" />
                      <input type="text" value={profColor} onChange={(e) => setProfColor(e.target.value)} className="resto-field h-9 w-36 px-2.5 font-mono text-xs" />
                    </div>
                  </div>

                  <button type="submit" className="h-10 rounded-lg px-5 text-xs font-semibold text-white" style={{ backgroundColor: "#0B2A57" }}>
                    Simpan Profil, Gambar &amp; Tema
                  </button>
                </div>

                <div className="space-y-4 rounded-xl border p-5 lg:col-span-5" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                  <h2 className="text-sm font-bold">Gambar &amp; Media Utama</h2>
                  <ImageUploadField tenantId={tenantId} label="Logo Restoran" value={profLogo} onChange={setProfLogo} aspectClass="h-24" />
                  <ImageUploadField tenantId={tenantId} label="Foto Banner Utama (Hero)" value={profHero} onChange={setProfHero} aspectClass="h-40" />
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
