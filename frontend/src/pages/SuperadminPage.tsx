import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, LogOut, Plus, Settings2, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import type { Tenant } from "../types";

interface SuperadminPageProps {
  onLogout: () => void;
}

export function SuperadminPage({ onLogout }: SuperadminPageProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [plan, setPlan] = useState("profesional");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [waNumber, setWaNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listTenants();
      setTenants(res.tenants);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar restoran.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createTenant({
        name: name.trim(),
        slug: slug.trim() || undefined,
        custom_domain: customDomain.trim() || undefined,
        plan,
        owner_email: ownerEmail.trim() || undefined,
        owner_password: ownerPassword || undefined,
        whatsapp_number: waNumber.trim() || undefined,
      });
      setName("");
      setSlug("");
      setCustomDomain("");
      setOwnerEmail("");
      setOwnerPassword("");
      setWaNumber("");
      await loadTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat tenant restoran.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header className="sticky top-0 z-20 border-b" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <div className="text-sm font-bold" style={{ color: "var(--ink)" }}>Portal Superadmin Reneo Resto</div>
            <div className="font-mono text-[11px]" style={{ color: "var(--ink-muted)" }}>Manajemen Tenant &amp; Custom Domain</div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex h-8 items-center rounded-lg border px-3 text-xs font-semibold no-underline" style={{ borderColor: "var(--border)", color: "var(--ink)" }}>
              Beranda Platform
            </Link>
            <button type="button" onClick={onLogout} className="inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold" style={{ borderColor: "var(--border)", color: "var(--danger)" }}>
              <LogOut size={13} strokeWidth={1.75} aria-hidden="true" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-7 sm:px-6 lg:grid-cols-12">
        <form onSubmit={(e) => void handleCreate(e)} className="space-y-3 rounded-xl border p-5 lg:col-span-4" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <h1 className="text-sm font-bold" style={{ color: "var(--ink)" }}>Buat Tenant Restoran Baru</h1>
          {error && <p className="text-xs font-medium" style={{ color: "var(--danger)" }}>{error}</p>}
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama restoran (mis: Depot Nusantara)" className="resto-field h-9 w-full px-3 text-sm" />
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug URL (otomatis jika kosong)" className="resto-field h-9 w-full px-3 font-mono text-xs" />
          <input type="text" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="Custom domain opsional (namaresto.com)" className="resto-field h-9 w-full px-3 font-mono text-xs" />
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className="resto-field resto-select h-9 w-full pl-3 text-xs">
            <option value="starter">Paket Starter</option>
            <option value="profesional">Paket Profesional + Admin</option>
            <option value="multi-cabang">Paket Multi-Cabang</option>
          </select>
          <input type="text" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="WhatsApp cabang utama (628xxx)" className="resto-field h-9 w-full px-3 font-mono text-xs" />
          <div className="border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
            <div className="mb-1.5 text-[11px] font-semibold" style={{ color: "var(--ink-muted)" }}>Akun Login Pemilik Restoran (opsional)</div>
            <div className="space-y-2">
              <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="Email admin resto" className="resto-field h-9 w-full px-3 text-xs" />
              <input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} placeholder="Kata sandi awal" className="resto-field h-9 w-full px-3 text-xs" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: "#0B2A57" }}>
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            {saving ? "Membuat..." : "Buat Tenant Restoran"}
          </button>
        </form>

        <div className="lg:col-span-8">
          {loading ? (
            <div className="py-10 text-center text-sm" style={{ color: "var(--ink-muted)" }}>Memuat tenant...</div>
          ) : (
            <div className="divide-y rounded-xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              {tenants.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>{t.name}</span>
                      <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase" style={{ backgroundColor: "var(--surface-muted)", color: "var(--ink-body)" }}>
                        {t.plan}
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px]" style={{ color: "var(--ink-muted)" }}>
                      {t.custom_domain || `${t.slug}.resto.reneo.my.id`} · {t.branch_count ?? 0} cabang · {t.menu_count ?? 0} menu · {t.reservation_count ?? 0} reservasi
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link to={`/r/${t.slug}`} className="inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold no-underline" style={{ borderColor: "var(--border)", color: "var(--ink)" }}>
                      Web
                      <ExternalLink size={11} strokeWidth={1.75} aria-hidden="true" />
                    </Link>
                    <Link to={`/admin/${t.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-white no-underline" style={{ backgroundColor: "#0B2A57" }}>
                      <Settings2 size={11} strokeWidth={1.75} aria-hidden="true" />
                      Kelola
                    </Link>
                    <button
                      type="button"
                      onClick={() => void api.deleteTenant(t.id).then(loadTenants)}
                      aria-label={`Hapus ${t.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border"
                      style={{ borderColor: "var(--border)", color: "var(--danger)" }}
                    >
                      <Trash2 size={12} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
