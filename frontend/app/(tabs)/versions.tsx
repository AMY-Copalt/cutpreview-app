import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { findAvatar } from "@/src/data/avatars";
import { findStyle } from "@/src/data/styles";
import { useLang, useT } from "@/src/i18n";
import { deleteVersion, loadVersion, useStore } from "@/src/store";
import { makeStyles, spacing, useTheme } from "@/src/theme";

export default function VersionsScreen() {
  const t = useT();
  const lang = useLang();
  const s = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const versions = useStore((st) => st.versions);

  return (
    <View style={[s.wrap, { paddingTop: insets.top }]} testID="versions-screen">
      <View style={s.header}>
        <Text style={[s.brand, { color: colors.brandPrimary }]}>{t("app_name")}</Text>
        <Text style={[s.title, { color: colors.onSurface }]}>{t("saved_versions")}</Text>
      </View>
      <FlatList
        data={versions}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120, gap: spacing.md }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={[s.emptyTitle, { color: colors.onSurface }]}>{t("no_versions")}</Text>
            <Text style={[s.emptySub, { color: colors.muted }]}>{t("no_versions_hint")}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const style = findStyle(item.styleId);
          const avatar = findAvatar(item.avatarId);
          return (
            <View style={[s.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} testID={`version-card-${item.id}`}>
              <Image source={{ uri: style?.thumbnail }} style={s.thumb} contentFit="cover" />
              <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                <Text style={[s.name, { color: colors.onSurface }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[s.meta, { color: colors.muted }]} numberOfLines={1}>
                  {lang === "ar" ? style?.nameAr : style?.nameEn} · {lang === "ar" ? avatar?.nameAr : avatar?.nameEn}
                </Text>
                <Text style={[s.meta, { color: colors.muted }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={{ gap: 6 }}>
                <Pressable
                  testID={`version-load-${item.id}`}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    loadVersion(item.id);
                    router.push("/(tabs)/editor");
                  }}
                  style={[s.actBtn, { backgroundColor: colors.brandPrimary }]}
                >
                  <Text style={{ color: colors.onBrandPrimary, fontWeight: "700", fontSize: 12 }}>
                    {t("edit")}
                  </Text>
                </Pressable>
                <Pressable
                  testID={`version-delete-${item.id}`}
                  onPress={() => deleteVersion(item.id)}
                  style={[s.actBtn, { backgroundColor: colors.surfaceTertiary }]}
                >
                  <Text style={{ color: colors.error, fontWeight: "700", fontSize: 12 }}>
                    {t("delete")}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { flex: 1, backgroundColor: c.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  brand: { fontSize: 12, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  title: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  card: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  thumb: { width: 60, height: 60, borderRadius: 12, backgroundColor: c.surfaceTertiary },
  name: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12, marginTop: 2 },
  actBtn: {
    minWidth: 68,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { alignItems: "center", marginTop: 80, paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptySub: { fontSize: 13, marginTop: spacing.sm, textAlign: "center" },
}));
