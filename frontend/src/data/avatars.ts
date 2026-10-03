// Sample base avatars (mock heads).
export interface AvatarSample {
  id: string;
  nameAr: string;
  nameEn: string;
  gender: "men" | "women";
  skinTone: string; // hex
  faceShape: "oval" | "round" | "square";
  hairlineShape: "low" | "medium" | "high" | "receding";
  thumbnail: string;
}

export const AVATARS: AvatarSample[] = [
  {
    id: "m1",
    nameAr: "أحمد",
    nameEn: "Ahmed",
    gender: "men",
    skinTone: "#D9AC8C",
    faceShape: "oval",
    hairlineShape: "medium",
    thumbnail:
      "https://images.unsplash.com/photo-1545996124-0501ebae84d0?w=600&q=80",
  },
  {
    id: "m2",
    nameAr: "يوسف",
    nameEn: "Yusuf",
    gender: "men",
    skinTone: "#A67C5A",
    faceShape: "square",
    hairlineShape: "high",
    thumbnail:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
  },
  {
    id: "m3",
    nameAr: "خالد",
    nameEn: "Khalid",
    gender: "men",
    skinTone: "#8B5A3C",
    faceShape: "oval",
    hairlineShape: "low",
    thumbnail:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  },
  {
    id: "w1",
    nameAr: "ليلى",
    nameEn: "Layla",
    gender: "women",
    skinTone: "#E5C1A0",
    faceShape: "oval",
    hairlineShape: "medium",
    thumbnail:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
  },
  {
    id: "w2",
    nameAr: "نور",
    nameEn: "Noor",
    gender: "women",
    skinTone: "#C8987A",
    faceShape: "round",
    hairlineShape: "medium",
    thumbnail:
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&q=80",
  },
  {
    id: "w3",
    nameAr: "سارة",
    nameEn: "Sara",
    gender: "women",
    skinTone: "#8B5A3C",
    faceShape: "oval",
    hairlineShape: "low",
    thumbnail:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80",
  },
];

export function findAvatar(id: string) {
  return AVATARS.find((a) => a.id === id);
}
