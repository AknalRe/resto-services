import type { ThemePreset } from "../types";

export const ALL_THEME_PRESETS: readonly ThemePreset[] = [
  "banquet",
  "bistro",
  "cafe",
  "omakase",
  "coastal",
  "street",
];

export function normalizeThemePreset(raw?: string | null): ThemePreset {
  if (raw === "bistro" || raw === "cafe" || raw === "omakase" || raw === "coastal" || raw === "street") {
    return raw;
  }
  return "banquet";
}

export const PREVIEW_META: Record<
  ThemePreset,
  {
    label: string;
    shortLabel: string;
    vibe: string;
    summary: string;
    bestFor: string;
    color: string;
    sampleTitle: string;
    sampleTagline: string;
    sampleStory: string;
    sampleHero: string;
    sampleGallery: string[];
  }
> = {
  banquet: {
    label: "Restoran Keluarga & Banquet",
    shortLabel: "Banquet & Keluarga",
    vibe: "Hangat, Elegan & Klasik",
    summary: "Banner ruang jamuan penuh berbingkai emas, sorotan hidangan andalan, dan etalase ruang privat VIP.",
    bestFor: "Restoran keluarga, rumah makan nusantara, jamuan & sangjit",
    color: "#8B1E24",
    sampleTitle: "Rumah Makan Nusantara",
    sampleTagline: "Sajian Klasik Keluarga, Dimasak Segar dari Dapur Kami Setiap Hari",
    sampleStory:
      "Ruang makan luas dengan meja bundar dan ruang VIP privat untuk syukuran keluarga, jamuan rekan kerja, hingga perayaan istimewa.",
    sampleHero: "/demo/hero-banquet.jpg",
    sampleGallery: ["/demo/dish-ayam.jpg", "/demo/dish-gurame.jpg", "/demo/room-vip.jpg"],
  },
  bistro: {
    label: "Modern Bistro & Grill",
    shortLabel: "Bistro & Grill",
    vibe: "Gelap, Kontras & Editorial",
    summary: "Latar charcoal gelap dengan aksen tembaga, hero split asimetris, dan kartu terlaris bernomor.",
    bestFor: "Steakhouse, bistro malam, bar & grill, fine casual",
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
    vibe: "Krem Hangat & Santai",
    summary: "Navigasi pil melayang, kolase foto lengkung cerah, dan kartu lookbook ringan untuk kedai kopi & brunch.",
    bestFor: "Kedai kopi, bakery, brunch cafe, kedai makan harian",
    color: "#2F483E",
    sampleTitle: "Kopi & Dapur Pagi",
    sampleTagline: "Hidangan Hangat, Kopi Seduh Segar, dan Ruang Santai Sepanjang Hari",
    sampleStory:
      "Tempat nyaman untuk sarapan santai, kerja ringan sambil menyeduh kopi, dan makan siang hangat bersama teman.",
    sampleHero: "/demo/hero-cafe.jpg",
    sampleGallery: ["/demo/dish-brunch.jpg", "/demo/hero-cafe.jpg", "/demo/dish-ayam.jpg"],
  },
  omakase: {
    label: "Japanese & Omakase Bar",
    shortLabel: "Japanese & Omakase",
    vibe: "Tenang, Zen & Minimalis",
    summary: "Nuansa kertas nasi dan kayu hinoki dengan ruang lega, stempel aksen vermilion, serta kurasi hidangan tenang.",
    bestFor: "Sushi bar, omakase, izakaya modern, ramen artisan",
    color: "#B9382C",
    sampleTitle: "Hinoki Kitchen & Bar",
    sampleTagline: "Ketelitian Bahan Segar Musiman, Disajikan Langsung dari Meja Chef",
    sampleStory:
      "Konter kayu hangat berkapasitas terbatas yang merayakan cita rasa murni bahan laut segar dan teknik panggang presisi.",
    sampleHero: "/demo/hero-omakase.jpg",
    sampleGallery: ["/demo/hero-omakase.jpg", "/demo/dish-gurame.jpg", "/demo/room-vip.jpg"],
  },
  coastal: {
    label: "Seafood & Coastal Dining",
    shortLabel: "Seafood & Coastal",
    vibe: "Cerah, Segar & Pesisir",
    summary: "Palet biru laut dan putih terang yang segar, etalase hidangan laut panggang, dan suasana santai tepi pantai.",
    bestFor: "Restoran seafood, ikan bakar, beach club, tropical dining",
    color: "#0F4C75",
    sampleTitle: "Dermaga Seafood & Grill",
    sampleTagline: "Tangkapan Laut Segar Setiap Pagi, Dibakar dengan Sambal & Rempah Pesisir",
    sampleStory:
      "Hidangan laut pilihan dari nelayan lokal yang diolah langsung saat dipesan untuk santap siang cerah maupun makan malam santai.",
    sampleHero: "/demo/hero-coastal.jpg",
    sampleGallery: ["/demo/hero-coastal.jpg", "/demo/dish-gurame.jpg", "/demo/dish-ayam.jpg"],
  },
  street: {
    label: "Street Food & Noodle House",
    shortLabel: "Noodle & Street",
    vibe: "Berani, Kontras & Enerjik",
    summary: "Gaya poster modern dengan bingkai garis tinta tebal, warna cabai & mustard yang menggugah selera, cepat dipindai.",
    bestFor: "Kedai mie, dimsum, bakmi modern, ayam goreng & kedai kekinian",
    color: "#C92A2A",
    sampleTitle: "Kedai Mie & Dumpling",
    sampleTagline: "Mie Kenyal Racikan Sendiri, Minyak Cabai Wangi, dan Dimsum Hangat Setiap Saat",
    sampleStory:
      "Dapur cepat dengan porsi melimpah, racikan chili oil buatan sendiri, dan tempat nongkrong akrab bersama teman.",
    sampleHero: "/demo/hero-street.jpg",
    sampleGallery: ["/demo/hero-street.jpg", "/demo/dish-ayam.jpg", "/demo/dish-steak.jpg"],
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
