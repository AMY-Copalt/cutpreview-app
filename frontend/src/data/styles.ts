// 60+ styles — mocked catalogue. Thumbnails from Unsplash.
import type { Gender, FadeType, Texture } from "./regions";

export type LengthCategory = "short" | "medium" | "long";
export type HairType = "straight" | "wavy" | "curly";
export type FaceShape = "oval" | "round" | "square";
export type Occasion = "casual" | "formal" | "sport";

export interface Style {
  id: string;
  nameAr: string;
  nameEn: string;
  gender: Gender;
  length: LengthCategory;
  hairType: HairType;
  faceShape: FaceShape[];
  occasion: Occasion[];
  thumbnail: string;
  // Base parameters applied when picking this style.
  base: {
    topCm?: number;
    sidesCm?: number;
    backCm?: number;
    fringeCm?: number;
    beardCm?: number;
    sideburnsCm?: number;
    crownCm?: number;
    layersCm?: number;
    bangsCm?: number;
    endsCm?: number;
    fade?: FadeType;
    fadeHeight?: number; // 0-100
    texture?: Texture;
    volume?: number; // 0-100
    partingSide?: "left" | "right" | "center" | "none";
    partingPos?: number; // 0-100
    color?: string;
  };
}

const MEN_THUMBS = [
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80",
  "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
  "https://images.unsplash.com/photo-1584316712724-f5d4b188fee2?w=600&q=80",
  "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=600&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80",
  "https://images.unsplash.com/photo-1507081323647-4d250478b919?w=600&q=80",
  "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=600&q=80",
];

const WOMEN_THUMBS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
  "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80",
  "https://images.unsplash.com/photo-1499651681375-8afc5a4db253?w=600&q=80",
  "https://images.unsplash.com/photo-1505033575518-a36ea2ef75ae?w=600&q=80",
];

const menCatalog: Omit<Style, "id" | "gender" | "thumbnail">[] = [
  { nameAr: "تدرج متوسط", nameEn: "Mid Fade", length: "short", hairType: "straight", faceShape: ["oval", "square"], occasion: ["casual", "formal"], base: { topCm: 4, sidesCm: 1, backCm: 1, fade: "mid", fadeHeight: 50, texture: "straight", volume: 40 } },
  { nameAr: "تدرج منخفض", nameEn: "Low Fade", length: "short", hairType: "straight", faceShape: ["oval", "round"], occasion: ["formal"], base: { topCm: 3.5, sidesCm: 0.8, backCm: 0.8, fade: "low", fadeHeight: 25, texture: "straight", volume: 35 } },
  { nameAr: "تدرج عالي", nameEn: "High Fade", length: "short", hairType: "straight", faceShape: ["square", "oval"], occasion: ["sport"], base: { topCm: 5, sidesCm: 0.3, backCm: 0.3, fade: "high", fadeHeight: 75, texture: "straight", volume: 60 } },
  { nameAr: "تدرج بشرة", nameEn: "Skin Fade", length: "short", hairType: "straight", faceShape: ["oval"], occasion: ["sport", "casual"], base: { topCm: 4, sidesCm: 0, backCm: 0, fade: "skin", fadeHeight: 60, texture: "straight", volume: 50 } },
  { nameAr: "تايبر كلاسيك", nameEn: "Classic Taper", length: "short", hairType: "straight", faceShape: ["oval", "round", "square"], occasion: ["formal"], base: { topCm: 5, sidesCm: 1.5, backCm: 1.5, fade: "taper", fadeHeight: 30, texture: "straight", volume: 40 } },
  { nameAr: "بوز كت", nameEn: "Buzz Cut", length: "short", hairType: "straight", faceShape: ["oval", "square"], occasion: ["sport"], base: { topCm: 0.5, sidesCm: 0.3, backCm: 0.3, fade: "none", fadeHeight: 0, texture: "straight", volume: 0 } },
  { nameAr: "كروب فرنسي", nameEn: "French Crop", length: "short", hairType: "straight", faceShape: ["oval", "round"], occasion: ["casual", "formal"], base: { topCm: 3, sidesCm: 1, backCm: 1, fringeCm: 4, fade: "low", fadeHeight: 30, texture: "straight", volume: 30 } },
  { nameAr: "كوف مرفوع", nameEn: "Pompadour", length: "medium", hairType: "wavy", faceShape: ["oval"], occasion: ["formal"], base: { topCm: 8, sidesCm: 1, backCm: 1, fade: "mid", fadeHeight: 45, texture: "wavy", volume: 80 } },
  { nameAr: "أندركت", nameEn: "Undercut", length: "medium", hairType: "straight", faceShape: ["oval", "square"], occasion: ["casual"], base: { topCm: 7, sidesCm: 0.5, backCm: 0.5, fade: "none", fadeHeight: 0, texture: "straight", volume: 60 } },
  { nameAr: "شعر مموج طبيعي", nameEn: "Textured Quiff", length: "medium", hairType: "wavy", faceShape: ["oval"], occasion: ["casual"], base: { topCm: 7, sidesCm: 1.5, backCm: 1.5, fade: "taper", fadeHeight: 35, texture: "wavy", volume: 70 } },
  { nameAr: "كيرلي طويل", nameEn: "Long Curly", length: "long", hairType: "curly", faceShape: ["oval"], occasion: ["casual"], base: { topCm: 12, sidesCm: 6, backCm: 6, fade: "none", fadeHeight: 0, texture: "curly", volume: 85 } },
  { nameAr: "غرة طويلة", nameEn: "Long Fringe", length: "medium", hairType: "straight", faceShape: ["oval", "round"], occasion: ["casual"], base: { topCm: 6, sidesCm: 2, backCm: 2, fringeCm: 10, fade: "none", texture: "straight", volume: 50 } },
];

