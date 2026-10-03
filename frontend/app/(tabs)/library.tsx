// Style Library — Men / Women segmented, filter chips, grid of 60+ styles.
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import type { Style, LengthCategory, HairType, FaceShape, Occasion } from "@/src/data/styles";
import { stylesFor } from "@/src/data/styles";
import { useLang, useT } from "@/src/i18n";
import { applyStyle, toggleFavorite, useStore, setGender as setActiveGender } from "@/src/store";
import { makeStyles, spacing, useTheme } from "@/src/theme";

const { width } = Dimensions.get("window");
const CARD_W = (width - spacing.lg * 3) / 2;

type LenFilter = LengthCategory | null;
type HTFilter = HairType | null;
type FSFilter = FaceShape | null;
type OCFilter = Occasion | null;

export default function LibraryScreen() {
  const t = useT();
  const lang = useLang();
  const s = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const activeGender = useStore((st) => st.activeGender);
  const favorites = useStore((st) => st.favorites);
  const recent = useStore((st) => st.recent);

  const [len, setLen] = useState<LenFilter>(null);
  const [ht, setHt] = useState<HTFilter>(null);
  const [fs, setFs] = useState<FSFilter>(null);
  const [oc, setOc] = useState<OCFilter>(null);
  const [showFav, setShowFav] = useState(false);

  const list = useMemo(() => {
    let arr = stylesFor(activeGender);
    if (showFav) arr = arr.filter((x) => favorites.includes(x.id));
    if (len) arr = arr.filter((x) => x.length === len);
    if (ht) arr = arr.filter((x) => x.hairType === ht);
    if (fs) arr = arr.filter((x) => x.faceShape.includes(fs));
    if (oc) arr = arr.filter((x) => x.occasion.includes(oc));
    return arr;
  }, [activeGender, favorites, showFav, len, ht, fs, oc]);

  const recentStyles = useMemo(
    () => recent.map((id) => list.find((x) => x.id === id) ?? stylesFor(activeGender).find((x) => x.id === id)).filter(Boolean) as Style[],
    [recent, activeGender, list],
  );

  const onTryStyle = (styleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    applyStyle(styleId);
    router.push("/(tabs)/editor");
  };

  const filterOptions: { key: string; label: string; active: boolean; onPress: () => void }[] = [
    { key: "fav", label: `★ ${t("favorites")}`, active: showFav, onPress: () => setShowFav((v) => !v) },
    { key: "len-short", label: t("short"), active: len === "short", onPress: () => setLen(len === "short" ? null : "short") },
    { key: "len-medium", label: t("medium"), active: len === "medium", onPress: () => setLen(len === "medium" ? null : "medium") },
    { key: "len-long", label: t("long"), active: len === "long", onPress: () => setLen(len === "long" ? null : "long") },
    { key: "ht-straight", label: t("hair_type_straight"), active: ht === "straight", onPress: () => setHt(ht === "straight" ? null : "straight") },
    { key: "ht-wavy", label: t("hair_type_wavy"), active: ht === "wavy", onPress: () => setHt(ht === "wavy" ? null : "wavy") },
    { key: "ht-curly", label: t("hair_type_curly"), active: ht === "curly", onPress: () => setHt(ht === "curly" ? null : "curly") },
    { key: "fs-oval", label: t("face_shape_oval"), active: fs === "oval", onPress: () => setFs(fs === "oval" ? null : "oval") },
    { key: "fs-round", label: t("face_shape_round"), active: fs === "round", onPress: () => setFs(fs === "round" ? null : "round") },
    { key: "fs-square", label: t("face_shape_square"), active: fs === "square", onPress: () => setFs(fs === "square" ? null : "square") },
    { key: "oc-casual", label: t("casual"), active: oc === "casual", onPress: () => setOc(oc === "casual" ? null : "casual") },
    { key: "oc-formal", label: t("formal"), active: oc === "formal", onPress: () => setOc(oc === "formal" ? null : "formal") },
    { key: "oc-sport", label: t("sport"), active: oc === "sport", onPress: () => setOc(oc === "sport" ? null : "sport") },
  ];

  return (
    <View style={[s.wrap, { paddingTop: insets.top }]} testID="library-screen">
      {/* Sticky header */}
      <View style={s.header}>
        <Text style={[s.brand, { color: colors.brandPrimary }]}>{t("app_name")}</Text>
        <View style={[s.segment, { backgroundColor: colors.surfaceSecondary }]}>
          {(["men", "women"] as const).map((g) => {
            const active = activeGender === g;
            return (
              <Pressable
                key={g}
                testID={`gender-${g}`}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setActiveGender(g);
                }}
                style={[
                  s.segItem,
                  { backgroundColor: active ? colors.brandPrimary : "transparent" },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.onBrandPrimary : colors.onSurface,
                    fontWeight: "700",
                  }}
                >
                  {g === "men" ? t("men") : t("women")}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {filterOptions.map((o) => (
            <Pressable
              key={o.key}
              testID={`filter-${o.key}`}
              onPress={o.onPress}
              style={[
                s.filterChip,
                {
                  backgroundColor: o.active ? colors.brandPrimary : colors.surfaceSecondary,
                  borderColor: o.active ? colors.brandPrimary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: o.active ? colors.onBrandPrimary : colors.onSurface,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {o.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        testID="library-list"
        data={list}
        keyExtractor={(x) => x.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 100, gap: spacing.lg }}
        ListHeaderComponent={
          recentStyles.length > 0 ? (
            <View style={{ marginBottom: spacing.md }}>
              <Text style={[s.sectionTitle, { color: colors.onSurface }]}>{t("recent")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
              >
                {recentStyles.slice(0, 8).map((rs) => (
                  <Pressable
                    key={rs.id}
                    onPress={() => onTryStyle(rs.id)}
                    style={[s.recentCard, { backgroundColor: colors.surfaceSecondary }]}
                  >
                    <Image source={{ uri: rs.thumbnail }} style={s.recentImg} contentFit="cover" />
                    <Text style={[s.recentText, { color: colors.onSurface }]} numberOfLines={1}>
                      {lang === "ar" ? rs.nameAr : rs.nameEn}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={[s.emptyTitle, { color: colors.onSurface }]}>{t("no_styles")}</Text>
            <Pressable
              onPress={() => {
                setLen(null);
                setHt(null);
                setFs(null);
                setOc(null);
                setShowFav(false);
              }}
              style={[s.resetBtn, { backgroundColor: colors.brandPrimary }]}
            >
              <Text style={{ color: colors.onBrandPrimary, fontWeight: "700" }}>{t("reset_filters")}</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            testID={`style-card-${item.id}`}
            onPress={() => onTryStyle(item.id)}
            style={[s.card, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Image source={{ uri: item.thumbnail }} style={s.cardImg} contentFit="cover" />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.85)"]}
              style={s.scrim}
            />
            <Pressable
              testID={`favorite-${item.id}`}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                toggleFavorite(item.id);
              }}
              style={s.favBtn}
            >
              <Text style={{ color: favorites.includes(item.id) ? colors.brandPrimary : "#fff", fontSize: 18 }}>
                {favorites.includes(item.id) ? "★" : "☆"}
              </Text>
            </Pressable>
            <View style={s.cardMeta}>
              <Text style={[s.cardTitle, { color: "#fff" }]} numberOfLines={1}>
                {lang === "ar" ? item.nameAr : item.nameEn}
              </Text>
              <Text style={[s.cardSub, { color: "rgba(255,255,255,0.75)" }]} numberOfLines={1}>
                {t(item.length as any)} · {t(`hair_type_${item.hairType}` as any)}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { flex: 1, backgroundColor: c.surface },
  header: {
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
    backgroundColor: c.surface,
  },
  brand: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    textTransform: "uppercase",
  },
  segment: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: 4,
    borderRadius: 999,
  },
  segItem: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 999 },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
    height: 56,
    alignItems: "center",
  },
  filterChip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  recentCard: {
    width: 130,
    borderRadius: 14,
    overflow: "hidden",
  },
  recentImg: { width: 130, height: 90 },
  recentText: {
    fontSize: 12,
    fontWeight: "600",
    padding: 8,
  },
  card: {
    flex: 1,
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 0,
  },
  cardImg: { width: "100%", height: "100%" },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  cardMeta: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: "700" },
  cardSub: { fontSize: 11, marginTop: 2 },
  favBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginBottom: spacing.lg },
  resetBtn: { paddingHorizontal: spacing.lg, height: 44, borderRadius: 999, alignItems: "center", justifyContent: "center" },
}));
