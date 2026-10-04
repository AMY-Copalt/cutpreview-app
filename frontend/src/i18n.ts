// Bilingual strings for CutPreview.
// Arabic is the default language (RTL). English is a secondary toggle.

import { useMemo, useSyncExternalStore } from "react";
import { I18nManager } from "react-native";

export type Lang = "ar" | "en";

const listeners = new Set<() => void>();
let currentLang: Lang = "ar";

export function getLang(): Lang {
  return currentLang;
}

export function setLang(l: Lang) {
  currentLang = l;
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, getLang);
}

export const isRTL = () => currentLang === "ar";

// Note: we do NOT call I18nManager.forceRTL because in Expo web / dev it
// requires a native reload. Instead we mirror layouts via writingDirection
// / flexDirection based on the current language flag.
I18nManager.allowRTL(true);

type Dict = Record<string, { ar: string; en: string }>;

export const strings: Dict = {
  app_name: { ar: "كت بريفيو", en: "CutPreview" },
  tab_library: { ar: "المكتبة", en: "Library" },
  tab_editor: { ar: "المحرر", en: "Editor" },
  tab_versions: { ar: "الإصدارات", en: "Versions" },
  tab_profile: { ar: "حسابي", en: "Profile" },
  welcome_title: { ar: "جرّب قصّتك قبل الحلاق", en: "Try your cut before the barber" },
  welcome_sub: {
    ar: "اختر أفاتار، عدّل كل جزء بشكل مستقل، شارك النتيجة",
    en: "Pick an avatar, tweak every part independently, share the result",
  },
  choose_avatar: { ar: "اختر أفاتار", en: "Choose your avatar" },
  continue: { ar: "متابعة", en: "Continue" },
  men: { ar: "رجال", en: "Men" },
  women: { ar: "نساء", en: "Women" },
  favorites: { ar: "المفضلة", en: "Favorites" },
  recent: { ar: "المستخدمة مؤخراً", en: "Recently tried" },
  filter_length: { ar: "الطول", en: "Length" },
  filter_hair_type: { ar: "نوع الشعر", en: "Hair type" },
  filter_face_shape: { ar: "شكل الوجه", en: "Face shape" },
  filter_occasion: { ar: "المناسبة", en: "Occasion" },
  reset_filters: { ar: "إعادة الفلاتر", en: "Reset filters" },
  no_styles: { ar: "لا توجد قصّات", en: "No styles found" },
  try_style: { ar: "جرّب على الأفاتار", en: "Try on avatar" },
  region_top: { ar: "الأعلى", en: "Top" },
  region_fringe: { ar: "الغرة", en: "Fringe" },
  region_sides: { ar: "الجوانب", en: "Sides" },
  region_back: { ar: "الخلف", en: "Back / Nape" },
  region_sideburns: { ar: "السوالف", en: "Sideburns" },
  region_beard: { ar: "اللحية", en: "Beard" },
  region_crown: { ar: "التاج", en: "Crown" },
  region_layers: { ar: "الطبقات", en: "Layers" },
  region_bangs: { ar: "الغرة", en: "Bangs" },
  region_ends: { ar: "الأطراف", en: "Ends / Length" },
  region_parting: { ar: "الفرقة", en: "Parting" },
  length: { ar: "الطول", en: "Length" },
  fade: { ar: "التدرج", en: "Fade" },
  texture: { ar: "النسيج", en: "Texture" },
  volume: { ar: "الحجم", en: "Volume" },
  parting: { ar: "الفرقة", en: "Parting" },
  color: { ar: "اللون", en: "Color" },
  straight: { ar: "ناعم", en: "Straight" },
  wavy: { ar: "متموج", en: "Wavy" },
  curly: { ar: "مجعد", en: "Curly" },
  fade_none: { ar: "بدون", en: "None" },
  fade_taper: { ar: "تدرج خفيف", en: "Taper" },
  fade_low: { ar: "منخفض", en: "Low" },
  fade_mid: { ar: "متوسط", en: "Mid" },
  fade_high: { ar: "عالي", en: "High" },
  fade_skin: { ar: "صفر", en: "Skin" },
  save: { ar: "حفظ", en: "Save" },
  save_version: { ar: "حفظ النسخة", en: "Save version" },
  version_name: { ar: "اسم النسخة", en: "Version name" },
  undo: { ar: "تراجع", en: "Undo" },
  redo: { ar: "إعادة", en: "Redo" },
  reset_region: { ar: "إعادة الجزء", en: "Reset region" },
  reset_all: { ar: "إعادة الكل", en: "Reset all" },
  apply: { ar: "تطبيق", en: "Apply" },
  close: { ar: "إغلاق", en: "Close" },
  view_front: { ar: "أمامي", en: "Front" },
  view_side: { ar: "جانبي", en: "Side" },
  view_back: { ar: "خلفي", en: "Back" },
  view_top: { ar: "علوي", en: "Top" },
  lighting: { ar: "الإضاءة", en: "Lighting" },
  no_versions: { ar: "لا توجد نسخ محفوظة", en: "No saved versions yet" },
  no_versions_hint: { ar: "احفظ نسخة من المحرر لتظهر هنا", en: "Save one from the editor to see it here" },
  language: { ar: "اللغة", en: "Language" },
  arabic: { ar: "العربية", en: "Arabic" },
  english: { ar: "English", en: "English" },
  face_shape_oval: { ar: "بيضاوي", en: "Oval" },
  face_shape_round: { ar: "دائري", en: "Round" },
  face_shape_square: { ar: "مربع", en: "Square" },
  hair_type_straight: { ar: "ناعم", en: "Straight" },
  hair_type_wavy: { ar: "متموج", en: "Wavy" },
  hair_type_curly: { ar: "مجعد", en: "Curly" },
  short: { ar: "قصير", en: "Short" },
  medium: { ar: "متوسط", en: "Medium" },
  long: { ar: "طويل", en: "Long" },
  casual: { ar: "عادي", en: "Casual" },
  formal: { ar: "رسمي", en: "Formal" },
  sport: { ar: "رياضي", en: "Sport" },
  edit: { ar: "تعديل", en: "Edit" },
  delete: { ar: "حذف", en: "Delete" },
  saved_toast: { ar: "تم حفظ النسخة", en: "Version saved" },
  applied_style: { ar: "تم تطبيق القصّة", en: "Style applied" },
  onboarding_mock: {
    ar: "توليد الأفاتار من الصورة الفعلية مُحاكى في هذه النسخة",
    en: "Avatar generation from a real photo is simulated in this build",
  },
  select_style_first: { ar: "اختر قصّة من المكتبة أولاً", en: "Pick a style from the Library first" },
  editor_hint: { ar: "اضغط مطولاً على الرأس أو اختر من الشريط لتحديد الجزء", en: "Long-press the head or use a chip to select a region" },
  region: { ar: "الجزء", en: "Region" },
  version_created: { ar: "تم الإنشاء", en: "Created" },
  saved_versions: { ar: "النسخ المحفوظة", en: "Saved versions" },
  base_style: { ar: "القصة الأساسية", en: "Base style" },
  active_style: { ar: "القصة النشطة", en: "Active style" },
  no_active_style: { ar: "لا توجد قصة نشطة", en: "No active style" },
  cm: { ar: "سم", en: "cm" },
};

export function t(key: keyof typeof strings): string {
  return strings[key][currentLang] ?? key;
}

export function useT() {
  const lang = useLang();
  return useMemo(() => (k: keyof typeof strings) => strings[k][lang] ?? k, [lang]);
}
