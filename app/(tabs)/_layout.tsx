import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { ChartPie, Eye, House, Wallet } from "lucide-react-native";

import { colors } from "@/design/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandAction,
        tabBarInactiveTintColor: colors.muted,
        tabBarBackground: () => (
          <BlurView
            tint="systemUltraThinMaterial"
            intensity={86}
            style={{
              backgroundColor: "rgba(255,255,255,0.62)",
              flex: 1,
            }}
          />
        ),
        tabBarItemStyle: {
          flex: 1,
          minWidth: 0,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.58)",
          borderTopColor: "rgba(230,234,240,0.55)",
          height: 88,
          overflow: "hidden",
          paddingBottom: 22,
          paddingTop: 8,
          position: "absolute",
          boxShadow: "0 -14px 32px rgba(8, 11, 18, 0.08)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <House color={color} size={focused ? 25 : 23} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Investments",
          tabBarIcon: ({ color, focused }) => (
            <ChartPie color={color} size={focused ? 25 : 23} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color, focused }) => (
            <Eye color={color} size={focused ? 25 : 23} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <Wallet color={color} size={focused ? 25 : 23} strokeWidth={2.4} />
          ),
        }}
      />
    </Tabs>
  );
}
