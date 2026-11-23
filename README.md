# Reneo Resto

Platform website restoran multi-tenant berbasis **Fastify 5 + PostgreSQL + React/Vite** untuk ekosistem **Reneo** (`resto.reneo.my.id`).

## Fitur Utama

- **Multi-Tenant & Custom Domain**: satu instalasi melayani banyak restoran dengan isolasi `tenant_id`, subdomain bawaan (`namaresto.resto.reneo.my.id`), dan custom domain klien (`namaresto.com`).
- **3 Tema Tampilan Berbeda**:
  1. **Heritage**: hero layar penuh gelap ber-scrim dengan tipografi serif hangat (referensi restoran keluarga klasik `angke.com`).
  2. **Bistro**: tata letak editorial modern kontras tinggi dengan hero split.
  3. **Cafe**: nuansa krem hangat dengan kartu membulat lembut ramah ponsel.
- **Buku Menu Online, Promo, Ruang Acara & Reservasi WhatsApp**: pencarian menu, filter kategori, penanda *Terlaris* / *Baru* / *Habis*, promo terjadwal, paket ruang privat, dan formulir reservasi yang tersimpan di PostgreSQL lalu membuka pesan WhatsApp terformat ke cabang pilihan.
- **Unggah & Ganti Gambar Mandiri**: pemilik restoran dapat mengunggah atau mengganti logo, banner hero, foto hidangan, banner promo, dan foto ruang acara langsung dari **Panel Admin (`/admin`)**.
- **Portal Superadmin (`/superadmin/restaurants`)**: buat tenant baru beserta akun pemilik, atur paket langganan, dan kelola custom domain klien.

## Variabel Lingkungan

- `PORT` (default `5057`)
- `DATABASE_URL` (PostgreSQL, disiapkan otomatis sebagai `reneo-resto-db` saat dipasang lewat Reneo Panel)
- `DATA_DIR` (default `/app/data`, menyimpan folder `uploads/`)
- `ADMIN_EMAIL` (default `admin@reneo.my.id`)
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `PLATFORM_DOMAIN` (default `resto.reneo.my.id`)

Lihat filosofi identitas visual di [docs/FILOSOFI-LOGO.md](docs/FILOSOFI-LOGO.md).
