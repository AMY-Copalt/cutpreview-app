// Custom slider (no external dep) — draggable thumb on a track.
import React, { useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme";

interface Props {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label?: string;
  suffix?: string;
  testID?: string;
}

export default function Slider({
  value,
  min,
  max,
  step = 0.1,
  onChange,
  label,
  suffix,
  testID,
}: Props) {
  const { colors } = useTheme();
  const [w, setW] = useState(1);
  const startX = useRef(0);
  const startV = useRef(value);

  const pct = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_e, gs) => {
        startX.current = gs.x0;
        startV.current = value;
      },
      onPanResponderMove: (_e, gs) => {
        const dx = gs.moveX - startX.current;
        const dv = (dx / w) * (max - min);
        let next = startV.current + dv;
        next = Math.round(next / step) * step;
        next = Math.min(max, Math.max(min, next));
        if (Math.abs(next - value) > step * 0.9) {
          Haptics.selectionAsync().catch(() => {});
          onChange(Number(next.toFixed(2)));
        }
      },
    }),
  ).current;

  return (
    <View style={styles.wrap}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
          <Text style={[styles.value, { color: colors.brandPrimary }]}>
            {value.toFixed(1)} {suffix ?? ""}
          </Text>
        </View>
      ) : null}
      <View
        style={[styles.track, { backgroundColor: colors.surfaceTertiary }]}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        {...pan.panHandlers}
        testID={testID}
      >
        <View
          style={[
            styles.fill,
            { backgroundColor: colors.brandPrimary, width: `${pct * 100}%` },
          ]}
        />
        <View
          style={[
            styles.thumb,
            { backgroundColor: colors.brandPrimary, left: `${pct * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 8 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  value: { fontSize: 13, fontWeight: "700" },
  track: {
    height: 8,
    borderRadius: 999,
    justifyContent: "center",
    overflow: "visible",
  },
  fill: { height: 8, borderRadius: 999 },
  thumb: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: -11,
    top: -7,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
