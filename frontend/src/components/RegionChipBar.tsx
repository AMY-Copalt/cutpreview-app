import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import type { RegionDef, RegionKey } from "../data/regions";
import { useT } from "../i18n";
import { makeStyles, spacing, useTheme } from "../theme";

interface Props {
  regions: RegionDef[];
  selected: RegionKey | null;
  onSelect: (k: RegionKey) => void;
}

export default function RegionChipBar({ regions, selected, onSelect }: Props) {
  const t = useT();
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} testID="region-chip-bar">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {regions.map((r) => {
          const active = r.key === selected;
          return (
            <Pressable
              key={r.key}
              testID={`region-chip-${r.key}`}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onSelect(r.key);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.brandPrimary : "rgba(28,28,30,0.7)",
                  borderColor: active ? colors.brandPrimary : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: active ? colors.onBrandPrimary : colors.brandPrimary },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.brandPrimary : colors.onBrandPrimary,
                    fontSize: 10,
                    fontWeight: "700",
                  }}
                >
                  {r.icon}
                </Text>
              </View>
              <Text
                style={[
                  styles.chipText,
                  { color: active ? colors.onBrandPrimary : colors.onSurface },
                ]}
                numberOfLines={1}
              >
                {t(r.labelKey as any)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { height: 56, justifyContent: "center" },
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
    height: 56,
  },
  chip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 13, fontWeight: "600" },
}));
