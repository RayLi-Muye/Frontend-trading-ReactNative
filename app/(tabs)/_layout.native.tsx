import { NativeTabs } from "expo-router/unstable-native-tabs";

import { colors } from "@/design/theme";

export default function NativeTabLayout() {
  return (
    <NativeTabs
      backgroundColor="transparent"
      badgeBackgroundColor="#cf241b"
      blurEffect="systemUltraThinMaterial"
      disableTransparentOnScrollEdge
      iconColor={{ default: colors.muted, selected: colors.brandAction }}
      indicatorColor="rgba(5,184,63,0.18)"
      labelStyle={{
        default: { color: colors.muted, fontSize: 12, fontWeight: "700" },
        selected: { color: colors.brandAction, fontSize: 12, fontWeight: "700" },
      }}
      labelVisibilityMode="labeled"
      minimizeBehavior="onScrollDown"
      rippleColor="rgba(5,184,63,0.14)"
      shadowColor="rgba(8, 11, 18, 0.08)"
      tintColor={colors.brandAction}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="portfolio">
        <NativeTabs.Trigger.Icon sf={{ default: "chart.pie", selected: "chart.pie.fill" }} md="pie_chart" />
        <NativeTabs.Trigger.Label>Investments</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="watchlist">
        <NativeTabs.Trigger.Icon sf={{ default: "eye", selected: "eye.fill" }} md="visibility" />
        <NativeTabs.Trigger.Label>Watchlist</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="wallet">
        <NativeTabs.Trigger.Icon sf={{ default: "wallet.pass", selected: "wallet.pass.fill" }} md="wallet" />
        <NativeTabs.Trigger.Label>Wallet</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
