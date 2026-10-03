// Editor screen — 3D avatar viewer with region chips and per-region bottom sheet.
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import AvatarViewer3D, { type QuickView } from "@/src/components/AvatarViewer3D";
import PartEditorSheet from "@/src/components/PartEditorSheet";
import RegionChipBar from "@/src/components/RegionChipBar";
import { regionsFor, type RegionKey } from "@/src/data/regions";
import { findStyle } from "@/src/data/styles";
import { useLang, useT } from "@/src/i18n";
import { redo, saveVersion, undo, useStore } from "@/src/store";
import { makeStyles, spacing, useTheme } from "@/src/theme";

export default function EditorScreen() {
  const t = useT();
  const lang = useLang();
  const s = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height } = useWindowDimensions();

  const avatarId = useStore((st) => st.avatarId);
  const gender = useStore((st) => st.activeGender);
  const styleId = useStore((st) => st.activeStyleId);
  const params = useStore((st) => st.params);
  const historyLen = useStore((st) => st.history.length);
  const futureLen = useStore((st) => st.future.length);

  const [selected, setSelected] = useState<RegionKey | null>(null);
  const [quickView, setQuickView] = useState<QuickView | null>(null);
  const [lighting, setLighting] = useState<"warm" | "cool">("warm");
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const regions = useMemo(() => regionsFor(gender), [gender]);
  const region = selected ? regions.find((r) => r.key === selected) ?? null : null;
  const activeStyle = styleId ? findStyle(styleId) : null;

  const canvasHeight = Math.max(360, height - 300);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  if (!styleId) {
    return (
      <View style={[s.wrap, { paddingTop: insets.top }]} testID="editor-screen-empty">
        <View style={s.emptyBox}>
          <Text style={[s.emptyTitle, { color: colors.onSurface }]}>{t("no_active_style")}</Text>
          <Text style={[s.emptySub, { color: colors.muted }]}>{t("select_style_first")}</Text>
          <Pressable
            testID="go-library-btn"
            onPress={() => router.replace("/(tabs)/library")}
            style={[s.cta, { backgroundColor: colors.brandPrimary }]}
          >
            <Text style={{ color: colors.onBrandPrimary, fontWeight: "700" }}>
              {t("tab_library")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.wrap, { paddingTop: insets.top }]} testID="editor-screen">
      {/* Floating top header */}
      <BlurView intensity={40} tint="dark" style={s.topBar}>
        <View>
          <Text style={[s.topTitle, { color: colors.onSurface }]} numberOfLines={1}>
            {lang === "ar" ? activeStyle?.nameAr : activeStyle?.nameEn}
          </Text>
          <Text style={[s.topSub, { color: colors.muted }]}>{t("editor_hint")}</Text>
        </View>
        <View style={s.topActions}>
          <Pressable
            testID="undo-btn"
            onPress={() => historyLen > 0 && undo()}
            style={[s.topBtn, { opacity: historyLen > 0 ? 1 : 0.35 }]}
          >
            <Text style={{ color: colors.onSurface, fontWeight: "700" }}>↶</Text>
          </Pressable>
          <Pressable
            testID="redo-btn"
            onPress={() => futureLen > 0 && redo()}
            style={[s.topBtn, { opacity: futureLen > 0 ? 1 : 0.35 }]}
          >
            <Text style={{ color: colors.onSurface, fontWeight: "700" }}>↷</Text>
          </Pressable>
          <Pressable
            testID="save-btn"
            onPress={() => setSaveOpen(true)}
            style={[s.topBtn, { backgroundColor: colors.brandPrimary }]}
          >
            <Text style={{ color: colors.onBrandPrimary, fontWeight: "700" }}>{t("save")}</Text>
          </Pressable>
        </View>
      </BlurView>

      {/* 3D canvas */}
      <View style={s.canvas}>
        <AvatarViewer3D
          avatarId={avatarId}
          gender={gender}
          params={params}
          selectedRegion={selected}
          quickView={quickView}
          lighting={lighting}
          height={canvasHeight}
        />

        {/* Right-edge floating quick view FABs */}
        <View style={[s.fabColumn, { top: 120 }]} pointerEvents="box-none">
          {(["front", "side", "back", "top"] as QuickView[]).map((qv) => (
            <Pressable
              key={qv}
              testID={`quickview-${qv}`}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setQuickView(qv);
                // reset so subsequent same-tap re-triggers
                setTimeout(() => setQuickView(null), 250);
              }}
              style={[s.fab, { backgroundColor: "rgba(28,28,30,0.75)", borderColor: colors.border }]}
            >
              <Text style={{ color: colors.onSurface, fontSize: 10, fontWeight: "700" }}>
                {t(`view_${qv}` as any)}
              </Text>
            </Pressable>
          ))}
          <Pressable
            testID="lighting-btn"
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setLighting(lighting === "warm" ? "cool" : "warm");
            }}
            style={[
              s.fab,
              {
                backgroundColor: lighting === "warm" ? colors.brandPrimary : "rgba(28,28,30,0.75)",
                borderColor: lighting === "warm" ? colors.brandPrimary : colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: lighting === "warm" ? colors.onBrandPrimary : colors.onSurface,
                fontSize: 10,
                fontWeight: "700",
              }}
            >
              {lighting === "warm" ? "☀" : "❄"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Region chip bar (floating) */}
      <View style={[s.chipBarWrap, { bottom: insets.bottom + 8 }]}>
        <BlurView intensity={40} tint="dark" style={{ borderRadius: 999, overflow: "hidden" }}>
          <RegionChipBar
            regions={regions}
            selected={selected}
            onSelect={(k) => setSelected(k)}
          />
        </BlurView>
      </View>

      {toast ? (
        <View style={[s.toast, { backgroundColor: colors.brandPrimary, bottom: insets.bottom + 80 }]}>
          <Text style={{ color: colors.onBrandPrimary, fontWeight: "700" }}>{toast}</Text>
        </View>
      ) : null}

      {/* Editor sheet */}
      <PartEditorSheet region={region} onClose={() => setSelected(null)} />

      {/* Save version modal */}
      <Modal visible={saveOpen} transparent animationType="fade" onRequestClose={() => setSaveOpen(false)}>
        <Pressable style={s.modalBg} onPress={() => setSaveOpen(false)}>
          <Pressable style={[s.modalCard, { backgroundColor: colors.surfaceSecondary }]} onPress={() => {}}>
            <Text style={[s.modalTitle, { color: colors.onSurface }]}>{t("save_version")}</Text>
            <TextInput
              testID="version-name-input"
              value={name}
              onChangeText={setName}
              placeholder={t("version_name")}
              placeholderTextColor={colors.muted}
              style={[
                s.input,
                { color: colors.onSurface, backgroundColor: colors.surfaceTertiary, borderColor: colors.border },
              ]}
            />
            <Pressable
              testID="version-save-confirm"
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                saveVersion(name.trim());
                setName("");
                setSaveOpen(false);
                showToast(t("saved_toast"));
              }}
              style={[s.cta, { backgroundColor: colors.brandPrimary, marginTop: spacing.md }]}
            >
              <Text style={{ color: colors.onBrandPrimary, fontWeight: "700" }}>{t("save")}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { flex: 1, backgroundColor: c.surface },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    paddingTop: 48,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  topTitle: { fontSize: 16, fontWeight: "700", maxWidth: 180 },
  topSub: { fontSize: 11, marginTop: 2 },
  topActions: { flexDirection: "row", gap: 8 },
  topBtn: {
    minWidth: 44,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(44,44,46,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: c.surface,
  },
  fabColumn: {
    position: "absolute",
    right: 12,
    gap: 10,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipBarWrap: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 2,
  },
  toast: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    zIndex: 5,
  },
  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptySub: { fontSize: 14, marginTop: spacing.sm, textAlign: "center" },
  cta: { height: 52, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
  modalCard: { width: "100%", borderRadius: 20, padding: spacing.xl },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: spacing.md },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
}));
