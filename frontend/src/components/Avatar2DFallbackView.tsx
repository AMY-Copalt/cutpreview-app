// Simple 2D fallback head used when WebGL is unavailable in the WebView.
// It is intentionally schematic: a face + hair shapes that still react to the
// selected region (gold highlight) and the global hair color, so the editor
// stays usable even without 3D.

import React, { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Ellipse, Path, Rect, Circle } from "react-native-svg";

import type { RegionKey } from "../data/regions";
import type { VariantParams } from "../store";
import { findAvatar } from "../data/avatars";
import { useT } from "../i18n";
import { colors } from "../theme";

interface Props {
  avatarId: string;
  gender: "men" | "women";
  params: VariantParams;
  selectedRegion: RegionKey | null;
  height?: number;
}

const GOLD = "#E5A93C";

export default function Avatar2DFallbackView({
  avatarId,
  gender,
  params,
  selectedRegion,
  height = 420,
}: Props) {
  const { width } = useWindowDimensions();
  const t = useT();
  const avatar = findAvatar(avatarId);
  const skin = avatar?.skinTone ?? "#D9AC8C";
  const hair = params.globalColor ?? "#1B1B1B";

  const hl = (region: RegionKey) =>
    selectedRegion === region ? { stroke: GOLD, strokeWidth: 4 } : { stroke: "none", strokeWidth: 0 };

  // normalized length helpers (0..1) for visual thickness
  const n = useMemo(() => {
    const g = (k: RegionKey, max: number) => {
      const p = (params as any)[k];
      return p ? Math.max(0.05, Math.min(1, p.lengthCm / max)) : 0.4;
    };
    return { g };
  }, [params]);

  const cx = 150;

  return (
    <View style={[styles.wrap, { height, width, backgroundColor: colors.surface }]} testID="avatar-2d-fallback">
      <Svg width={width} height={height} viewBox="0 0 300 380">
        {/* neck */}
        <Rect x={125} y={250} width={50} height={70} rx={16} fill={skin} />
        {/* head */}
        <Ellipse cx={cx} cy={180} rx={92} ry={110} fill={skin} />

        {gender === "men" ? (
          <>
            {/* back */}
            <Path d={`M58 150 Q150 ${60 - n.g("back", 8) * 20} 242 150 L242 120 Q150 40 58 120 Z`} fill={hair} {...hl("back")} />
            {/* top */}
            <Ellipse cx={cx} cy={100 - n.g("top", 15) * 20} rx={96} ry={55 + n.g("top", 15) * 25} fill={hair} {...hl("top")} />
            {/* fringe */}
            <Path d={`M70 110 Q150 ${150 + n.g("fringe", 15) * 30} 230 110 L230 92 Q150 70 70 92 Z`} fill={hair} {...hl("fringe")} />
            {/* sides */}
            <Rect x={48} y={120} width={22} height={100 + n.g("sides", 8) * 40} rx={10} fill={hair} {...hl("sides")} />
            <Rect x={230} y={120} width={22} height={100 + n.g("sides", 8) * 40} rx={10} fill={hair} {...hl("sides")} />
            {/* sideburns */}
            <Rect x={70} y={210} width={12} height={20 + n.g("sideburns", 5) * 40} rx={5} fill={hair} {...hl("sideburns")} />
            <Rect x={218} y={210} width={12} height={20 + n.g("sideburns", 5) * 40} rx={5} fill={hair} {...hl("sideburns")} />
            {/* beard */}
            {params.beard && params.beard.lengthCm > 0 ? (
              <Path
                d={`M78 230 Q150 ${300 + n.g("beard", 10) * 30} 222 230 Q210 290 150 300 Q90 290 78 230 Z`}
                fill={hair}
                {...hl("beard")}
              />
            ) : null}
          </>
        ) : (
          <>
            {/* crown */}
            <Ellipse cx={cx} cy={95} rx={100} ry={60 + n.g("crown", 60) * 20} fill={hair} {...hl("crown")} />
            {/* layers / long sides */}
            <Path d={`M46 110 L46 ${230 + n.g("layers", 40) * 110} Q70 ${260 + n.g("layers", 40) * 110} 90 ${240 + n.g("layers", 40) * 90} L90 110 Z`} fill={hair} {...hl("layers")} />
            <Path d={`M254 110 L254 ${230 + n.g("layers", 40) * 110} Q230 ${260 + n.g("layers", 40) * 110} 210 ${240 + n.g("layers", 40) * 90} L210 110 Z`} fill={hair} {...hl("layers")} />
            {/* ends */}
            <Rect x={46} y={230} width={208} height={6 + n.g("ends", 80) * 90} rx={30} fill={hair} opacity={0.9} {...hl("ends")} />
            {/* bangs */}
            <Path d={`M72 100 Q150 ${150 + n.g("bangs", 20) * 30} 228 100 L228 86 Q150 66 72 86 Z`} fill={hair} {...hl("bangs")} />
          </>
        )}

        {/* eyes */}
        <Circle cx={118} cy={180} r={7} fill="#111" />
        <Circle cx={182} cy={180} r={7} fill="#111" />
      </Svg>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{t("app_name")} · 2D</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "rgba(28,28,30,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: "#8E8E93", fontSize: 11, fontWeight: "700" },
});
