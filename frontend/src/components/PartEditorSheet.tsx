import React, { useMemo, useRef, useEffect, useState } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import type { RegionDef, RegionKey } from "../data/regions";
import { FADE_TYPES, HAIR_COLORS, TEXTURES } from "../data/regions";
import { useT } from "../i18n";
import Slider from "./Slider";
import { makeStyles, spacing, useTheme } from "../theme";
import { updateRegion, useStore, setGlobalColor, resetRegion } from "../store";

interface Props {
  region: RegionDef | null;
  onClose: () => void;
}

export default function PartEditorSheet({ region, onClose }: Props) {
  const t = useT();
  const styles = useStyles();
  const { colors } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["55%", "88%"], []);
  const params = useStore((s) => s.params);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (region) {
      setOpen(true);
      sheetRef.current?.snapToIndex(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      sheetRef.current?.close();
      setOpen(false);
    }
  }, [region]);

  if (!region) return null;
  const cur = params[region.key] ?? { lengthCm: region.defaultLengthCm };
  const showFade = region.key === "sides" || region.key === "back";
  const showParting = region.key === "parting";
  const showTexture =
    region.key !== "sideburns" && region.key !== "beard" && region.key !== "parting";

  return (
    <BottomSheet
      ref={sheetRef}
      index={open ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: colors.surfaceSecondary }}
      handleIndicatorStyle={{ backgroundColor: colors.borderStrong }}
      backdropComponent={(p) => (
        <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
      )}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.onSurface }]} testID="editor-sheet-title">
            {t(region.labelKey as any)}
          </Text>
          <Pressable
            testID="editor-reset-region"
            onPress={() => {
              resetRegion(region.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            }}
            style={[styles.smallBtn, { backgroundColor: colors.surfaceTertiary }]}
          >
            <Text style={{ color: colors.onSurface, fontWeight: "600" }}>{t("reset_region")}</Text>
          </Pressable>
        </View>

        {!showParting ? (
          <View style={styles.section}>
            <Slider
              testID={`slider-length-${region.key}`}
              value={cur.lengthCm}
              min={region.minCm}
              max={region.maxCm}
              step={0.1}
              label={`${t("length")}`}
              suffix={t("cm")}
              onChange={(v) => updateRegion(region.key, { lengthCm: v })}
            />
          </View>
        ) : null}

        {showFade ? (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.onSurface }]}>{t("fade")}</Text>
            <View style={styles.chipRow}>
              {FADE_TYPES.map((f) => {
                const active = cur.fade === f;
                return (
                  <Pressable
                    key={f}
                    testID={`fade-${f}`}
                    onPress={() => updateRegion(region.key, { fade: f })}
                    style={[
                      styles.pillChip,
                      {
                        backgroundColor: active ? colors.brandPrimary : colors.surfaceTertiary,
                        borderColor: active ? colors.brandPrimary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? colors.onBrandPrimary : colors.onSurface,
                        fontWeight: "600",
                        fontSize: 12,
                      }}
                    >
                      {t(`fade_${f}` as any)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ marginTop: spacing.sm }}>
              <Slider
                testID={`fade-height-${region.key}`}
                value={cur.fadeHeight ?? 40}
                min={0}
                max={100}
                step={1}
                label={`${t("fade")} %`}
                onChange={(v) => updateRegion(region.key, { fadeHeight: v })}
              />
            </View>
          </View>
        ) : null}

        {showTexture ? (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.onSurface }]}>{t("texture")}</Text>
            <View style={styles.chipRow}>
              {TEXTURES.map((f) => {
                const active = cur.texture === f;
                return (
                  <Pressable
                    key={f}
                    testID={`texture-${f}`}
                    onPress={() => updateRegion(region.key, { texture: f })}
                    style={[
                      styles.pillChip,
                      {
                        backgroundColor: active ? colors.brandPrimary : colors.surfaceTertiary,
                        borderColor: active ? colors.brandPrimary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? colors.onBrandPrimary : colors.onSurface,
                        fontWeight: "600",
                        fontSize: 12,
                      }}
                    >
                      {t(f as any)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Slider
              testID={`volume-${region.key}`}
              value={cur.volume ?? 40}
              min={0}
              max={100}
              step={1}
              label={t("volume")}
              onChange={(v) => updateRegion(region.key, { volume: v })}
            />
          </View>
        ) : null}

        {showParting ? (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.onSurface }]}>{t("parting")}</Text>
            <View style={styles.chipRow}>
              {(["left", "center", "right", "none"] as const).map((side) => {
                const active = cur.partingSide === side;
                return (
                  <Pressable
                    key={side}
                    testID={`parting-${side}`}
                    onPress={() => updateRegion(region.key, { partingSide: side })}
                    style={[
                      styles.pillChip,
                      {
                        backgroundColor: active ? colors.brandPrimary : colors.surfaceTertiary,
                        borderColor: active ? colors.brandPrimary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? colors.onBrandPrimary : colors.onSurface,
                        fontWeight: "600",
                        fontSize: 12,
                        textTransform: "capitalize",
                      }}
                    >
                      {side}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Slider
              testID="parting-pos"
              value={cur.partingPos ?? 50}
              min={0}
              max={100}
              step={1}
              label={t("parting")}
              onChange={(v) => updateRegion(region.key, { partingPos: v })}
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.onSurface }]}>{t("color")}</Text>
          <View style={styles.chipRow}>
            {HAIR_COLORS.map((hex) => {
              const active = (params.globalColor ?? "#1B1B1B") === hex;
              return (
                <Pressable
                  key={hex}
                  testID={`color-${hex}`}
                  onPress={() => setGlobalColor(hex)}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: hex,
                      borderColor: active ? colors.brandPrimary : colors.border,
                      borderWidth: active ? 3 : 1,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <Pressable
          testID="editor-apply"
          onPress={onClose}
          style={[styles.apply, { backgroundColor: colors.brandPrimary }]}
        >
          <Text style={{ color: colors.onBrandPrimary, fontWeight: "700", fontSize: 15 }}>
            {t("apply")}
          </Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const useStyles = makeStyles((c) => ({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing["2xl"] },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: { fontSize: 20, fontWeight: "700" },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  section: { marginTop: spacing.md },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  pillChip: {
    minHeight: 36,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 999,
  },
  apply: {
    marginTop: spacing.xl,
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
}));
