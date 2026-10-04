// Bottom editing panel for the Editor screen.
// This is a plain split-layout panel (NOT an overlay / bottom-sheet) so it can
// never cover the 3D viewer above it. It has:
//   - a header row: the region chip bar + an expand/collapse toggle
//   - an internally scrolling body with the controls for the selected region
//   - a sticky footer with the Apply button

import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import type { RegionDef, RegionKey } from "../data/regions";
import { FADE_TYPES, HAIR_COLORS, TEXTURES } from "../data/regions";
import { useT } from "../i18n";
import Slider from "./Slider";
import RegionChipBar from "./RegionChipBar";
import { makeStyles, spacing, useTheme } from "../theme";
import { updateRegion, useStore, setGlobalColor, resetRegion } from "../store";

interface Props {
  regions: RegionDef[];
  selected: RegionKey | null;
  onSelect: (k: RegionKey) => void;
  region: RegionDef | null;
  expanded: boolean;
  onToggleExpand: () => void;
  onApply: () => void;
}

export default function PartEditorSheet({
  regions,
  selected,
  onSelect,
  region,
  expanded,
  onToggleExpand,
  onApply,
}: Props) {
  const t = useT();
  const styles = useStyles();
  const { colors } = useTheme();
  const params = useStore((s) => s.params);

  const cur = region ? params[region.key] ?? { lengthCm: region.defaultLengthCm } : null;
  const showFade = region?.key === "sides" || region?.key === "back";
  const showParting = region?.key === "parting";
  const showTexture =
    !!region && region.key !== "sideburns" && region.key !== "beard" && region.key !== "parting";

  return (
    <View style={styles.panel} testID="editor-panel">
      {/* Header: region chips + expand toggle */}
      <View style={styles.headerRow}>
        <View style={styles.chipFlex}>
          <RegionChipBar regions={regions} selected={selected} onSelect={onSelect} />
        </View>
        <Pressable
          testID="panel-expand-toggle"
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onToggleExpand();
          }}
          hitSlop={10}
          style={[styles.toggleBtn, { backgroundColor: colors.surfaceTertiary }]}
        >
          <Text style={{ color: colors.onSurface, fontSize: 16, fontWeight: "800" }}>
            {expanded ? "▾" : "▴"}
          </Text>
        </Pressable>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Body: scrolls internally */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {region ? (
          <View style={styles.titleRow}>
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
              <Text style={{ color: colors.onSurface, fontWeight: "600", fontSize: 12 }}>
                {t("reset_region")}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.hint, { color: colors.muted }]}>{t("editor_hint")}</Text>
        )}

        {region && cur && !showParting ? (
          <View style={styles.section}>
            <Slider
              testID={`slider-length-${region.key}`}
              value={cur.lengthCm}
              min={region.minCm}
              max={region.maxCm}
              step={0.5}
              label={t("length")}
              suffix={t("cm")}
              onChange={(v) => updateRegion(region.key, { lengthCm: v })}
            />
          </View>
        ) : null}

        {region && cur && showFade ? (
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
                suffix="%"
                onChange={(v) => updateRegion(region.key, { fadeHeight: v })}
              />
            </View>
          </View>
        ) : null}

        {region && cur && showTexture ? (
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
              suffix="%"
              onChange={(v) => updateRegion(region.key, { volume: v })}
            />
          </View>
        ) : null}

        {region && cur && showParting ? (
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
              suffix="%"
              onChange={(v) => updateRegion(region.key, { partingPos: v })}
            />
          </View>
        ) : null}

        {/* Color (global) — always available */}
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
      </ScrollView>

      {/* Sticky footer */}
      <View style={[styles.footer, { backgroundColor: colors.surfaceSecondary, borderTopColor: colors.border }]}>
        <Pressable
          testID="editor-apply"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onApply();
          }}
          style={[styles.apply, { backgroundColor: colors.brandPrimary }]}
        >
          <Text style={{ color: colors.onBrandPrimary, fontWeight: "700", fontSize: 15 }}>
            {t("apply")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  panel: {
    flex: 1,
    backgroundColor: c.surfaceSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.md,
    paddingTop: spacing.sm,
  },
  chipFlex: { flex: 1, minWidth: 0 },
  toggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: spacing.xs },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  title: { fontSize: 18, fontWeight: "700" },
  hint: { fontSize: 13, marginTop: spacing.sm, marginBottom: spacing.xs },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
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
  swatch: { width: 36, height: 36, borderRadius: 999 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  apply: {
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
}));
