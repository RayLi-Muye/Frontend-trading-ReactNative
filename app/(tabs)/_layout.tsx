import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { ChartPie, Eye, House, Wallet } from "lucide-react-native";
import { useWindowDimensions } from "react-native";

import { HeaderPanelProvider } from "@/components/header-panel-provider";
import { colors, radius } from "@/design/theme";

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const tabWidth = Math.min(Math.max(width - 32, 0), 620);
  const isWide = width >= 768;

  return (
    <HeaderPanelProvider>
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
                backgroundColor: "rgba(255,255,255,0.42)",
                flex: 1,
              }}
            />
          ),
          tabBarItemStyle: {
            flex: 1,
            minWidth: 0,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "800" },
          tabBarLabelPosition: "below-icon",
          tabBarStyle: {
            backgroundColor: "rgba(255,255,255,0.46)",
            borderColor: "rgba(255,255,255,0.74)",
            borderRadius: radius.full,
            borderTopColor: "rgba(255,255,255,0.74)",
            borderWidth: 1,
            bottom: 14,
            height: 74,
            left: isWide ? (width - tabWidth) / 2 : 16,
            overflow: "hidden",
            paddingBottom: 8,
            paddingTop: 8,
            position: "absolute",
            width: tabWidth,
            boxShadow: "0 18px 42px rgba(8, 11, 18, 0.16)",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => <House color={color} size={focused ? 25 : 23} strokeWidth={2.4} />,
          }}
        />
        <Tabs.Screen
          name="portfolio"
          options={{
            title: "Investments",
            tabBarIcon: ({ color, focused }) => <ChartPie color={color} size={focused ? 25 : 23} strokeWidth={2.4} />,
          }}
        />
        <Tabs.Screen
          name="watchlist"
          options={{
            title: "Watchlist",
            tabBarIcon: ({ color, focused }) => <Eye color={color} size={focused ? 25 : 23} strokeWidth={2.4} />,
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: "Wallet",
            tabBarIcon: ({ color, focused }) => <Wallet color={color} size={focused ? 25 : 23} strokeWidth={2.4} />,
          }}
        />
      </Tabs>
    </HeaderPanelProvider>
  );
}
