import * as Haptics from "expo-haptics";
import { ChartColumn, ChevronDown, Coins, EllipsisVertical, Settings2 } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AppHeader } from "@/components/app-header";
import { GlassSurface } from "@/components/glass-surface";
import { HoldingRow } from "@/components/holding-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { accountSummary, holdings } from "@/data/portfolio";
import { colors, radius, shadows, spacing } from "@/design/theme";
import { useLiveHoldings } from "@/hooks/use-live-market";
import { formatCurrency, formatSignedCurrency } from "@/utils/format";

const filters = ["Orders", "Trades", "Open", "Stocks"];

export default function PortfolioScreen() {
  const live = useLiveHoldings(holdings);

  return (
    <ScreenScroll includeTopInset bottomInset={110}>
      <AppHeader
        centerLabel={formatCurrency(accountSummary.investmentValue)}
        centerSubLabel={formatSignedCurrency(-13.83)}
      />

      <Animated.View entering={FadeInUp.duration(520).springify()} style={{ gap: spacing.xl }}>
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
          <View style={{ alignItems: "center", flexDirection: "row", flex: 1, gap: spacing.sm }}>
            <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: colors.ink, fontSize: 31, fontWeight: "900" }}>
              My Portfolio
            </Text>
            <ChevronDown color={colors.ink} size={23} strokeWidth={2.4} />
          </View>

          <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.lg }}>
            <ChartColumn color={colors.muted} size={27} strokeWidth={2.6} />
            <Settings2 color={colors.muted} size={27} strokeWidth={2.6} />
            <EllipsisVertical color={colors.ink} size={25} strokeWidth={2.5} />
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
          {filters.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => Haptics.selectionAsync().catch(() => {})}
              style={{
                borderColor: "#c9ceda",
                borderRadius: radius.full,
                borderWidth: 1,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.sm,
              }}
            >
              <Text selectable style={{ color: colors.muted, fontSize: 18, fontWeight: "800" }}>
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <View style={{ backgroundColor: colors.surface, marginHorizontal: -spacing.lg }}>
        <View
          style={{
            borderBottomColor: colors.line,
            borderBottomWidth: 1,
            flexDirection: "row",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          }}
        >
          <Text selectable style={{ color: colors.muted, fontSize: 18, fontWeight: "900", width: 150 }}>
            Assets ({live.holdings.length})
          </Text>
          <Text selectable style={{ color: "#1597e5", fontSize: 18, fontWeight: "900", textAlign: "right", width: 56 }}>
            Move ▲
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 18, fontWeight: "900", textAlign: "right", width: 76 }}>
            P/L
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 18, fontWeight: "900", textAlign: "right", width: 76 }}>
            Value
          </Text>
        </View>

        {live.holdings.map((holding) => (
          <HoldingRow key={holding.symbol} holding={holding} pulse={live.pulses[holding.symbol]} />
        ))}
      </View>

      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ color: colors.muted, fontSize: 18, fontWeight: "800" }}>
            Available balance ⓘ
          </Text>
          <Text selectable style={{ color: colors.ink, fontSize: 25, fontVariant: ["tabular-nums"], fontWeight: "600" }}>
            {formatCurrency(accountSummary.availableCash)}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Deposit funds"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})}
          style={({ pressed }) => ({
            ...shadows.card,
            alignItems: "center",
            borderRadius: radius.full,
            flexDirection: "row",
            gap: spacing.sm,
            justifyContent: "center",
            minWidth: 132,
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <GlassSurface
            interactive
            tintColor="rgba(5,184,63,0.82)"
            style={{
              alignItems: "center",
              backgroundColor: colors.brandAction,
              borderRadius: radius.full,
              flexDirection: "row",
              gap: spacing.sm,
              justifyContent: "center",
              minWidth: 132,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
            }}
          >
            <Coins color={colors.inverse} size={21} strokeWidth={2.4} />
            <Text style={{ color: colors.inverse, fontSize: 20, fontWeight: "900" }}>Deposit</Text>
          </GlassSurface>
        </Pressable>
      </View>
    </ScreenScroll>
  );
}
