import * as Haptics from "expo-haptics";
import { ChevronDown, EllipsisVertical, Plus, SlidersHorizontal } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AppHeader } from "@/components/app-header";
import { GlassSurface } from "@/components/glass-surface";
import { ScreenScroll } from "@/components/screen-scroll";
import { WatchlistQuoteRow } from "@/components/watchlist-quote-row";
import { watchlistAssets } from "@/data/portfolio";
import { colors, radius, shadows, spacing } from "@/design/theme";
import { useLiveAssets } from "@/hooks/use-live-market";

const chips = ["All", "My Portfolio", "Open", "Investors", "Stocks"];

export default function WatchlistScreen() {
  const { assets, pulses } = useLiveAssets(watchlistAssets, { count: 3, intervalMs: 2000, scale: 0.0017 });

  return (
    <ScreenScroll includeTopInset bottomInset={118}>
      <AppHeader searchPlaceholder="Search" />

      <Animated.View entering={FadeInUp.duration(520).springify()} style={{ gap: spacing.xl }}>
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
          <View style={{ alignItems: "center", flexDirection: "row", flex: 1, gap: spacing.sm }}>
            <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: colors.ink, fontSize: 31, fontWeight: "900" }}>
              My Watchlist
            </Text>
            <ChevronDown color={colors.ink} size={23} strokeWidth={2.4} />
          </View>

          <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.lg }}>
            <SlidersHorizontal color={colors.positive} size={28} strokeWidth={2.5} />
            <EllipsisVertical color={colors.muted} size={26} strokeWidth={2.5} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {chips.map((chip, index) => (
            <Pressable
              key={chip}
              onPress={() => Haptics.selectionAsync().catch(() => {})}
              style={{
                backgroundColor: index === 0 ? "#303544" : colors.surface,
                borderColor: index === 0 ? "#303544" : "#c9ceda",
                borderRadius: radius.full,
                borderWidth: 1,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
              }}
            >
              <Text selectable style={{ color: index === 0 ? colors.inverse : colors.muted, fontSize: 18, fontWeight: "800" }}>
                {chip}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <View style={{ backgroundColor: colors.surface, marginHorizontal: -spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
          }}
        >
          <Text selectable style={{ color: colors.muted, fontSize: 17, fontWeight: "800", width: 138 }}>
            Market
          </Text>
          <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 17, fontWeight: "800", textAlign: "center" }}>
            Sell
          </Text>
          <Text selectable style={{ color: colors.muted, flex: 1.05, fontSize: 17, fontWeight: "800", textAlign: "center" }}>
            Buy
          </Text>
        </View>

        {assets.map((asset) => (
          <WatchlistQuoteRow
            key={asset.symbol}
            asset={asset}
            hotSide={pulses[asset.symbol]?.direction === "down" ? "ask" : pulses[asset.symbol]?.direction === "up" ? "bid" : undefined}
            pulse={pulses[asset.symbol]}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add asset"
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})}
        style={({ pressed }) => ({
          ...shadows.card,
          alignItems: "center",
          alignSelf: "flex-end",
          borderRadius: radius.full,
          flexDirection: "row",
          gap: spacing.sm,
          marginTop: -84,
          opacity: pressed ? 0.72 : 1,
        })}
      >
        <GlassSurface
          interactive
          tintColor="rgba(5,184,63,0.78)"
          style={{
            alignItems: "center",
            backgroundColor: colors.brandAction,
            borderRadius: radius.full,
            flexDirection: "row",
            gap: spacing.sm,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
          }}
        >
          <Text style={{ color: colors.inverse, fontSize: 21, fontWeight: "900" }}>Add</Text>
          <Plus color={colors.inverse} size={27} strokeWidth={2.4} />
        </GlassSurface>
      </Pressable>
    </ScreenScroll>
  );
}
