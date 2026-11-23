import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { api } from "./lib/api";
import { getAppBasePath } from "./lib/basePath";
import type { AuthUser, Tenant, ThemePreset } from "./types";
import { PlatformHomePage } from "./pages/PlatformHomePage";
import { StorefrontPage } from "./pages/StorefrontPage";
import { MenuPage } from "./pages/MenuPage";
import { LoginPage } from "./pages/LoginPage";
import { TenantAdminPage } from "./pages/TenantAdminPage";
import { SuperadminPage } from "./pages/SuperadminPage";

function TemplatePreviewRoute({ defaultSlug }: { defaultSlug: string }) {
  const { preset } = useParams<{ preset: string }>();
  const validPreset: ThemePreset =
    preset === "bistro" || preset === "cafe" || preset === "heritage" ? preset : "heritage";
  return <StorefrontPage forcedSlug={defaultSlug} previewPreset={validPreset} />;
}

function TemplatePreviewMenuRoute({ defaultSlug }: { defaultSlug: string }) {
  const { preset } = useParams<{ preset: string }>();
  const validPreset: ThemePreset =
    preset === "bistro" || preset === "cafe" || preset === "heritage" ? preset : "heritage";
  return <MenuPage forcedSlug={defaultSlug} previewPreset={validPreset} />;
}

export function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [hostMode, setHostMode] = useState<"loading" | "tenant" | "platform">("loading");
  const [hostSlug, setHostSlug] = useState<string>("");
  const [restaurants, setRestaurants] = useState<Tenant[]>([]);

  useEffect(() => {
    Promise.all([
      api.me().then((r) => setUser(r.user)).catch(() => setUser(null)),
      api
        .resolveHost()
        .then((res) => {
          if (res.mode === "tenant" && res.slug) {
            setHostMode("tenant");
            setHostSlug(res.slug);
          } else {
            setHostMode("platform");
            setRestaurants(res.restaurants || []);
          }
        })
        .catch(() => setHostMode("platform")),
    ]).finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const basePath = getAppBasePath();
  const demoSlug = restaurants[0]?.slug || "kedai-heritage";

  if (!authChecked || hostMode === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm" style={{ color: "var(--ink-muted)" }}>
        Memuat Reneo Resto...
      </main>
    );
  }

  return (
    <BrowserRouter basename={basePath || undefined}>
      <Routes>
        <Route
          path="/"
          element={
            hostMode === "tenant" && hostSlug ? (
              <StorefrontPage forcedSlug={hostSlug} isCustomDomain />
            ) : (
              <PlatformHomePage restaurants={restaurants} user={user} />
            )
          }
        />
        <Route
          path="/menu"
          element={
            hostMode === "tenant" && hostSlug ? (
              <MenuPage forcedSlug={hostSlug} isCustomDomain />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/r/:slug" element={<StorefrontPage />} />
        <Route path="/r/:slug/menu" element={<MenuPage />} />
        <Route path="/preview/:preset" element={<TemplatePreviewRoute defaultSlug={demoSlug} />} />
        <Route path="/preview/:preset/menu" element={<TemplatePreviewMenuRoute defaultSlug={demoSlug} />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === "superadmin" ? "/superadmin/restaurants" : "/admin"} replace />
            ) : (
              <LoginPage onSuccess={(u) => setUser(u)} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            user ? <TenantAdminPage user={user} onLogout={() => void handleLogout()} /> : <LoginPage onSuccess={(u) => setUser(u)} />
          }
        />
        <Route
          path="/admin/:tenantId"
          element={
            user ? <TenantAdminPage user={user} onLogout={() => void handleLogout()} /> : <LoginPage onSuccess={(u) => setUser(u)} />
          }
        />
        <Route
          path="/superadmin/restaurants"
          element={
            user?.role === "superadmin" ? (
              <SuperadminPage onLogout={() => void handleLogout()} />
            ) : (
              <LoginPage onSuccess={(u) => setUser(u)} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
