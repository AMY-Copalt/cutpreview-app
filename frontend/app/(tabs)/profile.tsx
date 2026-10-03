import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { AVATARS } from "@/src/data/avatars";
import { getLang, setLang, useLang, useT } from "@/src/i18n";
import { setAvatar, useStore } from "@/src/store";
import { makeStyles, spacing, useTheme } from "@/src/theme";

export default function ProfileScreen() {
  const t = useT();
  const lang = useLang();
  const s = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const avatarId = useStore((st) => st.avatarId);
  const favorites = useStore((st) => st.favorites);
  const versions = useStore((st) => st.versions);
  const recent = useStore((st) => st.recent);

  return (
    <ScrollView
      style={{ backgroundColor: colors.surface }}
      contentContainerStyle={[s.wrap, { paddingTop: insets.top + spacing.lg, paddingBottom: 120 }]}
      testID="profile-screen"
    >
      <Text style={[s.brand, { color: colors.brandPrimary }]}>{t("app_name")}</Text>
      <Text style={[s.title, { color: colors.onSurface }]}>{t("tab_profile")}</Text>

      <View style={s.langRow}>
        <Text style={[s.section, { color: colors.onSurface }]}>{t("language")}</Text>
        <View style={[s.segment, { backgroundColor: colors.surfaceSecondary }]}>
          {(["ar", "en"] as const).map((l) => {
            const active = lang === l;
            return (
              <Pressable
                key={l}
                testID={`lang-${l}`}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setLang(l);
                }}
                style={[s.segItem, { backgroundColor: active ? colors.brandPrimary : "transparent" }]}
              >
                <Text style={{ color: active ? colors.onBrandPrimary : colors.onSurface, fontWeight: "700" }}>
                  {l === "ar" ? t("arabic") : t("english")}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={[s.section, { color: colors.onSurface, marginTop: spacing.xl }]}>{t("choose_avatar")}</Text>
      <View style={s.grid}>
        {AVATARS.map((a) => {
          const active = a.id === avatarId;
          return (
            <Pressable
              key={a.id}
              testID={`profile-avatar-${a.id}`}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setAvatar(a.id);
              }}
              style={[
                s.avatarCard,
                { borderColor: active ? colors.brandPrimary : colors.border, borderWidth: active ? 2 : 1 },
              ]}
            >
              <Image source={{ uri: a.thumbnail }} style={s.avatarImg} contentFit="cover" />
              <Text style={[s.avatarName, { color: colors.onSurface }]} numberOfLines={1}>
                {lang === "ar" ? a.nameAr : a.nameEn}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={s.statsRow}>
        <StatCard label={t("favorites")} value={favorites.length} colors={colors} />
        <StatCard label={t("saved_versions")} value={versions.length} colors={colors} />
        <StatCard label={t("recent")} value={recent.length} colors={colors} />
      </View>

      <Pressable
        testID="restart-onboarding"
        onPress={() => router.replace("/")}
        style={[s.cta, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
      >
        <Text style={{ color: colors.onSurface, fontWeight: "700" }}>{t("choose_avatar")}</Text>
      </Pressable>
    </ScrollView>
  );
}

function StatCard({ label, value, colors }: { label: string; value: number; colors: any }) {
  return (
    <View style={[styles.stat, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
      <Text style={{ color: colors.brandPrimary, fontSize: 26, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2, textAlign: "center" }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
});

const useStyles = makeStyles((c) => ({
  wrap: { paddingHorizontal: spacing.lg },
  brand: { fontSize: 12, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  title: { fontSize: 24, fontWeight: "800", marginTop: 4, marginBottom: spacing.lg },
  langRow: { marginTop: spacing.sm },
  section: { fontSize: 15, fontWeight: "700", marginBottom: spacing.sm },
  segment: { flexDirection: "row", padding: 4, borderRadius: 999 },
  segItem: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 999 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  avatarCard: {
    width: "30%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: c.surfaceSecondary,
  },
  avatarImg: { width: "100%", height: 100 },
  avatarName: { fontSize: 12, fontWeight: "600", padding: 6, textAlign: "center" },
  statsRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
  cta: {
    marginTop: spacing.xl,
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
