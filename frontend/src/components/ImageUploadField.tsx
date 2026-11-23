import { useState, type ChangeEvent } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { api, resolveAssetUrl } from "../lib/api";

interface ImageUploadFieldProps {
  tenantId: number;
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  aspectClass?: string;
}

export function ImageUploadField({
  tenantId,
  label,
  value,
  onChange,
  aspectClass = "h-28",
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErr("Ukuran gambar maksimal 5 MB.");
      e.target.value = "";
      return;
    }
    setErr(null);
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await api.uploadImage(tenantId, String(reader.result || ""), file.name);
        onChange(res.url);
      } catch (uploadErr) {
        setErr(uploadErr instanceof Error ? uploadErr.message : "Gagal mengunggah gambar.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const previewSrc = resolveAssetUrl(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold" style={{ color: "var(--ink-body)" }}>
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <label className="inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-[11px] font-semibold" style={{ borderColor: "var(--border-strong)", color: "var(--ink)" }}>
            <Upload size={11} strokeWidth={1.75} aria-hidden="true" />
            {uploading ? "Mengunggah..." : value ? "Ganti Gambar" : "Unggah Gambar"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              disabled={uploading}
              onChange={handleFile}
              className="sr-only"
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label={`Hapus ${label}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border"
              style={{ borderColor: "var(--border)", color: "var(--danger)" }}
            >
              <Trash2 size={11} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {previewSrc ? (
        <div className={`overflow-hidden rounded-lg border ${aspectClass}`} style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
          <img src={previewSrc} alt={label} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div
          className={`flex items-center justify-center gap-2 rounded-lg border border-dashed text-xs ${aspectClass}`}
          style={{ borderColor: "var(--border)", color: "var(--ink-muted)", backgroundColor: "var(--bg)" }}
        >
          <ImageIcon size={15} strokeWidth={1.75} aria-hidden="true" />
          Belum ada gambar
        </div>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Atau tempel URL gambar (https://...)"
        className="resto-field h-8 w-full px-2.5 font-mono text-[11px]"
      />
      {err && <p className="text-[11px] font-medium" style={{ color: "var(--danger)" }}>{err}</p>}
    </div>
  );
}
