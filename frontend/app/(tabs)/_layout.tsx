import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useT } from "@/src/i18n";
import { colors } from "@/src/theme";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View
      style={[
        styles.iconWrap,
        {
          backgroundColor: focused ? colors.brandPrimary : "transparent",
          borderColor: focused ? colors.brandPrimary : colors.border,
        },
      ]}
    >
      <Text
        style={{
          color: focused ? colors.onBrandPrimary : colors.onSurface,
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const t = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          ...(Platform.OS === "web" ? { height: 68 } : {}),
        },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: t("tab_library"),
          tabBarIcon: ({ focused }) => <TabIcon label="L" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="editor"
        options={{
          title: t("tab_editor"),
          tabBarIcon: ({ focused }) => <TabIcon label="E" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="versions"
        options={{
          title: t("tab_versions"),
          tabBarIcon: ({ focused }) => <TabIcon label="V" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tab_profile"),
          tabBarIcon: ({ focused }) => <TabIcon label="P" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
