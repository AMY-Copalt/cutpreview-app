// 3D stylized head viewer for CutPreview.
//
// Rendering strategy:
//   expo-gl + three renders BLACK inside Expo Go on Android (native GL surface
//   issue under the New Architecture), while the exact same scene renders fine
//   in a browser. So we render the three.js scene inside a react-native-webview
//   (WebGL via the device browser engine) and drive it from React Native.
//   If WebGL is unavailable / three fails to load, we drop to a 2D SVG fallback.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, AppState, StyleSheet, View, useWindowDimensions } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import * as Haptics from "expo-haptics";

import { useTheme } from "../theme";
import type { RegionKey } from "../data/regions";
import type { VariantParams } from "../store";
import { findAvatar } from "../data/avatars";
import { buildSceneHtml } from "./avatarSceneHtml";
import Avatar2DFallbackView from "./Avatar2DFallbackView";

export type QuickView = "front" | "side" | "back" | "top";

interface Props {
  avatarId: string;
  gender: "men" | "women";
  params: VariantParams;
  selectedRegion: RegionKey | null;
  quickView?: QuickView | null;
  lighting?: "warm" | "cool";
  onRegionTap?: (region: RegionKey) => void;
  height?: number;
}

type Mode = "loading" | "webgl" | "fallback";

export default function AvatarViewer3D({
  avatarId,
  gender,
  params,
  selectedRegion,
  quickView = null,
  lighting = "warm",
  onRegionTap,
  height = 420,
}: Props) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const webRef = useRef<WebView>(null);
  const readyRef = useRef(false);
  const [mode, setMode] = useState<Mode>("loading");

  const html = useMemo(() => buildSceneHtml(), []);

  const payload = useMemo(() => {
    const avatar = findAvatar(avatarId);
    return {
      skinTone: avatar?.skinTone ?? "#D9AC8C",
      gender,
      params,
      selectedRegion,
      quickView,
      lighting,
    };
  }, [avatarId, gender, params, selectedRegion, quickView, lighting]);

  // Push state into the WebView whenever it changes (once the scene is ready).
  useEffect(() => {
    if (!readyRef.current || mode !== "webgl") return;
    const js = `window.__update && window.__update(${JSON.stringify(payload)}); true;`;
    webRef.current?.injectJavaScript(js);
  }, [payload, mode]);

  // Safety net: if the WebView never reports ready or error, fall back to 2D.
  useEffect(() => {
    if (mode !== "loading") return;
    const timer = setTimeout(() => {
      if (!readyRef.current) setMode("fallback");
    }, 9000);
    return () => clearTimeout(timer);
  }, [mode]);

  // Resume the render loop when the app returns to the foreground (the WebView's
  // RAF loop can be suspended while backgrounded / during a screenshot).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active" && readyRef.current) {
        webRef.current?.injectJavaScript("window.__resume && window.__resume(); true;");
      }
    });
    return () => sub.remove();
  }, []);

  const onMessage = (e: WebViewMessageEvent) => {
    let msg: any;
    try {
      msg = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === "ready") {
      readyRef.current = true;
      setMode("webgl");
      const js = `window.__update && window.__update(${JSON.stringify(payload)}); true;`;
      webRef.current?.injectJavaScript(js);
    } else if (msg.type === "region" && msg.region) {
      Haptics.selectionAsync().catch(() => {});
      onRegionTap?.(msg.region as RegionKey);
    } else if (msg.type === "error") {
      setMode("fallback");
    }
  };

  if (mode === "fallback") {
    return (
      <Avatar2DFallbackView
        avatarId={avatarId}
        gender={gender}
        params={params}
        selectedRegion={selectedRegion}
        height={height}
      />
    );
  }

  return (
    <View style={[styles.wrap, { height, width, backgroundColor: colors.surface }]} testID="avatar-viewer-3d">
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html, baseUrl: "https://localhost/" }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        bounces={false}
        androidLayerType="hardware"
        mixedContentMode="always"
        style={styles.web}
        onError={() => setMode("fallback")}
        onHttpError={() => {}}
      />
      {mode === "loading" ? (
        <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: colors.surface }]}>
          <ActivityIndicator color={colors.brandPrimary} size="large" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden" },
  web: { flex: 1, backgroundColor: "transparent" },
  center: { alignItems: "center", justifyContent: "center" },
});
