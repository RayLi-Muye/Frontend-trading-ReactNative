import { ArrowDown, ArrowUp, EllipsisVertical } from "lucide-react-native";
import { Text, View } from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";

import { movers } from "@/data/portfolio";
import { colors, radius, shadows, spacing } from "@/design/theme";
import { formatPercent } from "@/utils/format";

import { AssetLogo } from "./asset-logo";
import { GlassSurface } from "./glass-surface";

export function MoverCard() {
  return (
    <GlassSurface
      style={{
        ...shadows.card,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        gap: spacing.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xl,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
          <Text selectable style={{ color: colors.ink, fontSize: 25, fontWeight: "900" }}>
            Top movers
          </Text>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>
            i
          </Text>
        </View>
        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.lg }}>
          <ArrowUp color={colors.ink} size={26} strokeWidth={2.5} />
          <ArrowDown color={colors.subtle} size={26} strokeWidth={2.5} />
          <EllipsisVertical color={colors.ink} size={24} strokeWidth={2.5} />
        </View>
      </View>

      <View style={{ alignItems: "flex-end", flexDirection: "row", gap: spacing.xl, justifyContent: "center", minHeight: 230 }}>
        {movers.map((mover, index) => {
          const barHeight = Math.max(52, mover.value * 96);
          return (
            <Animated.View
              entering={FadeInUp.delay(index * 110).duration(520).springify()}
              key={mover.symbol}
              style={{ alignItems: "center", gap: spacing.sm, opacity: index === 2 ? 0.42 : 1 }}
            >
              <Text selectable style={{ color: colors.positive, fontSize: 18, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
                {formatPercent(mover.value)}
              </Text>
              <Animated.View
                entering={ZoomIn.delay(index * 130).duration(420).springify()}
                style={{
                  backgroundColor: index === 2 ? colors.line : colors.brandAction,
                  borderRadius: 8,
                  height: barHeight,
                  width: 42,
                }}
              />
              <AssetLogo background={mover.logoBackground} color={mover.logoColor} label={mover.logoLabel} size={42} />
              <Text selectable style={{ color: colors.muted, fontSize: 14, fontWeight: "900" }}>
                {mover.symbol}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </GlassSurface>
  );
}
