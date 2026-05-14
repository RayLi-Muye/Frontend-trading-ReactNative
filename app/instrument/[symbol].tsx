import * as Haptics from "expo-haptics";
import { Link, useLocalSearchParams } from "expo-router";
import Stack from "expo-router/stack";
import { useMemo, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AssetLogo } from "@/components/asset-logo";
import { GlassSurface } from "@/components/glass-surface";
import { ScreenScroll } from "@/components/screen-scroll";
import { SegmentedControl } from "@/components/segmented-control";
import { Sparkline } from "@/components/sparkline";
import { StatTile } from "@/components/stat-tile";
import { getAssetBySymbol } from "@/data/portfolio";
import { colors, radius, shadows, spacing } from "@/design/theme";
import { useLiveAssets } from "@/hooks/use-live-market";
import { formatCurrency, formatPercent, formatPrice, formatSignedCurrency } from "@/utils/format";

type Range = "1D" | "1W" | "1M" | "3M";

const rangeSegments: Array<{ label: string; value: Range }> = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
];

export default function InstrumentDetailScreen() {
  const params = useLocalSearchParams<{ symbol?: string }>();
  const { width } = useWindowDimensions();
  const symbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
  const baseAsset = symbol ? getAssetBySymbol(symbol) : undefined;
  const sourceAssets = useMemo(() => (baseAsset ? [baseAsset] : []), [baseAsset]);
  const live = useLiveAssets(sourceAssets, { count: 1, intervalMs: 1800, scale: 0.0014 });
  const asset = live.assets[0];
  const [range, setRange] = useState<Range>("1D");

  const values = useMemo(() => {
    if (!asset) {
      return [];
    }

    const multiplier = range === "1D" ? 1 : range === "1W" ? 1.035 : range === "1M" ? 0.965 : 1.08;
    return asset.sparkline.map((value, index) => value * multiplier + index * 0.08);
  }, [asset, range]);

  if (!asset) {
    return (
      <ScreenScroll>
        <Stack.Screen options={{ title: "Market Detail" }} />
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>
          This market is currently unavailable.
        </Text>
      </ScreenScroll>
    );
  }

  const positive = asset.changePercent >= 0;
  const movementColor = positive ? colors.positive : colors.negative;
  const spread = asset.ask - asset.bid;
  const chartWidth = Math.min(width - spacing.lg * 4, 520);

  return (
    <ScreenScroll>
      <Stack.Screen options={{ title: asset.symbol }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="Create price alert"
          icon="bell.badge"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})}
          tintColor={colors.brandAction}
        />
        <Stack.Toolbar.Menu accessibilityLabel="More market actions" icon="ellipsis.circle">
          <Stack.Toolbar.MenuAction icon="plus.circle" onPress={() => Haptics.selectionAsync().catch(() => {})}>
            Add to Watchlist
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="chart.line.uptrend.xyaxis" onPress={() => Haptics.selectionAsync().catch(() => {})}>
            View Depth
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <Link.AppleZoomTarget>
        <Animated.View entering={FadeInUp.duration(520).springify()}>
          <GlassSurface
            interactive
            style={{
              ...shadows.card,
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              gap: spacing.lg,
              padding: spacing.lg,
            }}
          >
            <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
              <AssetLogo background={asset.logoBackground} color={asset.logoColor} label={asset.logoLabel} size={54} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 30, fontWeight: "900" }}>
                  {asset.symbol}
                </Text>
                <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 15, fontWeight: "700" }}>
                  {asset.name}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text selectable style={{ color: colors.ink, fontSize: 22, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
                  {formatPrice(asset.price)}
                </Text>
                <Text selectable style={{ color: movementColor, fontSize: 16, fontVariant: ["tabular-nums"], fontWeight: "800" }}>
                  {formatPercent(asset.changePercent)}
                </Text>
              </View>
            </View>

            <Sparkline values={values} color={movementColor} fillArea height={210} width={chartWidth} showDot={false} showGuide={false} />
          </GlassSurface>
        </Animated.View>
      </Link.AppleZoomTarget>

      <SegmentedControl
        value={range}
        segments={rangeSegments}
        onChange={(nextRange) => {
          Haptics.selectionAsync().catch(() => {});
          setRange(nextRange);
        }}
      />

      <Animated.View entering={FadeInUp.delay(90).duration(460).springify()} style={{ flexDirection: "row", gap: spacing.md }}>
        <StatTile label="Sell" value={formatPrice(asset.bid)} />
        <StatTile label="Buy" value={formatPrice(asset.ask)} tone={positive ? "positive" : "negative"} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(160).duration(460).springify()} style={{ flexDirection: "row", gap: spacing.md }}>
        <StatTile label="Spread" value={spread.toFixed(asset.price < 1 ? 4 : 2)} />
        <StatTile label="Today" value={formatSignedCurrency(asset.change)} tone={positive ? "positive" : "negative"} />
      </Animated.View>

      <View
        style={{
          backgroundColor: colors.ink,
          borderRadius: radius.md,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: spacing.md,
          padding: spacing.lg,
        }}
      >
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ color: colors.inverseMuted, fontSize: 13, fontWeight: "800" }}>
            Estimated order
          </Text>
          <Text selectable style={{ color: colors.inverse, fontSize: 22, fontWeight: "900" }}>
            {formatCurrency(1250)}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
          <Text selectable style={{ color: colors.inverseMuted, fontSize: 13, fontWeight: "800" }}>
            Market status
          </Text>
          <Text selectable style={{ color: colors.brand, fontSize: 22, fontWeight: "900" }}>
            Open
          </Text>
        </View>
      </View>
    </ScreenScroll>
  );
}
