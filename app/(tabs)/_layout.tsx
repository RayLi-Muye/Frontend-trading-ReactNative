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
            intensity={96}
            style={{
              backgroundColor: "rgba(255,255,255,0.34)",
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
          backgroundColor: "rgba(255,255,255,0.28)",
          borderTopColor: "rgba(255,255,255,0.42)",
          height: 88,
          overflow: "hidden",
          paddingBottom: 22,
          paddingTop: 8,
          position: "absolute",
          boxShadow: "0 -18px 36px rgba(8, 11, 18, 0.10)",
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
