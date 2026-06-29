export type BrandPaletteId = "ocean" | "emerald" | "sunset" | "slate";

type ModeTokens = {
  primary: string;
  accent: string;
  ring: string;
  surface: string;
  onSurface: string;
};

export type BrandPalette = {
  id: BrandPaletteId;
  label: string;
  light: ModeTokens;
  dark: ModeTokens;
};

export const BRAND_LIGHT_STORAGE_KEY = "brand-palette-light";
export const BRAND_DARK_STORAGE_KEY = "brand-palette-dark";

export const DEFAULT_LIGHT_PALETTE: BrandPaletteId = "ocean";
export const DEFAULT_DARK_PALETTE: BrandPaletteId = "ocean";

export const BRAND_PALETTES: BrandPalette[] = [
  {
    id: "ocean",
    label: "Ocean Blue",
    light: {
      primary: "217 100% 36%",
      accent: "186 90% 42%",
      ring: "217 100% 36%",
      surface: "218 86% 34%",
      onSurface: "0 0% 100%",
    },
    dark: {
      primary: "213 100% 64%",
      accent: "184 85% 58%",
      ring: "213 100% 64%",
      surface: "220 62% 21%",
      onSurface: "210 40% 98%",
    },
  },
  {
    id: "emerald",
    label: "Emerald Mint",
    light: {
      primary: "158 78% 34%",
      accent: "189 92% 40%",
      ring: "158 78% 34%",
      surface: "161 72% 27%",
      onSurface: "0 0% 100%",
    },
    dark: {
      primary: "157 72% 56%",
      accent: "189 96% 62%",
      ring: "157 72% 56%",
      surface: "164 63% 16%",
      onSurface: "160 30% 96%",
    },
  },
  {
    id: "sunset",
    label: "Sunset Coral",
    light: {
      primary: "16 88% 52%",
      accent: "337 82% 53%",
      ring: "16 88% 52%",
      surface: "14 79% 41%",
      onSurface: "0 0% 100%",
    },
    dark: {
      primary: "22 100% 66%",
      accent: "339 88% 66%",
      ring: "22 100% 66%",
      surface: "12 66% 23%",
      onSurface: "20 33% 96%",
    },
  },
  {
    id: "slate",
    label: "Slate Indigo",
    light: {
      primary: "224 34% 36%",
      accent: "204 72% 44%",
      ring: "224 34% 36%",
      surface: "224 30% 30%",
      onSurface: "0 0% 100%",
    },
    dark: {
      primary: "220 34% 67%",
      accent: "200 82% 63%",
      ring: "220 34% 67%",
      surface: "226 27% 17%",
      onSurface: "220 30% 96%",
    },
  },
];

function getPalette(id: BrandPaletteId): BrandPalette {
  return BRAND_PALETTES.find((palette) => palette.id === id) ?? BRAND_PALETTES[0];
}

export function applyBrandPalettes(lightId: BrandPaletteId, darkId: BrandPaletteId) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const light = getPalette(lightId).light;
  const dark = getPalette(darkId).dark;

  root.style.setProperty("--brand-primary-light", light.primary);
  root.style.setProperty("--brand-accent-light", light.accent);
  root.style.setProperty("--brand-ring-light", light.ring);
  root.style.setProperty("--brand-surface-light", light.surface);
  root.style.setProperty("--brand-on-surface-light", light.onSurface);

  root.style.setProperty("--brand-primary-dark", dark.primary);
  root.style.setProperty("--brand-accent-dark", dark.accent);
  root.style.setProperty("--brand-ring-dark", dark.ring);
  root.style.setProperty("--brand-surface-dark", dark.surface);
  root.style.setProperty("--brand-on-surface-dark", dark.onSurface);
}
