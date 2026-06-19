import { View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { AppHeader } from "@/components/app-header";
import { HomeValueChart } from "@/components/home-value-chart";
import { MarketIndexStrip } from "@/components/market-index-strip";
import { MoverCard } from "@/components/mover-card";
import { ScreenScroll } from "@/components/screen-scroll";
import { spacing } from "@/design/theme";

function HomeBackdrop() {
  return (
    <View style={{ height: 430, left: -32, pointerEvents: "none", position: "absolute", right: -32, top: -28 }}>
      <Svg height="100%" width="100%">
        <Defs>
          <LinearGradient id="homeWash" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor="#d8f5ea" stopOpacity="0.62" />
            <Stop offset="0.52" stopColor="#e8f7ef" stopOpacity="0.38" />
            <Stop offset="1" stopColor="#f8f9f5" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect fill="url(#homeWash)" height="100%" width="100%" />
      </Svg>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScreenScroll includeTopInset bottomInset={110} maxContentWidth={1120}>
      <HomeBackdrop />
      <AppHeader rewardLabel="Earn $200" />

      <HomeValueChart />

      <MoverCard />

      <MarketIndexStrip />

      <View style={{ height: spacing.md }} />
    </ScreenScroll>
  );
}
