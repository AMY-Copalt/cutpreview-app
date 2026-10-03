// Dark-first luxe design tokens for CutPreview.
// Keys mirror /app/design_guidelines.json → "color".

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const dark = {
  // Surfaces
  surface: "#0A0A0A",
  onSurface: "#FFFFFF",
  surfaceSecondary: "#1C1C1E",
  onSurfaceSecondary: "#F2F2F2",
  surfaceTertiary: "#2C2C2E",
  onSurfaceTertiary: "#E5E5E5",
  surfaceInverse: "#F5F5F5",
  onSurfaceInverse: "#0A0A0A",
  muted: "#8E8E93",

  // Brand (Antique Gold / Amber)
  brand: "#D4A373",
  onBrand: "#000000",
  brandPrimary: "#E5A93C",
  onBrandPrimary: "#0A0A0A",
  brandSecondary: "#8C6E4A",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#3D3224",
  onBrandTertiary: "#D4A373",

  // Status
  success: "#4A7C59",
  onSuccess: "#FFFFFF",
  warning: "#E5A93C",
  onWarning: "#0A0A0A",
  error: "#8B3A3A",
  onError: "#FFFFFF",
  info: "#4A607C",
  onInfo: "#FFFFFF",

  // Lines
  border: "#2C2C2E",
  borderStrong: "#4D4D4D",
  divider: "#1C1C1E",
};

const light = { ...dark }; // Force dark theme everywhere.

export type ThemeColors = typeof dark;

export const defaultScheme = "dark" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark: ThemeColors } = { light, dark };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "dark");
}

setColorScheme?.("dark");

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.dark };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

// Direct colors export for non-hook contexts
export const colors = dark;
