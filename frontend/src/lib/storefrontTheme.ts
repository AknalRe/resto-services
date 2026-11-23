import type { ThemePreset } from "../types";

export const PREVIEW_META: Record<
  ThemePreset,
  {
    label: string;
    shortLabel: string;
    color: string;
    sampleTitle: string;
    sampleTagline: string;
    sampleStory: string;
    sampleHero: string;
    sampleGallery: string[];
  }
> = {
  heritage: {
    label: "Restoran Keluarga & Banquet",
    shortLabel: "Banquet & Keluarga",
    color: "#8B1E24",
    sampleTitle: "Rumah Makan Nusantara",
    sampleTagline: "Sajian Klasik Keluarga, Dimasak Segar dari Dapur Kami Setiap Hari",
    sampleStory:
      "Ruang makan luas dengan meja bundar dan ruang VIP privat untuk syukuran keluarga, jamuan rekan kerja, hingga perayaan istimewa.",
    sampleHero: "/demo/hero-heritage.jpg",
    sampleGallery: ["/demo/dish-ayam.jpg", "/demo/dish-gurame.jpg", "/demo/room-vip.jpg"],
  },
  bistro: {
    label: "Modern Bistro & Grill",
    shortLabel: "Bistro & Grill",
    color: "#D97736",
    sampleTitle: "Ember Bistro & Grill",
    sampleTagline: "Api Arang, Rempah Pilihan, dan Meja Hangat untuk Makan Malam Berkesan",
    sampleStory:
      "Dapur terbuka dengan panggangan arang, menu musiman yang tajam, dan ruang makan malam berkarakter di tengah kota.",
    sampleHero: "/demo/hero-bistro.jpg",
    sampleGallery: ["/demo/dish-steak.jpg", "/demo/hero-bistro.jpg", "/demo/room-vip.jpg"],
  },
  cafe: {
    label: "Artisan Cafe & Kitchen",
    shortLabel: "Cafe & Kitchen",
    color: "#2F483E",
    sampleTitle: "Kopi & Dapur Pagi",
    sampleTagline: "Hidangan Hangat, Kopi Seduh Segar, dan Ruang Santai Sepanjang Hari",
    sampleStory:
      "Tempat nyaman untuk sarapan santai, kerja ringan sambil menyeduh kopi, dan makan siang hangat bersama teman.",
    sampleHero: "/demo/hero-cafe.jpg",
    sampleGallery: ["/demo/dish-brunch.jpg", "/demo/hero-cafe.jpg", "/demo/dish-ayam.jpg"],
  },
};

export function getStorefrontPaths(slug: string, previewPreset?: ThemePreset, isCustomDomain?: boolean) {
  if (previewPreset) {
    return {
      homePath: `/preview/${previewPreset}`,
      menuPath: `/preview/${previewPreset}/menu`,
    };
  }
  if (isCustomDomain) {
    return {
      homePath: "/",
      menuPath: "/menu",
    };
  }
  return {
    homePath: `/r/${slug}`,
    menuPath: `/r/${slug}/menu`,
  };
}
