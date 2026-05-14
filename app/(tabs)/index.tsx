import * as Haptics from "expo-haptics";
import { PenLine } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { AppHeader } from "@/components/app-header";
import { GlassSurface } from "@/components/glass-surface";
import { HomeValueChart } from "@/components/home-value-chart";
import { MarketIndexStrip } from "@/components/market-index-strip";
import { MoverCard } from "@/components/mover-card";
import { ScreenScroll } from "@/components/screen-scroll";
import { colors, radius, shadows, spacing } from "@/design/theme";

export default function HomeScreen() {
  return (
    <ScreenScroll includeTopInset bottomInset={110}>
      <AppHeader rewardLabel="Earn $200" />

      <HomeValueChart />

      <MoverCard />

      <MarketIndexStrip />

      <Pressable
        accessibilityLabel="Edit quick actions"
        accessibilityRole="button"
        onPress={() => Haptics.selectionAsync().catch(() => {})}
        style={({ pressed }) => ({
          ...shadows.card,
          alignItems: "center",
          alignSelf: "flex-end",
          borderRadius: radius.full,
          justifyContent: "center",
          marginTop: -spacing.md,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <GlassSurface
          interactive
          tintColor="rgba(5,184,63,0.78)"
          style={{
            alignItems: "center",
            backgroundColor: colors.brandAction,
            borderRadius: radius.full,
            height: 64,
            justifyContent: "center",
            width: 64,
          }}
        >
          <PenLine color={colors.inverse} size={27} strokeWidth={2.4} />
        </GlassSurface>
      </Pressable>

      <View style={{ height: spacing.md }} />
    </ScreenScroll>
  );
}
