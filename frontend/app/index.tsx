// Onboarding / avatar selection screen. Entry point of the app.
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { AVATARS } from "@/src/data/avatars";
import { useT, useLang } from "@/src/i18n";
import { setAvatar, useStore } from "@/src/store";
import { makeStyles, spacing, useTheme } from "@/src/theme";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const t = useT();
  const lang = useLang();
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentId = useStore((s) => s.avatarId);
  const [selected, setSelected] = useState<string>(currentId ?? AVATARS[0].id);

  const rtl = lang === "ar";

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]} testID="onboarding-screen">
      <View style={[styles.header, { direction: rtl ? "rtl" : "ltr" }]}>
        <Text style={[styles.brand, { color: colors.brandPrimary }]}>{t("app_name")}</Text>
        <Text style={[styles.title, { color: colors.onSurface, writingDirection: rtl ? "rtl" : "ltr" }]}>
          {t("welcome_title")}
        </Text>
        <Text style={[styles.sub, { color: colors.muted, writingDirection: rtl ? "rtl" : "ltr" }]}>
          {t("welcome_sub")}
        </Text>
      </View>

      <Text style={[styles.section, { color: colors.onSurface, writingDirection: rtl ? "rtl" : "ltr" }]}>
        {t("choose_avatar")}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        snapToInterval={width * 0.7 + spacing.md}
        decelerationRate="fast"
      >
        {AVATARS.map((a) => {
          const active = a.id === selected;
          return (
            <Pressable
              key={a.id}
              testID={`avatar-card-${a.id}`}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelected(a.id);
              }}
              style={[
                styles.card,
                {
                  borderColor: active ? colors.brandPrimary : colors.border,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <Image source={{ uri: a.thumbnail }} style={styles.cardImg} contentFit="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.85)"]}
                style={styles.scrim}
              />
              <View style={styles.cardMeta}>
                <Text style={[styles.cardName, { color: "#fff" }]}>
                  {lang === "ar" ? a.nameAr : a.nameEn}
                </Text>
                <Text style={[styles.cardSub, { color: "rgba(255,255,255,0.7)" }]}>
                  {a.gender === "men" ? t("men") : t("women")} · {a.faceShape}
                </Text>
              </View>
              {active ? (
                <View style={[styles.tick, { backgroundColor: colors.brandPrimary }]}>
                  <Text style={{ color: colors.onBrandPrimary, fontWeight: "700" }}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={[styles.mockNote, { color: colors.muted }]}>{t("onboarding_mock")}</Text>
        <Pressable
          testID="onboarding-continue-btn"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            setAvatar(selected);
            router.replace("/(tabs)/library");
          }}
          style={[styles.cta, { backgroundColor: colors.brandPrimary }]}
        >
          <Text style={[styles.ctaText, { color: colors.onBrandPrimary }]}>{t("continue")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { flex: 1, backgroundColor: c.surface },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  brand: { fontSize: 14, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  title: { fontSize: 28, fontWeight: "800", marginTop: spacing.sm, lineHeight: 34 },
  sub: { fontSize: 14, marginTop: spacing.sm, lineHeight: 20 },
  section: { fontSize: 16, fontWeight: "700", marginTop: spacing.xl, paddingHorizontal: spacing.xl },
  carousel: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md },
  card: {
    width: width * 0.7,
    height: 420,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: c.surfaceSecondary,
  },
  cardImg: { width: "100%", height: "100%" },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "45%",
  },
  cardMeta: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  cardName: { fontSize: 20, fontWeight: "800" },
  cardSub: { fontSize: 12, marginTop: 2 },
  tick: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  mockNote: { fontSize: 11, textAlign: "center", marginBottom: spacing.md },
  cta: { height: 56, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  ctaText: { fontSize: 16, fontWeight: "700" },
}));
