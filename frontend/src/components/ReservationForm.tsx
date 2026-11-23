import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { api } from "../lib/api";
import type { Branch, ThemePreset } from "../types";

interface ReservationFormProps {
  slug: string;
  branches: Branch[];
  preset: ThemePreset;
  accentColor: string;
  selectedEventType?: string;
}

export function ReservationForm({
  slug,
  branches,
  preset,
  accentColor,
  selectedEventType,
}: ReservationFormProps) {
  const [branchId, setBranchId] = useState<string>(branches[0] ? String(branches[0].id) : "");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [eventType, setEventType] = useState(selectedEventType || "Makan Keluarga");
  const [dateTime, setDateTime] = useState("");
  const [pax, setPax] = useState(4);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ waUrl: string } | null>(null);

  useEffect(() => {
    if (selectedEventType) setEventType(selectedEventType);
  }, [selectedEventType]);

  useEffect(() => {
    if (!branchId && branches.length > 0) setBranchId(String(branches[0].id));
  }, [branches, branchId]);

  const isDark = preset === "bistro";
  const isCafe = preset === "cafe";

  const fieldClass = isDark
    ? "h-11 w-full border border-white/15 bg-[#0E1013] px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#D97736] focus:outline-none"
    : isCafe
      ? "h-11 w-full rounded-2xl border border-[#2E2219]/15 bg-[#FAF7F2] px-4 text-sm text-[#2E2219] placeholder:text-[#8A7766] focus:border-[#2F483E] focus:outline-none"
      : "h-11 w-full rounded-md border border-[#1F1612]/15 bg-[#FAF6EE]/60 px-3.5 text-sm text-[#1F1612] placeholder:text-[#8C7B70] focus:border-[#8B1E24] focus:outline-none";

  const labelClass = isDark
    ? "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400"
    : isCafe
      ? "mb-1.5 block text-xs font-semibold text-[#5C4B3E]"
      : "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E]";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.submitReservation(slug, {
        branch_id: branchId ? Number(branchId) : undefined,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
        event_type: eventType,
        date_time: dateTime.trim(),
        pax,
        notes: notes.trim(),
      });
      setSuccess({ waUrl: res.whatsapp_url });
      setGuestName("");
      setGuestPhone("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim permintaan reservasi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      {error && (
        <div
          className="border px-4 py-3 text-xs font-medium"
          style={{
            borderRadius: isCafe ? "16px" : isDark ? "2px" : "6px",
            backgroundColor: isDark ? "rgba(185,28,28,0.18)" : "rgba(185,28,28,0.08)",
            borderColor: "rgba(185,28,28,0.35)",
            color: isDark ? "#FCA5A5" : "#991B1B",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="border p-4 text-xs"
          style={{
            borderRadius: isCafe ? "16px" : isDark ? "2px" : "6px",
            backgroundColor: isDark ? "rgba(16,185,129,0.14)" : "rgba(4,120,87,0.08)",
            borderColor: isDark ? "rgba(16,185,129,0.35)" : "rgba(4,120,87,0.28)",
            color: isDark ? "#A7F3D0" : "#065F46",
          }}
        >
          <p className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 size={15} strokeWidth={2} aria-hidden="true" />
            Permintaan reservasi tercatat.
          </p>
          <p className="mt-1 opacity-90">
            Lanjutkan konfirmasi langsung via WhatsApp agar tim restoran segera menyiapkan meja Anda.
          </p>
          {success.waUrl && (
            <a
              href={success.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-9 items-center gap-1.5 px-4 text-xs font-semibold text-white no-underline"
              style={{
                backgroundColor: "#15803D",
                borderRadius: isCafe ? "9999px" : isDark ? "2px" : "6px",
              }}
            >
              <MessageCircle size={14} strokeWidth={1.75} aria-hidden="true" />
              Konfirmasi via WhatsApp
            </a>
          )}
        </div>
      )}

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nama Pemesan</label>
          <input
            type="text"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Budi Santoso"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Nomor WhatsApp</label>
          <input
            type="tel"
            required
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="0812xxxxxxxx"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        {branches.length > 0 && (
          <div>
            <label className={labelClass}>Lokasi Cabang</label>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className={fieldClass}>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className={isDark ? "bg-[#0E1013] text-white" : ""}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={labelClass}>Keperluan / Acara</label>
          <input
            type="text"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            placeholder="Makan Keluarga / Arisan / Dinner"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Tanggal & Jam</label>
          <input
            type="text"
            required
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            placeholder="Sabtu, 25 Okt · 19:00 WIB"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Jumlah Tamu (Pax)</label>
          <input
            type="number"
            min={1}
            max={500}
            required
            value={pax}
            onChange={(e) => setPax(Number(e.target.value))}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Catatan Tambahan (Opsional)</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Permintaan ruang VIP, kursi bayi, atau alergi makanan"
          className={`${fieldClass} h-auto py-2.5`}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:opacity-90 disabled:opacity-60"
        style={{
          backgroundColor: accentColor,
          borderRadius: isCafe ? "9999px" : isDark ? "2px" : "6px",
        }}
      >
        <MessageCircle size={15} strokeWidth={1.75} aria-hidden="true" />
        {submitting ? "Mengirim..." : "Kirim Permintaan Reservasi"}
      </button>
    </form>
  );
}
