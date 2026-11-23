import type {
  AuthUser,
  Branch,
  EventPackage,
  MenuCategory,
  MenuItem,
  Promo,
  ReservationLead,
  StorefrontPayload,
  Tenant,
  TenantOverviewPayload,
} from "../types";
import { withBasePath } from "./basePath";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(withBasePath(url), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    let message = `Permintaan gagal (kode ${res.status}).`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // Keep default error
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export const api = {
  // Auth
  me: () => request<{ user: AuthUser | null }>("/api/auth/me"),
  login: (email: string, password: string) =>
    request<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),

  // Public
  resolveHost: () =>
    request<{ mode: "tenant" | "platform"; slug?: string; restaurants?: Tenant[] }>("/api/public/resolve"),
  getStorefront: (slug: string) =>
    request<StorefrontPayload>(`/api/public/restaurants/${encodeURIComponent(slug)}`),
  submitReservation: (
    slug: string,
    payload: {
      branch_id?: number;
      guest_name: string;
      guest_phone: string;
      event_type: string;
      date_time: string;
      pax: number;
      notes?: string;
    }
  ) =>
    request<{ reservation: ReservationLead; whatsapp_url: string }>(
      `/api/public/restaurants/${encodeURIComponent(slug)}/reservations`,
      { method: "POST", body: JSON.stringify(payload) }
    ),

  // Tenant Admin
  getTenantOverview: (tenantId: number) =>
    request<TenantOverviewPayload>(`/api/admin/tenants/${tenantId}/overview`),
  updateTenantProfile: (tenantId: number, payload: Partial<Tenant>) =>
    request<{ tenant: Tenant }>(`/api/admin/tenants/${tenantId}/profile`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  createCategory: (tenantId: number, name: string) =>
    request<{ category: MenuCategory }>(`/api/admin/tenants/${tenantId}/categories`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  deleteCategory: (tenantId: number, id: number) =>
    request<{ ok: boolean }>(`/api/admin/tenants/${tenantId}/categories/${id}`, { method: "DELETE" }),
  createMenuItem: (tenantId: number, payload: Partial<MenuItem>) =>
    request<{ item: MenuItem }>(`/api/admin/tenants/${tenantId}/menu-items`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateMenuItem: (tenantId: number, id: number, payload: Partial<MenuItem>) =>
    request<{ item: MenuItem }>(`/api/admin/tenants/${tenantId}/menu-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteMenuItem: (tenantId: number, id: number) =>
    request<{ ok: boolean }>(`/api/admin/tenants/${tenantId}/menu-items/${id}`, { method: "DELETE" }),
  createBranch: (tenantId: number, payload: Partial<Branch>) =>
    request<{ branch: Branch }>(`/api/admin/tenants/${tenantId}/branches`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteBranch: (tenantId: number, id: number) =>
    request<{ ok: boolean }>(`/api/admin/tenants/${tenantId}/branches/${id}`, { method: "DELETE" }),
  createPromo: (tenantId: number, payload: Partial<Promo>) =>
    request<{ promo: Promo }>(`/api/admin/tenants/${tenantId}/promos`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deletePromo: (tenantId: number, id: number) =>
    request<{ ok: boolean }>(`/api/admin/tenants/${tenantId}/promos/${id}`, { method: "DELETE" }),
  createEventPackage: (tenantId: number, payload: Partial<EventPackage>) =>
    request<{ event_package: EventPackage }>(`/api/admin/tenants/${tenantId}/events`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteEventPackage: (tenantId: number, id: number) =>
    request<{ ok: boolean }>(`/api/admin/tenants/${tenantId}/events/${id}`, { method: "DELETE" }),
  uploadImage: (tenantId: number, dataUrl: string, filename: string) =>
    request<{ url: string; size_bytes: number }>(`/api/admin/tenants/${tenantId}/upload`, {
      method: "POST",
      body: JSON.stringify({ data_url: dataUrl, filename }),
    }),
  updateReservationStatus: (
    tenantId: number,
    id: number,
    status: "new" | "confirmed" | "completed" | "cancelled"
  ) =>
    request<{ reservation: ReservationLead }>(`/api/admin/tenants/${tenantId}/reservations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Superadmin
  listTenants: () => request<{ tenants: Tenant[] }>("/api/superadmin/tenants"),
  createTenant: (payload: {
    name: string;
    slug?: string;
    custom_domain?: string;
    theme_preset?: string;
    primary_color?: string;
    plan?: string;
    owner_email?: string;
    owner_password?: string;
    whatsapp_number?: string;
  }) =>
    request<{ tenant: Tenant }>("/api/superadmin/tenants", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTenant: (id: number, payload: Partial<Tenant>) =>
    request<{ tenant: Tenant }>(`/api/superadmin/tenants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteTenant: (id: number) =>
    request<{ ok: boolean }>(`/api/superadmin/tenants/${id}`, { method: "DELETE" }),
};

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function resolveAssetUrl(raw?: string | null): string {
  const value = (raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  return withBasePath(value);
}
