export function getAppBasePath(): string {
  if (typeof window === "undefined") return "";
  const match = window.location.pathname.match(/^(\/app\/[^/]+)/);
  return match ? match[1] : "";
}

export function withBasePath(path: string): string {
  const base = getAppBasePath();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
