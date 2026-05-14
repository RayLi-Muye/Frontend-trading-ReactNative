import { Link, Tabs } from "expo-router";
import { Activity, Bookmark, Info, Newspaper } from "lucide-react-native";
import { Pressable } from "react-native";

import { colors } from "@/design/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: {
          color: colors.ink,
          fontSize: 17,
          fontWeight: "700",
        },
        headerRight: () => (
          <Link href="/disclaimer" asChild>
            <Pressable
              accessibilityLabel="Open demo notice"
              hitSlop={12}
              style={({ pressed }) => ({
                opacity: pressed ? 0.55 : 1,
                paddingHorizontal: 16,
                paddingVertical: 8,
              })}
            >
              <Info color={colors.ink} size={21} strokeWidth={2.2} />
            </Pressable>
          </Link>
        ),
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 84,
          paddingBottom: 22,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Markets",
          tabBarIcon: ({ color, focused }) => (
            <Activity color={color} size={focused ? 24 : 22} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color, focused }) => (
            <Bookmark color={color} size={focused ? 24 : 22} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, focused }) => (
            <Newspaper color={color} size={focused ? 24 : 22} strokeWidth={2.2} />
          ),
        }}
      />
    </Tabs>
  );
}
