import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { LogBox, Platform, View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useFonts } from "expo-font";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { queryClient } from "@/src/query-client";
import { colors } from "@/src/theme";
import { hydrate } from "@/src/store";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Cairo: require("../assets/fonts/Cairo-Regular.ttf"),
    "Cairo-Bold": require("../assets/fonts/Cairo-Bold.ttf"),
  });

  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, []);

  // Dark system navigation bar so there are no white bars on Android.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    NavigationBar.setButtonStyleAsync("light").catch(() => {});
    NavigationBar.setBackgroundColorAsync(colors.surface).catch(() => {});
  }, []);

  if (!ready || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.brandPrimary} size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.surface }}>
        <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.surface }}>
          <QueryClientProvider client={queryClient}>
            <KeyboardProvider>
              <StatusBar style="light" backgroundColor="transparent" translucent />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.surface },
                  animation: "fade",
                }}
              />
            </KeyboardProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
