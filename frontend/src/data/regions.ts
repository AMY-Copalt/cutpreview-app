// Editable regions per gender.
export type Gender = "men" | "women";

export type RegionKey =
  | "top"
  | "fringe"
  | "sides"
  | "back"
  | "sideburns"
  | "beard"
  | "crown"
  | "layers"
  | "bangs"
  | "ends"
  | "parting";

export interface RegionDef {
  key: RegionKey;
  labelKey: string; // key in i18n strings
  icon: string; // simple emoji-free label; we render circle + first letter
  defaultLengthCm: number;
  minCm: number;
  maxCm: number;
}

export const MEN_REGIONS: RegionDef[] = [
  { key: "top", labelKey: "region_top", icon: "T", defaultLengthCm: 4, minCm: 0.5, maxCm: 15 },
  { key: "fringe", labelKey: "region_fringe", icon: "F", defaultLengthCm: 5, minCm: 0.5, maxCm: 15 },
  { key: "sides", labelKey: "region_sides", icon: "S", defaultLengthCm: 1, minCm: 0, maxCm: 8 },
  { key: "back", labelKey: "region_back", icon: "B", defaultLengthCm: 1, minCm: 0, maxCm: 8 },
  { key: "sideburns", labelKey: "region_sideburns", icon: "s", defaultLengthCm: 0.6, minCm: 0, maxCm: 5 },
  { key: "beard", labelKey: "region_beard", icon: "β", defaultLengthCm: 0.8, minCm: 0, maxCm: 10 },
];

export const WOMEN_REGIONS: RegionDef[] = [
  { key: "crown", labelKey: "region_crown", icon: "C", defaultLengthCm: 20, minCm: 3, maxCm: 60 },
  { key: "layers", labelKey: "region_layers", icon: "L", defaultLengthCm: 15, minCm: 0, maxCm: 40 },
  { key: "bangs", labelKey: "region_bangs", icon: "F", defaultLengthCm: 8, minCm: 0, maxCm: 20 },
  { key: "sides", labelKey: "region_sides", icon: "S", defaultLengthCm: 25, minCm: 3, maxCm: 60 },
  { key: "ends", labelKey: "region_ends", icon: "E", defaultLengthCm: 30, minCm: 3, maxCm: 80 },
  { key: "parting", labelKey: "region_parting", icon: "P", defaultLengthCm: 0, minCm: 0, maxCm: 0 },
];

export function regionsFor(gender: Gender): RegionDef[] {
  return gender === "men" ? MEN_REGIONS : WOMEN_REGIONS;
}

export const FADE_TYPES = ["none", "taper", "low", "mid", "high", "skin"] as const;
export type FadeType = (typeof FADE_TYPES)[number];

export const TEXTURES = ["straight", "wavy", "curly"] as const;
export type Texture = (typeof TEXTURES)[number];

export const HAIR_COLORS = [
  "#1B1B1B",
  "#3B2A1A",
  "#6B4423",
  "#A0693B",
  "#C89F65",
  "#E4C99A",
  "#F0DBB2",
  "#8B0000",
  "#4E2A84",
];
