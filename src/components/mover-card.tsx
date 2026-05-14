import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { EquityAsset } from "@/data/portfolio";
import { watchlistAssets } from "@/data/portfolio";
import { colors, radius, spacing } from "@/design/theme";
import type { PricePulse } from "@/hooks/use-live-market";
import { useLiveAssets } from "@/hooks/use-live-market";
import { formatPercent, formatPrice } from "@/utils/format";

import { AssetLogo } from "./asset-logo";
import { Sparkline } from "./sparkline";

type MoverRowProps = {
  asset: EquityAsset;
  compact: boolean;
  index: number;
  pulse?: PricePulse;
};

function MoverRow({ asset, compact, index, pulse }: MoverRowProps) {
  const positive = asset.changePercent >= 0;
  const movementColor = positive ? colors.positive : colors.negative;
  const rowHeight = compact ? 66 : 72;
  const flash = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!pulse) {
      return;
    }

    flash.value = withSequence(withTiming(1, { duration: 90 }), withDelay(420, withTiming(0, { duration: 260 })));
  }, [flash, pulse]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Link asChild href={{ pathname: "/instrument/[symbol]", params: { symbol: asset.symbol } }}>
      <Pressable
        accessibilityLabel={`Open ${asset.symbol}`}
        accessibilityRole="button"
        onPressIn={() => {
          Haptics.selectionAsync().catch(() => {});
          scale.value = withSpring(0.985, { damping: 18, stiffness: 260 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 240 });
        }}
        style={{
          borderRadius: radius.md,
          overflow: "hidden",
        }}
      >
        <Link.AppleZoom>
          <View style={{ minHeight: rowHeight }}>
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
            <Animated.View
              entering={FadeInUp.delay(index * 52).duration(420).springify()}
              style={[
                {
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.56)",
                  borderColor: "rgba(8,11,18,0.06)",
                  borderRadius: radius.md,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: compact ? spacing.sm : spacing.md,
                  minHeight: rowHeight,
                  paddingHorizontal: compact ? spacing.sm : spacing.md,
                },
                pressStyle,
              ]}
            >
              <AssetLogo background={asset.logoBackground} color={asset.logoColor} label={asset.logoLabel} size={compact ? 34 : 38} />

              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ gap: 2 }}>
                  <Text numberOfLines={1} style={{ color: colors.ink, fontSize: compact ? 17 : 18, fontWeight: "900" }}>
                    {asset.symbol}
                  </Text>
                  <Text numberOfLines={1} style={{ color: colors.muted, fontSize: compact ? 12 : 13, fontWeight: "700" }}>
                    {asset.name}
                  </Text>
                </View>
              </View>

              <Sparkline
                color={movementColor}
                height={compact ? 28 : 34}
                showDot={false}
                showGuide={false}
                values={asset.sparkline}
                width={compact ? 68 : 96}
              />

              <View style={{ alignItems: "flex-end", gap: 3, minWidth: compact ? 68 : 82 }}>
                <Text numberOfLines={1} style={{ color: colors.ink, fontSize: compact ? 14 : 15, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
                  {formatPrice(asset.price)}
                </Text>
                <Text numberOfLines={1} style={{ color: movementColor, fontSize: 12, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
                  {formatPercent(asset.changePercent)}
                </Text>
              </View>
            </Animated.View>
          </View>
        </Link.AppleZoom>
      </Pressable>
    </Link>
  );
}

export function MoverCard() {
  const { width } = useWindowDimensions();
  const isPad = width >= 768;
  const compact = !isPad;
  const itemCount = isPad ? 5 : 4;
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const { assets, pulses } = useLiveAssets(watchlistAssets, { count: 3, intervalMs: 2600, scale: 0.0015 });

  const { gainers, losers } = useMemo(() => {
    const sortedGainers = assets
      .filter((asset) => asset.changePercent >= 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, itemCount);
    const sortedLosers = assets
      .filter((asset) => asset.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, itemCount);

    return { gainers: sortedGainers, losers: sortedLosers };
  }, [assets, itemCount]);
  const activeAssets = mode === "gainers" ? gainers : losers;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: "rgba(8, 11, 18, 0.04)",
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.lg,
        marginTop: spacing.xs,
        padding: isPad ? spacing.xl : spacing.lg,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: isPad ? 24 : 22, fontWeight: "900" }}>
            Top Movers
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            backgroundColor: "rgba(241,243,239,0.9)",
            borderColor: "rgba(8, 11, 18, 0.08)",
            borderRadius: radius.full,
            borderWidth: 1,
            flexDirection: "row",
            gap: 3,
            padding: 3,
          }}
        >
          <Pressable
            accessibilityLabel="Show gainers"
            accessibilityRole="button"
            accessibilityState={{ selected: mode === "gainers" }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setMode("gainers");
            }}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: mode === "gainers" ? colors.surface : "transparent",
              borderRadius: radius.full,
              boxShadow: mode === "gainers" ? "0 4px 12px rgba(16, 20, 17, 0.12)" : "none",
              height: 36,
              justifyContent: "center",
              opacity: pressed ? 0.72 : 1,
              width: 38,
            })}
          >
            <ArrowUpRight color={mode === "gainers" ? colors.positive : colors.subtle} size={21} strokeWidth={2.7} />
          </Pressable>
          <Pressable
            accessibilityLabel="Show losers"
            accessibilityRole="button"
            accessibilityState={{ selected: mode === "losers" }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setMode("losers");
            }}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: mode === "losers" ? colors.surface : "transparent",
              borderRadius: radius.full,
              boxShadow: mode === "losers" ? "0 4px 12px rgba(16, 20, 17, 0.12)" : "none",
              height: 36,
              justifyContent: "center",
              opacity: pressed ? 0.72 : 1,
              width: 38,
            })}
          >
            <ArrowDownRight color={mode === "losers" ? colors.negative : colors.subtle} size={21} strokeWidth={2.7} />
          </Pressable>
        </View>
      </View>

      <View style={{ gap: compact ? spacing.sm : 8 }}>
        {activeAssets.map((asset, index) => (
          <MoverRow asset={asset} compact={compact} index={index} key={`${mode}-${asset.symbol}`} pulse={pulses[asset.symbol]} />
        ))}
      </View>
    </View>
  );
}
