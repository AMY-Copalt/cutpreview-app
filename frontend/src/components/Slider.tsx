// Gesture-based slider with continuous, absolute-position dragging.
// Touch position maps directly to a value (tap-to-set + drag), so it never
// "jumps" and works identically in LTR/RTL (value always grows left→right).
// Updates to the parent are throttled so driving the 3D view stays smooth,
// while the on-screen number + thumb follow the finger in real time.

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

const THROTTLE_MS = 40;

export default function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  suffix,
  testID,
}: Props) {
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const wRef = useRef(0);
  const [drag, setDrag] = useState<number | null>(null);
  const lastEmit = useRef(0);

  const display = drag ?? value;
  const pct = Math.min(1, Math.max(0, (display - min) / (max - min || 1)));
  const decimals = step < 1 ? 1 : 0;

  const quantize = (raw: number) => {
    let n = Math.round(raw / step) * step;
    n = Math.min(max, Math.max(min, n));
    return Number(n.toFixed(2));
  };

  const fromX = (x: number) => {
    const width = wRef.current || 1;
    const p = Math.min(1, Math.max(0, x / width));
    return quantize(min + p * (max - min));
  };

  const emit = (n: number, force = false) => {
    const now = Date.now();
    if (force || now - lastEmit.current >= THROTTLE_MS) {
      lastEmit.current = now;
      onChange(n);
    }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (e) => {
        const n = fromX(e.nativeEvent.locationX);
        setDrag(n);
        emit(n, true);
        Haptics.selectionAsync().catch(() => {});
      },
      onPanResponderMove: (e) => {
        const n = fromX(e.nativeEvent.locationX);
        setDrag(n);
        emit(n);
      },
      onPanResponderRelease: (e) => {
        const n = fromX(e.nativeEvent.locationX);
        emit(n, true);
        setDrag(null);
      },
      onPanResponderTerminate: (e) => {
        const n = fromX(e.nativeEvent.locationX);
        emit(n, true);
        setDrag(null);
      },
    }),
  ).current;

  return (
    <View style={styles.wrap}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
          <Text style={[styles.value, { color: colors.brandPrimary }]} testID={`${testID}-value`}>
            {display.toFixed(decimals)} {suffix ?? ""}
          </Text>
        </View>
      ) : null}
      <View
        style={styles.touchArea}
        onLayout={(e) => {
          wRef.current = e.nativeEvent.layout.width;
          setW(e.nativeEvent.layout.width);
        }}
        {...pan.panHandlers}
        testID={testID}
      >
        <View style={[styles.track, { backgroundColor: colors.surfaceTertiary }]} pointerEvents="none">
          <View style={[styles.fill, { backgroundColor: colors.brandPrimary, width: `${pct * 100}%` }]} />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            { backgroundColor: colors.brandPrimary, left: pct * (w || 0) },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 6 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600" },
  value: { fontSize: 13, fontWeight: "700" },
  touchArea: { height: 44, justifyContent: "center" },
  track: { height: 8, borderRadius: 999, justifyContent: "center", overflow: "hidden" },
  fill: { height: 8, borderRadius: 999 },
  thumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -12,
    top: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
