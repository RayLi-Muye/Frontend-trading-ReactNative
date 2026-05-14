import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { EquityAsset } from "@/data/portfolio";
import type { PricePulse } from "@/hooks/use-live-market";
import { colors, radius, spacing } from "@/design/theme";
import { formatPercent, formatPrice } from "@/utils/format";

import { AssetLogo } from "./asset-logo";

type WatchlistQuoteRowProps = {
  asset: EquityAsset;
  hotSide?: "bid" | "ask";
  pulse?: PricePulse;
};

export function WatchlistQuoteRow({ asset, hotSide, pulse }: WatchlistQuoteRowProps) {
  const flash = useSharedValue(0);
  const scale = useSharedValue(1);
  const positive = asset.changePercent >= 0;
  const movementColor = positive ? colors.positive : colors.negative;

  useEffect(() => {
    if (!pulse) {
      return;
    }

    flash.value = withSequence(
      withTiming(1, { duration: 90 }),
      withDelay(430, withTiming(0, { duration: 260 })),
    );
  }, [flash, pulse]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  const pressStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ scale: scale.value }],
  }));

  function cellColor(side: "bid" | "ask") {
    if (hotSide !== side) {
      return colors.surfaceAlt;
    }
    return positive ? colors.positive : colors.negative;
  }

  function textColor(side: "bid" | "ask") {
    return hotSide === side ? colors.ink : colors.subtle;
  }

  return (
    <Link asChild href={{ pathname: "/instrument/[symbol]", params: { symbol: asset.symbol } }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${asset.symbol}`}
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
          height: 78,
          position: "relative",
        }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: pulse?.direction === "down" ? "rgba(255,47,61,0.14)" : "rgba(13,187,79,0.14)",
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
                  top: 14,
                  width: 130,
                }}
              >
                <AssetLogo background={asset.logoBackground} color={asset.logoColor} label={asset.logoLabel} size={42} />
                <View style={{ minWidth: 0, width: 78 }}>
                  <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 21, fontWeight: "900" }}>
                    {asset.symbol}
                  </Text>
                  <Text selectable style={{ color: movementColor, fontSize: 16, fontVariant: ["tabular-nums"], fontWeight: "600" }}>
                    {formatPercent(asset.changePercent)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: spacing.sm, left: 154, position: "absolute", top: 14, width: 220 }}>
                {(["bid", "ask"] as const).map((side) => (
                  <View
                    key={side}
                    style={{
                      alignItems: "center",
                      backgroundColor: cellColor(side),
                      borderRadius: radius.full,
                      flex: 1,
                      justifyContent: "center",
                      minHeight: 48,
                      minWidth: 0,
                      paddingHorizontal: spacing.sm,
                    }}
                  >
                    <Text
                      selectable
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={{
                        color: textColor(side),
                        fontSize: 18,
                        fontVariant: ["tabular-nums"],
                        fontWeight: "900",
                      }}
                    >
                      {formatPrice(side === "bid" ? asset.bid : asset.ask)}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>
        </Link.AppleZoom>
      </Pressable>
    </Link>
  );
}