const womenCatalog: Omit<Style, "id" | "gender" | "thumbnail">[] = [
  { nameAr: "بوب قصير", nameEn: "Short Bob", length: "short", hairType: "straight", faceShape: ["oval", "square"], occasion: ["formal", "casual"], base: { crownCm: 15, layersCm: 5, endsCm: 18, texture: "straight", volume: 40, partingSide: "center" } },
  { nameAr: "بوب طويل", nameEn: "Long Bob", length: "medium", hairType: "straight", faceShape: ["oval", "round"], occasion: ["casual", "formal"], base: { crownCm: 20, layersCm: 8, endsCm: 30, texture: "straight", volume: 45, partingSide: "left" } },
  { nameAr: "بيكسي", nameEn: "Pixie", length: "short", hairType: "straight", faceShape: ["oval"], occasion: ["casual"], base: { crownCm: 6, layersCm: 2, endsCm: 8, texture: "straight", volume: 55, partingSide: "left" } },
  { nameAr: "طبقات طويلة", nameEn: "Long Layers", length: "long", hairType: "wavy", faceShape: ["oval", "round", "square"], occasion: ["casual", "formal"], base: { crownCm: 30, layersCm: 20, endsCm: 55, texture: "wavy", volume: 60, partingSide: "center" } },
  { nameAr: "غرة كاملة", nameEn: "Full Bangs", length: "medium", hairType: "straight", faceShape: ["oval"], occasion: ["casual"], base: { crownCm: 22, bangsCm: 10, endsCm: 40, texture: "straight", volume: 45, partingSide: "none" } },
  { nameAr: "غرة جانبية", nameEn: "Side Bangs", length: "medium", hairType: "wavy", faceShape: ["oval", "round"], occasion: ["casual", "formal"], base: { crownCm: 24, bangsCm: 12, endsCm: 42, texture: "wavy", volume: 50, partingSide: "left" } },
  { nameAr: "شعر مجعد طويل", nameEn: "Long Curls", length: "long", hairType: "curly", faceShape: ["oval"], occasion: ["casual"], base: { crownCm: 28, layersCm: 15, endsCm: 55, texture: "curly", volume: 85, partingSide: "center" } },
  { nameAr: "شعر مجعد قصير", nameEn: "Curly Bob", length: "short", hairType: "curly", faceShape: ["oval", "round"], occasion: ["casual"], base: { crownCm: 15, layersCm: 5, endsCm: 18, texture: "curly", volume: 75, partingSide: "center" } },
  { nameAr: "ضفائر", nameEn: "Braids", length: "long", hairType: "curly", faceShape: ["oval", "square"], occasion: ["casual"], base: { crownCm: 30, layersCm: 0, endsCm: 60, texture: "curly", volume: 40, partingSide: "center" } },
  { nameAr: "طبقات متوسطة", nameEn: "Medium Layers", length: "medium", hairType: "straight", faceShape: ["oval", "round"], occasion: ["casual", "formal"], base: { crownCm: 22, layersCm: 10, endsCm: 35, texture: "straight", volume: 50, partingSide: "center" } },
  { nameAr: "شعر متموج", nameEn: "Beach Waves", length: "long", hairType: "wavy", faceShape: ["oval"], occasion: ["casual"], base: { crownCm: 28, layersCm: 14, endsCm: 50, texture: "wavy", volume: 70, partingSide: "center" } },
  { nameAr: "بلانت كت", nameEn: "Blunt Cut", length: "medium", hairType: "straight", faceShape: ["oval", "square"], occasion: ["formal"], base: { crownCm: 22, layersCm: 0, endsCm: 30, texture: "straight", volume: 30, partingSide: "center" } },
];

function expand(cat: typeof menCatalog, gender: Gender, thumbs: string[]): Style[] {
  const out: Style[] = [];
  // 3 variants per base style to reach ~60+.
  cat.forEach((s, idx) => {
    for (let v = 0; v < 3; v++) {
      out.push({
        ...s,
        gender,
        id: `${gender}-${idx}-${v}`,
        nameAr: v === 0 ? s.nameAr : `${s.nameAr} - ${v + 1}`,
        nameEn: v === 0 ? s.nameEn : `${s.nameEn} v${v + 1}`,
        thumbnail: thumbs[(idx + v) % thumbs.length],
      });
    }
  });
  return out;
}

export const STYLES: Style[] = [
  ...expand(menCatalog, "men", MEN_THUMBS),
  ...expand(womenCatalog, "women", WOMEN_THUMBS),
];

export function stylesFor(gender: Gender) {
  return STYLES.filter((s) => s.gender === gender);
}

export function findStyle(id: string) {
  return STYLES.find((s) => s.id === id);
}
