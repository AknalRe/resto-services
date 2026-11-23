import { Pool } from "pg";
import { config } from "./config";
import { hashPassword } from "./auth";

let poolInstance: Pool | null = null;

export function getPool(customUrl?: string): Pool {
  if (poolInstance && !customUrl) return poolInstance;
  const pool = new Pool({
    connectionString: customUrl || config.databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  if (!customUrl) {
    poolInstance = pool;
  }
  return pool;
}

export async function initDatabase(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL DEFAULT '',
      story TEXT NOT NULL DEFAULT '',
      custom_domain TEXT UNIQUE,
      theme_preset TEXT NOT NULL DEFAULT 'heritage' CHECK(theme_preset IN ('heritage', 'bistro', 'cafe')),
      primary_color TEXT NOT NULL DEFAULT '#8B1E24',
      logo_url TEXT NOT NULL DEFAULT '',
      hero_image_url TEXT NOT NULL DEFAULT '',
      instagram_url TEXT NOT NULL DEFAULT '',
      facebook_url TEXT NOT NULL DEFAULT '',
      tiktok_url TEXT NOT NULL DEFAULT '',
      plan TEXT NOT NULL DEFAULT 'profesional' CHECK(plan IN ('starter', 'profesional', 'multi-cabang')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended')),
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'tenant_admin' CHECK(role IN ('superadmin', 'tenant_admin')),
      tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS branches (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '',
      maps_url TEXT NOT NULL DEFAULT '',
      open_hours TEXT NOT NULL DEFAULT '10.00 - 22.00 WIB',
      whatsapp_number TEXT NOT NULL DEFAULT '',
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS menu_categories (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES menu_categories(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL DEFAULT '',
      badge TEXT NOT NULL DEFAULT '',
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS promos (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      banner_url TEXT NOT NULL DEFAULT '',
      start_date DATE,
      end_date DATE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS event_packages (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      capacity TEXT NOT NULL DEFAULT '',
      price_label TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reservation_leads (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
      guest_name TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      event_type TEXT NOT NULL DEFAULT 'Makan Keluarga',
      date_time TEXT NOT NULL,
      pax INTEGER NOT NULL DEFAULT 4,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'confirmed', 'completed', 'cancelled')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_branches_tenant ON branches(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_menu_cats_tenant ON menu_categories(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON menu_items(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_promos_tenant ON promos(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_events_tenant ON event_packages(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_tenant ON reservation_leads(tenant_id);
  `);

  await seedInitialData(pool);
}

async function seedInitialData(pool: Pool): Promise<void> {
  // 1. Ensure superadmin user exists
  const sa = await pool.query("SELECT id FROM users WHERE email = $1", [config.adminEmail]);
  if (sa.rowCount === 0) {
    await pool.query(
      "INSERT INTO users (email, name, password_hash, role, tenant_id) VALUES ($1, $2, $3, 'superadmin', NULL)",
      [config.adminEmail, "Superadmin Reneo", hashPassword(config.adminPassword)]
    );
  }

  // 2. Seed rich demo restaurant tenant if none exists
  const existingTenants = await pool.query("SELECT id FROM tenants LIMIT 1");
  if ((existingTenants.rowCount ?? 0) > 0) {
    // Ensure demo tenant gets starter hero photo if still blank
    await pool.query(
      "UPDATE tenants SET hero_image_url = '/demo/hero-heritage.jpg' WHERE slug = 'kedai-heritage' AND hero_image_url = ''"
    );
    await pool.query(
      "UPDATE menu_items SET image_url = '/demo/dish-ayam.jpg' WHERE name = 'Ayam Goreng Mentega Heritage' AND image_url = ''"
    );
    await pool.query(
      "UPDATE menu_items SET image_url = '/demo/dish-gurame.jpg' WHERE name = 'Gurame Asam Manis Nanas' AND image_url = ''"
    );
    await pool.query(
      "UPDATE event_packages SET image_url = '/demo/room-vip.jpg' WHERE title = 'Ruang Privat VIP' AND image_url = ''"
    );
    return;
  }

  const tenantRes = await pool.query<{ id: number }>(
    `INSERT INTO tenants (
      slug, name, tagline, story, theme_preset, primary_color, hero_image_url,
      instagram_url, plan, status
    ) VALUES ($1, $2, $3, $4, 'heritage', '#8B1E24', '/demo/hero-heritage.jpg', $5, 'multi-cabang', 'active')
    RETURNING id`,
    [
      "kedai-heritage",
      "Rumah Makan Heritage",
      "Sajian Klasik Keluarga, Dimasak Segar Setiap Hari",
      "Sejak 1988 kami menjaga resep warisan dapur keluarga dengan bahan pilihan, ruang makan nyaman untuk kumpul keluarga, dan ruang privat untuk jamuan bisnis maupun syukuran.",
      "https://instagram.com",
    ]
  );
  const tenantId = tenantRes.rows[0].id;

  // Demo tenant admin account
  await pool.query(
    `INSERT INTO users (email, name, password_hash, role, tenant_id)
     VALUES ($1, $2, $3, 'tenant_admin', $4)
     ON CONFLICT (email) DO NOTHING`,
    ["owner@heritage.reneo.my.id", "Pemilik Heritage", hashPassword("heritage123"), tenantId]
  );

  // Branches
  await pool.query(
    `INSERT INTO branches (tenant_id, name, address, maps_url, open_hours, whatsapp_number, is_primary)
     VALUES
       ($1, 'Cabang Pusat Kota', 'Jl. Raya Darmo No. 48, Surabaya', 'https://maps.google.com/?q=Surabaya', '10.00 - 22.00 WIB', '6281234567890', TRUE),
       ($1, 'Cabang Barat', 'Jl. HR Muhammad No. 112, Surabaya', 'https://maps.google.com/?q=Surabaya+Barat', '11.00 - 22.00 WIB', '6281234567891', FALSE)`,
    [tenantId]
  );

  // Menu Categories
  const catNames = ["Hidangan Utama", "Seafood & Ikan", "Sayuran & Sup", "Minuman & Penutup"];
  const catIds: number[] = [];
  for (let i = 0; i < catNames.length; i++) {
    const r = await pool.query<{ id: number }>(
      "INSERT INTO menu_categories (tenant_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id",
      [tenantId, catNames[i], i + 1]
    );
    catIds.push(r.rows[0].id);
  }

  // Menu Items
  const items = [
    [catIds[0], "Ayam Goreng Mentega Heritage", "Ayam kampung goreng renyah disiram saus mentega bawang bombay khas dapur kami.", 88000, "/demo/dish-ayam.jpg", "Terlaris", 1],
    [catIds[0], "Sapi Lada Hitam Hotplate", "Irisan has dalam empuk dimasak dengan lada hitam sangrai dan paprika segar.", 118000, "", "Terlaris", 2],
    [catIds[0], "Bebek Panggang Bumbu Rempah", "Bebek panggang kulit garing dengan saus hoisin buatan rumah dan acar lobak.", 145000, "", "Baru", 3],
    [catIds[1], "Gurame Asam Manis Nanas", "Ikan gurame segar fillet goreng tepung dengan saus asam manis nanas madu.", 135000, "/demo/dish-gurame.jpg", "Terlaris", 1],
    [catIds[1], "Udang Telur Asin Renyah", "Udang windu goreng kering dibalut saus kuning telur asin gurih dan daun kari.", 128000, "", "", 2],
    [catIds[1], "Cumi Goreng Tepung Lada Garam", "Cumi segar potong cincin digoreng garing dengan taburan cabai dan bawang putih.", 92000, "", "", 3],
    [catIds[2], "Sup Asparagus Kepiting", "Kaldu ayam bening kental dengan daging kepiting segar dan asparagus muda.", 85000, "", "Terlaris", 1],
    [catIds[2], "Brokoli Cah Jamur Shiitake", "Brokoli hijau renyah ditumis cepat dengan jamur shiitake dan saus tiram.", 64000, "", "", 2],
    [catIds[3], "Es Jeruk Kunci Madu", "Perasan jeruk kunci segar dengan madu hutan murni.", 28000, "", "", 1],
    [catIds[3], "Puding Almond Longan", "Puding almond lembut dingin disajikan dengan buah kelengkeng manis.", 38000, "", "Baru", 2],
  ];

  for (const [catId, name, desc, price, imgUrl, badge, sortOrder] of items) {
    await pool.query(
      `INSERT INTO menu_items (tenant_id, category_id, name, description, price, image_url, badge, is_available, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8)`,
      [tenantId, catId, name, desc, price, imgUrl, badge, sortOrder]
    );
  }

  // Promos
  await pool.query(
    `INSERT INTO promos (tenant_id, title, description, is_active)
     VALUES
       ($1, 'Paket Makan Siang Keluarga (4 Orang)', 'Hemat 15% untuk 3 hidangan utama, 1 sup, nasi putih, dan 4 teh tawar hangat setiap Senin sampai Jumat pukul 11.00 - 15.00.', TRUE),
       ($1, 'Gratis Puding Almond untuk Reservasi Ulang Tahun', 'Dapatkan 1 porsi besar Puding Almond Longan untuk reservasi meja minimal 8 tamu melalui formulir website.', TRUE)`,
    [tenantId]
  );

  // Event Packages
  await pool.query(
    `INSERT INTO event_packages (tenant_id, title, capacity, price_label, description, image_url, sort_order)
     VALUES
       ($1, 'Ruang Privat VIP', '10 - 18 Tamu', 'Mulai Rp 2.500.000', 'Ruang tertutup ber-AC dengan meja bundar, TV presentasi, dan pelayan khusus untuk rapat bisnis atau jamuan keluarga.', '/demo/room-vip.jpg', 1),
       ($1, 'Paket Sangjit & Lamaran', '30 - 60 Tamu', 'Mulai Rp 7.800.000', 'Set menu 8 hidangan lengkap, dekorasi meja standar, sound system, dan parkir prioritas.', '/demo/hero-heritage.jpg', 2),
       ($1, 'Jamuan Ulang Tahun & Arisan', '20 - 40 Tamu', 'Mulai Rp 4.500.000', 'Pilihan menu prasmanan atau set meja keluarga dengan free flow teh dan area foto keluarga.', '', 3)`,
    [tenantId]
  );
}
