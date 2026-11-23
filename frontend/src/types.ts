export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: "superadmin" | "tenant_admin";
  tenantId: number | null;
}

export type ThemePreset = "banquet" | "bistro" | "cafe" | "omakase" | "coastal" | "street";
export type PlanKind = "starter" | "profesional" | "multi-cabang";

export interface Tenant {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  story: string;
  custom_domain: string | null;
  theme_preset: ThemePreset;
  primary_color: string;
  logo_url: string;
  hero_image_url: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  plan: PlanKind;
  status: "active" | "suspended";
  branch_count?: number;
  menu_count?: number;
  reservation_count?: number;
}

export interface Branch {
  id: number;
  tenant_id: number;
  name: string;
  address: string;
  maps_url: string;
  open_hours: string;
  whatsapp_number: string;
  is_primary: boolean;
}

export interface MenuCategory {
  id: number;
  tenant_id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: number;
  tenant_id: number;
  category_id: number | null;
  name: string;
  description: string;
  price: number;
  image_url: string;
  badge: string;
  is_available: boolean;
  sort_order: number;
}

export interface Promo {
  id: number;
  tenant_id: number;
  title: string;
  description: string;
  banner_url: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

export interface EventPackage {
  id: number;
  tenant_id: number;
  title: string;
  capacity: string;
  price_label: string;
  description: string;
  image_url: string;
}

export interface ReservationLead {
  id: number;
  tenant_id: number;
  branch_id: number | null;
  branch_name?: string | null;
  guest_name: string;
  guest_phone: string;
  event_type: string;
  date_time: string;
  pax: number;
  notes: string;
  status: "new" | "confirmed" | "completed" | "cancelled";
  created_at: string;
}

export interface StorefrontPayload {
  tenant: Tenant;
  branches: Branch[];
  categories: MenuCategory[];
  menu_items: MenuItem[];
  promos: Promo[];
  event_packages: EventPackage[];
}

export interface TenantOverviewPayload extends StorefrontPayload {
  reservations: ReservationLead[];
}
