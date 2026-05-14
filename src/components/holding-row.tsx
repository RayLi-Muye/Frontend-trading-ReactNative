import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";

import type { Holding } from "@/data/portfolio";
import type { PricePulse } from "@/hooks/use-live-market";
import { colors, radius, spacing } from "@/design/theme";
import { formatCurrency, formatPercent, formatPrice, formatSignedCurrency } from "@/utils/format";

import { AssetLogo } from "./asset-logo";

type HoldingRowProps = {
  holding: Holding;
  pulse?: PricePulse;
};

export function HoldingRow({ holding, pulse }: HoldingRowProps) {
  const flash = useSharedValue(0);
  const scale = useSharedValue(1);
  const movementColor = holding.changePercent >= 0 ? colors.positive : colors.negative;
  const pnlColor = holding.pnl >= 0 ? colors.positive : colors.negative;

  useEffect(() => {
    if (!pulse) {
      return;
    }

    flash.value = withSequence(
      withTiming(1, { duration: 90 }),
      withDelay(360, withTiming(0, { duration: 260 })),
    );
  }, [flash, pulse]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  const pressStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Link asChild href={{ pathname: "/instrument/[symbol]", params: { symbol: holding.symbol } }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${holding.symbol}`}
        onPressIn={() => {
          Haptics.selectionAsync().catch(() => {});
          scale.value = withSpring(0.985, { damping: 18, stiffness: 260 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 240 });
        }}
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.line,
          borderBottomWidth: 1,
          height: 96,
          position: "relative",
        }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: pulse?.direction === "down" ? "rgba(255,47,61,0.12)" : "rgba(13,187,79,0.12)",
              bottom: 0,
              left: 0,
              pointerEvents: "none",
              position: "absolute",
              right: 0,
              top: 0,
            },
            flashStyle,
          ]}
        />
        <Link.AppleZoom>
          <View style={{ flex: 1 }}>
            <Animated.View style={pressStyle}>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: spacing.sm,
                  left: spacing.lg,
                  minWidth: 0,
                  position: "absolute",
                  top: 18,
                  width: 150,
                }}
              >
                <AssetLogo background={holding.logoBackground} color={holding.logoColor} label={holding.logoLabel} size={42} />
                <View style={{ minWidth: 0, width: 98 }}>
                  <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.xs }}>
                    <Text selectable numberOfLines={1} style={{ color: colors.ink, flexShrink: 1, fontSize: 17, fontWeight: "900" }}>
                      {holding.symbol}
                    </Text>
                    <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "800" }}>
                        {holding.dateLabel}
                      </Text>
                    </View>
                  </View>
                  <Text selectable style={{ color: colors.ink, fontSize: 15, fontVariant: ["tabular-nums"], fontWeight: "600" }}>
                    {formatPrice(holding.price)}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: "flex-end", justifyContent: "center", left: 166, position: "absolute", top: 36, width: 56 }}>
                <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: movementColor, fontSize: 15, fontVariant: ["tabular-nums"], fontWeight: "700" }}>
                  {formatPercent(holding.changePercent)}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end", justifyContent: "center", left: 222, position: "absolute", top: 36, width: 76 }}>
                <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: pnlColor, fontSize: 13, fontVariant: ["tabular-nums"], fontWeight: "700" }}>
                  {formatSignedCurrency(holding.pnl)}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end", justifyContent: "center", left: 298, position: "absolute", top: 36, width: 76 }}>
                <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: colors.ink, fontSize: 13, fontVariant: ["tabular-nums"], fontWeight: "700" }}>
                  {formatCurrency(holding.value)}
                </Text>
              </View>
            </Animated.View>
          </View>
        </Link.AppleZoom>
      </Pressable>
    </Link>
  );
}
