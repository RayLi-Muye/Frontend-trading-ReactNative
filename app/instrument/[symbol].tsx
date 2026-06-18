import * as Haptics from "expo-haptics";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import Stack from "expo-router/stack";
import { Activity, BarChart3, ChevronDown, ChevronLeft, Ellipsis, PencilLine, Settings, Share2, Star, TrendingDown, TrendingUp } from "lucide-react-native";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, TextInput, View, type GestureResponderEvent } from "react-native";
import Animated, { Easing, FadeInUp, FadeOutDown, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { AssetLogo } from "@/components/asset-logo";
import { ScreenScroll } from "@/components/screen-scroll";
import { Sparkline, type SparklineDatum } from "@/components/sparkline";
import {
  getAssetBySymbol,
  getAssetMetrics,
  getInstrumentSymbols,
  instrumentRangeProfiles,
  type AssetMetrics,
  type EquityAsset,
  type Holding,
  type InstrumentChartRange,
} from "@/data/portfolio";
import { colors, radius, shadows, spacing } from "@/design/theme";
import { useAppViewportDimensions } from "@/hooks/use-app-viewport";
import { buyPortfolioAsset, sellPortfolioAsset, useDemoAccountSummary, usePortfolioHolding } from "@/hooks/use-demo-portfolio";
import { useLiveAssets } from "@/hooks/use-live-market";
import { useWatchlistStatus } from "@/hooks/use-watchlist";
import { formatCurrency, formatPercent, formatPrice, formatSignedCurrency } from "@/utils/format";
import type { SimulatedLedgerEntry } from "@/domain/simulated-trading";

type MetricTone = "positive" | "negative" | "neutral";

const cryptoSymbols = new Set(["SOL", "BTC", "ETH"]);

export function generateStaticParams() {
  return getInstrumentSymbols().map((symbol) => ({ symbol }));
}

const rangeSegments: Array<{ label: string; value: InstrumentChartRange }> = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "1Y", value: "1Y" },
];

const instrumentChartEnd = new Date(2026, 4, 15, 15, 30);
const instrumentDateFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" });
const instrumentTimeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const instrumentRangeStepMinutes: Record<InstrumentChartRange, number> = {
  "1D": 24,
  "1W": 240,
  "1M": 1440,
  "3M": 4320,
  "1Y": 17520,
};

function getInstrumentChartDate(index: number, total: number, range: InstrumentChartRange) {
  const offset = (total - 1 - index) * instrumentRangeStepMinutes[range] * 60 * 1000;
  return new Date(instrumentChartEnd.getTime() - offset);
}

function hapticTap() {
  Haptics.selectionAsync().catch(() => {});
}

function assetKind(asset: EquityAsset) {
  return asset.assetClass ?? (cryptoSymbols.has(asset.symbol) ? "crypto" : "stock");
}

function InstrumentBackdrop({ positive }: { positive: boolean }) {
  return (
    <View style={{ height: 320, left: -32, pointerEvents: "none", position: "absolute", right: -32, top: -42 }}>
      <Svg height="100%" width="100%">
        <Defs>
          <LinearGradient id="instrumentWash" x1="0" x2="1" y1="0" y2="0.92">
            <Stop offset="0" stopColor={positive ? "#d9f8e9" : "#ffe7eb"} stopOpacity="0.68" />
            <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.2" />
            <Stop offset="1" stopColor="#e6efff" stopOpacity="0.42" />
          </LinearGradient>
        </Defs>
        <Rect fill="url(#instrumentWash)" height="100%" rx="34" width="100%" />
      </Svg>
    </View>
  );
}

function IconButton({ children, label, onPress }: { children: ReactNode; label: string; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={12}
      onPress={() => {
        hapticTap();
        onPress?.();
      }}
      style={({ pressed }) => ({
        alignItems: "center",
        height: 42,
        justifyContent: "center",
        opacity: pressed ? 0.58 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
        width: 42,
      })}
    >
      {children}
    </Pressable>
  );
}

const marketActionOptions = [
  { icon: Share2, label: "Share" },
  { icon: Settings, label: "Setting" },
  { icon: Activity, label: "Trend Projection" },
  { icon: BarChart3, label: "Indicators" },
  { icon: PencilLine, label: "Draw" },
] as const;

function InstrumentTopBar({ asset }: { asset: EquityAsset }) {
  const router = useRouter();
  const { isWatchlisted, toggle } = useWatchlistStatus(asset.symbol);
  const starColor = isWatchlisted ? "#f5b301" : colors.ink;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm, position: "relative", zIndex: 20 }}>
      <IconButton label="Back to markets" onPress={() => router.back()}>
        <ChevronLeft color={colors.ink} size={28} strokeWidth={2.5} />
      </IconButton>

      <View style={{ flex: 1 }} />

      <IconButton
        label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          toggle();
        }}
      >
        <Star color={starColor} fill={isWatchlisted ? starColor : "transparent"} size={24} strokeWidth={2.4} />
      </IconButton>
      <IconButton label="More market actions" onPress={() => setMenuOpen((current) => !current)}>
        <Ellipsis color={colors.muted} size={25} strokeWidth={2.5} />
      </IconButton>

      {menuOpen ? (
        <Animated.View
          entering={FadeInUp.duration(160)}
          exiting={FadeOutDown.duration(120)}
          style={{
            ...shadows.card,
            backgroundColor: "rgba(255,255,255,0.94)",
            borderColor: "rgba(255,255,255,0.92)",
            borderRadius: radius.lg,
            borderWidth: 1,
            gap: spacing.xs,
            minWidth: 214,
            padding: spacing.sm,
            position: "absolute",
            right: 0,
            top: 48,
            zIndex: 30,
          }}
        >
          {marketActionOptions.map((option) => {
            const OptionIcon = option.icon;

            return (
              <Pressable
                accessibilityLabel={option.label}
                accessibilityRole="button"
                key={option.label}
                onPress={() => {
                  hapticTap();
                  setMenuOpen(false);
                }}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: pressed ? colors.surfaceAlt : "transparent",
                  borderRadius: radius.md,
                  flexDirection: "row",
                  gap: spacing.md,
                  minHeight: 44,
                  opacity: pressed ? 0.74 : 1,
                  paddingHorizontal: spacing.md,
                })}
              >
                <OptionIcon color={colors.muted} size={18} strokeWidth={2.35} />
                <Text style={{ color: colors.ink, flex: 1, fontSize: 15, fontWeight: "500" }}>{option.label}</Text>
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}

function RangeTabs({ onChange, value }: { onChange: (value: InstrumentChartRange) => void; value: InstrumentChartRange }) {
  return (
    <View style={{ flexDirection: "row", gap: spacing.sm, justifyContent: "space-between", paddingHorizontal: spacing.lg }}>
      {rangeSegments.map((segment) => {
        const active = segment.value === value;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={segment.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(segment.value);
            }}
            style={({ pressed }) => ({
              alignItems: "center",
              flex: 1,
              gap: 7,
              justifyContent: "center",
              minHeight: 40,
              opacity: pressed ? 0.62 : 1,
            })}
          >
            <Text style={{ color: active ? colors.ink : colors.muted, fontSize: 13, fontWeight: "600" }}>{segment.label}</Text>
            <View
              style={{
                backgroundColor: active ? colors.brandAction : "transparent",
                borderRadius: radius.full,
                height: 3,
                width: 24,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function compactNumber(value: number | null, prefix = "") {
  if (value === null) {
    return "N/A";
  }

  return `${prefix}${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value)}`;
}

type TradeSide = "buy" | "sell";
type OrderType = "market" | "limit";

function roundTradeValue(value: number) {
  return Math.round(value * 100) / 100;
}

function formatUnits(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatLedgerEffect(entry: SimulatedLedgerEntry) {
  const sign = entry.amountCents < 0 ? "-" : "+";
  return `Virtual ledger ${sign}${formatCurrency(Math.abs(entry.amountCents) / 100)}`;
}

function clampQuantity(value: number, max: number) {
  if (max <= 0) {
    return 0;
  }

  return roundTradeValue(Math.min(Math.max(value, 0), max));
}

function cleanNumberInput(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  const firstDot = normalized.indexOf(".");
  return firstDot === -1 ? normalized : `${normalized.slice(0, firstDot + 1)}${normalized.slice(firstDot + 1).replace(/\./g, "")}`;
}

function parsePositiveNumber(value: string) {
  const cleaned = cleanNumberInput(value);
  const numericValue = Number(cleaned);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function numericInputValue(value: number, digits = 2) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return value.toFixed(digits);
}

function TradeSegmentButton({
  accent,
  label,
  onPress,
  selected,
}: {
  accent: string;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: selected ? colors.surface : "transparent",
        borderRadius: radius.full,
        boxShadow: selected ? "0 4px 12px rgba(16, 20, 17, 0.1)" : "none",
        flex: 1,
        minHeight: 38,
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: selected ? accent : colors.muted, fontSize: 14, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

function TicketMetric({ label, tone = "neutral", value }: { label: string; tone?: MetricTone; value: string }) {
  const valueColor = tone === "positive" ? colors.positive : tone === "negative" ? colors.negative : colors.ink;

  return (
    <View style={{ alignItems: "center", flex: 1, gap: 4, minWidth: 0 }}>
      <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: "500", textAlign: "center" }}>
        {label}
      </Text>
      <Text
        selectable
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{ color: valueColor, fontSize: 16, fontVariant: ["tabular-nums"], fontWeight: "600", textAlign: "center" }}
      >
        {value}
      </Text>
    </View>
  );
}

function AllocationSlider({
  accent,
  disabled,
  label,
  onChangePercent,
  percent,
}: {
  accent: string;
  disabled?: boolean;
  label: string;
  onChangePercent: (percent: number) => void;
  percent: number;
}) {
  const [trackWidth, setTrackWidth] = useState(1);
  const clampedPercent = Math.min(Math.max(percent, 0), 1);

  function updateFromEvent(event: GestureResponderEvent) {
    if (disabled) {
      return;
    }

    const nextPercent = Math.min(Math.max(event.nativeEvent.locationX / trackWidth, 0), 1);
    onChangePercent(nextPercent);
  }

  return (
    <View style={{ opacity: disabled ? 0.48 : 1 }}>
      <View
        accessibilityLabel={label}
        accessibilityRole="adjustable"
        onLayout={(event) => setTrackWidth(Math.max(event.nativeEvent.layout.width, 1))}
        onMoveShouldSetResponder={() => !disabled}
        onResponderGrant={updateFromEvent}
        onResponderMove={updateFromEvent}
        onStartShouldSetResponder={() => !disabled}
        style={{
          borderRadius: radius.full,
          height: 28,
          justifyContent: "center",
        }}
      >
        <View style={{ backgroundColor: "rgba(5,184,63,0.16)", borderRadius: radius.full, height: 7, overflow: "hidden" }}>
          <View style={{ backgroundColor: accent, borderRadius: radius.full, height: "100%", width: `${clampedPercent * 100}%` }} />
        </View>
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: accent,
            borderRadius: radius.full,
            borderWidth: 3,
            boxShadow: "0 4px 12px rgba(16, 20, 17, 0.14)",
            height: 22,
            left: `${clampedPercent * 100}%`,
            position: "absolute",
            transform: [{ translateX: -11 }],
            width: 22,
          }}
        />
      </View>
    </View>
  );
}

function TradePanel({ asset, holding }: { asset: EquityAsset; holding?: Holding }) {
  const accountSummary = useDemoAccountSummary();
  const initialLimitPrice = roundTradeValue(asset.ask > 0 ? asset.ask : asset.price);
  const priceDigits = initialLimitPrice < 1 ? 4 : 2;
  const [expanded, setExpanded] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [side, setSide] = useState<TradeSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState(numericInputValue(1));
  const [limitPrice, setLimitPrice] = useState(initialLimitPrice);
  const [limitPriceInput, setLimitPriceInput] = useState(numericInputValue(initialLimitPrice, priceDigits));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const expandedProgress = useSharedValue(0);
  const hasPosition = Boolean(holding && holding.units > 0);
  const availableUnits = holding?.units ?? 0;
  const buyPrice = asset.ask > 0 ? asset.ask : asset.price;
  const sellPrice = asset.bid > 0 ? asset.bid : asset.price;
  const marketPrice = side === "buy" ? buyPrice : sellPrice;
  const executionPrice = orderType === "market" ? marketPrice : limitPrice;
  const maxBuyUnits = roundTradeValue(accountSummary.availableCash / Math.max(executionPrice, 0.01));
  const maxQuantity = side === "buy" ? maxBuyUnits : availableUnits;
  const estimatedValue = roundTradeValue(quantity * executionPrice);
  const buyBlocked = side === "buy" && estimatedValue > accountSummary.availableCash;
  const sellBlocked = side === "sell" && (!hasPosition || quantity > availableUnits);
  const canSubmit = quantity > 0 && executionPrice > 0 && !buyBlocked && !sellBlocked;
  const sideAccent = side === "buy" ? colors.brandAction : colors.negative;
  const SubmitIcon = side === "buy" ? TrendingUp : TrendingDown;
  const allocationPercent = maxQuantity > 0 ? quantity / maxQuantity : 0;
  const bubbleOpacity = useSharedValue(0);
  const bubbleScale = useSharedValue(0.92);
  const bubbleY = useSharedValue(-8);

  useEffect(() => {
    expandedProgress.value = withTiming(expanded ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [expanded, expandedProgress]);

  useEffect(() => {
    if (expanded) {
      setPanelVisible(true);
      bubbleOpacity.value = 0;
      bubbleScale.value = 0.92;
      bubbleY.value = -8;
      bubbleOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
      bubbleScale.value = withTiming(1, { duration: 210, easing: Easing.out(Easing.cubic) });
      bubbleY.value = withTiming(0, { duration: 210, easing: Easing.out(Easing.cubic) });
      return;
    }

    bubbleOpacity.value = withTiming(0, { duration: 130, easing: Easing.in(Easing.cubic) });
    bubbleScale.value = withTiming(0.94, { duration: 150, easing: Easing.in(Easing.cubic) });
    bubbleY.value = withTiming(-8, { duration: 150, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(setPanelVisible)(false);
      }
    });
  }, [bubbleOpacity, bubbleScale, bubbleY, expanded]);

  const expandIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${expandedProgress.value * 180}deg` }],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
    transform: [{ translateY: bubbleY.value }, { scale: bubbleScale.value }],
  }));

  useEffect(() => {
    const nextLimitPrice = roundTradeValue(marketPrice);
    setLimitPrice(nextLimitPrice);
    setLimitPriceInput(numericInputValue(nextLimitPrice, priceDigits));
  }, [marketPrice, priceDigits]);

  useEffect(() => {
    if (maxQuantity <= 0 && quantity > 0) {
      setQuantity(0);
      setQuantityInput("");
      return;
    }

    if (maxQuantity > 0 && quantity > maxQuantity) {
      const nextQuantity = clampQuantity(quantity, maxQuantity);
      setQuantity(nextQuantity);
      setQuantityInput(numericInputValue(nextQuantity));
    }
  }, [maxQuantity, quantity]);

  function changeQuantity(nextQuantity: number) {
    const clampedQuantity = clampQuantity(nextQuantity, maxQuantity);
    setQuantity(clampedQuantity);
    setQuantityInput(numericInputValue(clampedQuantity));
    setStatusMessage(null);
  }

  function handleQuantityInput(nextValue: string) {
    const cleaned = cleanNumberInput(nextValue);

    if (!cleaned) {
      setQuantity(0);
      setQuantityInput("");
      setStatusMessage(null);
      return;
    }

    const parsedQuantity = parsePositiveNumber(cleaned);
    const clampedQuantity = clampQuantity(parsedQuantity, maxQuantity);
    setQuantity(clampedQuantity);
    setQuantityInput(parsedQuantity > clampedQuantity ? numericInputValue(clampedQuantity) : cleaned);
    setStatusMessage(null);
  }

  function finishQuantityInput() {
    setQuantityInput(numericInputValue(quantity));
  }

  function handleLimitPriceInput(nextValue: string) {
    const cleaned = cleanNumberInput(nextValue);

    if (!cleaned) {
      setLimitPrice(0);
      setLimitPriceInput("");
      setStatusMessage(null);
      return;
    }

    const parsedPrice = Math.max(parsePositiveNumber(cleaned), 0);
    setLimitPrice(roundTradeValue(parsedPrice));
    setLimitPriceInput(cleaned);
    setStatusMessage(null);
  }

  function finishLimitPriceInput() {
    const normalizedPrice = roundTradeValue(Math.max(limitPrice, 0));
    setLimitPrice(normalizedPrice);
    setLimitPriceInput(numericInputValue(normalizedPrice, priceDigits));
  }

  function submitOrder() {
    if (!canSubmit) {
      return;
    }

    if (side === "buy") {
      const tradeResult = buyPortfolioAsset({ ...asset, ask: executionPrice }, quantity);
      if (!tradeResult) {
        setStatusMessage(`Order rejected · ${formatCurrency(estimatedValue)} exceeds available cash`);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setStatusMessage(
        `Simulated buy filled · ${asset.symbol} ${formatUnits(quantity)} units · ${formatCurrency(tradeResult.fillNotional)} · ${formatLedgerEffect(tradeResult.ledgerEntry)}`,
      );
      setQuantity(1);
      setQuantityInput(numericInputValue(1));
      setExpanded(false);
      return;
    }

    const tradeResult = sellPortfolioAsset(asset.symbol, quantity, executionPrice);

    if (!tradeResult) {
      setStatusMessage(`Order rejected · ${asset.symbol} position is unavailable`);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setStatusMessage(
      tradeResult.holding
        ? `Simulated sell filled · ${asset.symbol} ${formatUnits(quantity)} units · ${formatCurrency(tradeResult.fillNotional)} · ${formatLedgerEffect(tradeResult.ledgerEntry)}`
        : `Simulated position closed · ${asset.symbol} · ${formatCurrency(tradeResult.fillNotional)} · ${formatLedgerEffect(tradeResult.ledgerEntry)}`,
    );
    setQuantity(1);
    setQuantityInput(numericInputValue(1));
    setExpanded(false);
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(70).duration(460).springify()}
      style={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
    >
      <Pressable
        accessibilityLabel={expanded ? "Hide trade choices" : "Open trade choices"}
        accessibilityRole="button"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          setExpanded((current) => !current);
        }}
        style={({ pressed }) => ({
          ...shadows.card,
          alignItems: "center",
          backgroundColor: colors.brandAction,
          borderRadius: radius.full,
          flexDirection: "row",
          gap: spacing.sm,
          justifyContent: "space-between",
          minHeight: 60,
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: spacing.lg,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
        <View style={{ alignItems: "center", flex: 1, flexDirection: "row", gap: spacing.sm, justifyContent: "center", minWidth: 0 }}>
          <Text style={{ color: colors.inverse, fontSize: 19, fontWeight: "600" }}>Trade</Text>
          <Text numberOfLines={1} style={{ color: "rgba(255,255,255,0.78)", flexShrink: 1, fontSize: 13, fontVariant: ["tabular-nums"], fontWeight: "500" }}>
            {hasPosition ? `${formatUnits(availableUnits)} units held` : `Bid ${formatPrice(asset.bid)} · Ask ${formatPrice(asset.ask)}`}
          </Text>
        </View>
        <Animated.View style={expandIconStyle}>
          <ChevronDown color={colors.inverse} size={22} strokeWidth={2.6} />
        </Animated.View>
      </Pressable>

      {panelVisible ? (
        <Animated.View style={[{ gap: spacing.sm, paddingTop: 8, transformOrigin: "top center" } as never, bubbleStyle]}>
          <View
            style={{
              ...shadows.card,
              backgroundColor: "rgba(255,255,255,0.94)",
              borderColor: "rgba(255,255,255,0.94)",
              borderRadius: 28,
              borderWidth: 1,
              boxShadow: "0 18px 52px rgba(8, 11, 18, 0.18), inset 0 1px 0 rgba(255,255,255,0.92)",
              gap: spacing.md,
              overflow: "visible",
              padding: spacing.md,
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.94)",
                borderColor: "rgba(255,255,255,0.94)",
                borderLeftWidth: 1,
                borderTopWidth: 1,
                height: 16,
                left: "50%",
                marginLeft: -8,
                position: "absolute",
                top: -8,
                transform: [{ rotate: "45deg" }],
                width: 16,
              }}
            />
            <View
              style={{
                backgroundColor: "rgba(241,243,239,0.9)",
                borderRadius: radius.full,
                flexDirection: "row",
                gap: 3,
                padding: 3,
              }}
            >
              <TradeSegmentButton
                accent={colors.brandAction}
                label="Buy"
                onPress={() => {
                  setSide("buy");
                  setStatusMessage(null);
                }}
                selected={side === "buy"}
              />
              <TradeSegmentButton
                accent={colors.negative}
                label="Sell"
                onPress={() => {
                  setSide("sell");
                  setStatusMessage(null);
                }}
                selected={side === "sell"}
              />
            </View>

            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <TradeSegmentButton
                accent={sideAccent}
                label="Market"
                onPress={() => setOrderType("market")}
                selected={orderType === "market"}
              />
              <TradeSegmentButton
                accent={sideAccent}
                label="Limit"
                onPress={() => setOrderType("limit")}
                selected={orderType === "limit"}
              />
            </View>

            <View style={{ alignItems: "center", gap: spacing.sm }}>
              <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "600", textAlign: "center", textTransform: "uppercase" }}>
                Quantity
              </Text>
              <TextInput
                accessibilityLabel="Order quantity"
                inputMode="decimal"
                keyboardType="decimal-pad"
                onBlur={finishQuantityInput}
                onChangeText={handleQuantityInput}
                placeholder="0.00"
                placeholderTextColor={colors.subtle}
                selectTextOnFocus
                style={{
                  backgroundColor: "transparent",
                  borderWidth: 0,
                  color: colors.ink,
                  fontSize: 32,
                  fontVariant: ["tabular-nums"],
                  fontWeight: "500",
                  minHeight: 64,
                  paddingHorizontal: spacing.md,
                  textAlign: "center",
                  width: "100%",
                }}
                value={quantityInput}
              />
              <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "500", textAlign: "center" }}>
                {side === "sell" ? `${formatUnits(availableUnits)} available` : `${formatUnits(maxBuyUnits)} max by available cash`}
              </Text>
              <View style={{ alignSelf: "stretch" }}>
              <AllocationSlider
                accent={sideAccent}
                disabled={maxQuantity <= 0}
                label={side === "buy" ? "Use available cash" : "Sell position"}
                onChangePercent={(nextPercent) => changeQuantity(maxQuantity * nextPercent)}
                percent={allocationPercent}
              />
              </View>
            </View>

            {orderType === "limit" ? (
              <View style={{ alignItems: "center", gap: spacing.sm }}>
                <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "600", textAlign: "center", textTransform: "uppercase" }}>
                  Limit Price
                </Text>
                <TextInput
                  accessibilityLabel="Limit price"
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  onBlur={finishLimitPriceInput}
                  onChangeText={handleLimitPriceInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.subtle}
                  selectTextOnFocus
                  style={{
                    backgroundColor: "transparent",
                    borderWidth: 0,
                    color: colors.ink,
                    fontSize: 30,
                    fontVariant: ["tabular-nums"],
                    fontWeight: "500",
                    minHeight: 62,
                    paddingHorizontal: spacing.md,
                    textAlign: "center",
                    width: "100%",
                  }}
                  value={limitPriceInput}
                />
              </View>
            ) : null}

            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <TicketMetric label="Est. value" value={formatCurrency(estimatedValue)} />
              <TicketMetric label={side === "buy" ? "Available cash" : "Position"} value={side === "buy" ? formatCurrency(accountSummary.availableCash) : `${formatUnits(availableUnits)} units`} />
            </View>
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <TicketMetric label="Execution" value={orderType === "market" ? "Market" : "Limit"} />
              <TicketMetric label="Price" value={`$${formatPrice(executionPrice)}`} />
            </View>

            {!canSubmit ? (
              <Text selectable style={{ color: colors.negative, fontSize: 12, fontWeight: "500", lineHeight: 17 }}>
                {buyBlocked
                  ? "Estimated value is above available cash."
                  : side === "sell"
                    ? "Sell is unavailable because this asset is not held in the portfolio."
                    : "Enter a valid order size."}
              </Text>
            ) : null}

            <Pressable
              accessibilityLabel={`Place ${side} order`}
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={submitOrder}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: canSubmit ? sideAccent : colors.surfaceAlt,
                borderRadius: radius.full,
                flexDirection: "row",
                gap: spacing.sm,
                justifyContent: "center",
                minHeight: 54,
                opacity: pressed ? 0.72 : canSubmit ? 1 : 0.62,
              })}
            >
              <SubmitIcon color={canSubmit ? colors.inverse : colors.muted} size={20} strokeWidth={2.6} />
              <Text style={{ color: canSubmit ? colors.inverse : colors.muted, fontSize: 17, fontWeight: "600" }}>
                Place {side === "buy" ? "Buy" : "Sell"} Order
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}

      {statusMessage ? (
        <Animated.View entering={FadeInUp.duration(180)} exiting={FadeOutDown.duration(140)}>
          <Text selectable style={{ color: colors.brandAction, fontSize: 13, fontWeight: "600", textAlign: "center" }}>
            {statusMessage}
          </Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function metricValue(value: number | null, suffix = "", digits = 2) {
  if (value === null) {
    return "N/A";
  }

  return `${value.toFixed(digits)}${suffix}`;
}

function priceMetric(value: number) {
  return `$${formatPrice(value)}`;
}

function getMetrics(asset: EquityAsset, liveValues: number[], metrics: AssetMetrics | undefined) {
  const spread = asset.ask - asset.bid;
  const sessionHigh = Math.max(...liveValues);
  const sessionLow = Math.min(...liveValues);
  const movementTone: MetricTone = asset.change >= 0 ? "positive" : "negative";

  return [
    [
      { label: "Spread", value: spread.toFixed(asset.price < 1 ? 4 : 2), tone: "neutral" as const },
      { label: "Today", value: formatSignedCurrency(asset.change), tone: movementTone },
      { label: "High", value: priceMetric(sessionHigh), tone: "neutral" as const },
    ],
    [
      { label: "Low", value: priceMetric(sessionLow), tone: "neutral" as const },
      { label: "P/E", value: metricValue(metrics?.peRatio ?? null, "", 1), tone: "neutral" as const },
      { label: "Market Cap", value: compactNumber(metrics?.marketCap ?? null, "$"), tone: "neutral" as const },
    ],
    [
      { label: "52 Week High", value: metrics ? priceMetric(metrics.week52High) : "N/A", tone: "neutral" as const },
      { label: "52 Week Low", value: metrics ? priceMetric(metrics.week52Low) : "N/A", tone: "neutral" as const },
      { label: "Average Volume", value: compactNumber(metrics?.averageVolume ?? null), tone: "neutral" as const },
    ],
    [
      { label: "Yield", value: metricValue(metrics?.yieldPercent ?? null, "%", 2), tone: "neutral" as const },
      { label: "Beta", value: metricValue(metrics?.beta ?? null, "", 2), tone: "neutral" as const },
      { label: "EPS", value: metrics?.eps === null || metrics?.eps === undefined ? "N/A" : formatCurrency(metrics.eps), tone: "neutral" as const },
    ],
  ];
}

function MetricsCarousel({
  columns,
}: {
  columns: Array<Array<{ label: string; value: string; tone: MetricTone }>>;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl, paddingHorizontal: spacing.lg }}>
      {columns.map((column, index) => (
        <View key={index} style={{ gap: spacing.lg, width: 156 }}>
          {column.map((item) => {
            const valueColor = item.tone === "positive" ? colors.positive : item.tone === "negative" ? colors.negative : colors.ink;

            return (
              <View key={item.label} style={{ gap: 4 }}>
                <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 13, fontWeight: "500" }}>
                  {item.label}
                </Text>
                <Text
                  selectable
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{ color: valueColor, fontSize: 19, fontVariant: ["tabular-nums"], fontWeight: "600" }}
                >
                  {item.value}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

export default function InstrumentDetailScreen() {
  const params = useLocalSearchParams<{ symbol?: string }>();
  const { width } = useAppViewportDimensions();
  const symbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
  const baseAsset = symbol ? getAssetBySymbol(symbol) : undefined;
  const sourceAssets = useMemo(() => (baseAsset ? [baseAsset] : []), [baseAsset]);
  const live = useLiveAssets(sourceAssets, { count: 1, intervalMs: 1800, scale: 0.0014 });
  const asset = live.assets[0];
  const [range, setRange] = useState<InstrumentChartRange>("1D");
  const holding = usePortfolioHolding(asset?.symbol);

  const values = useMemo(() => {
    if (!asset) {
      return [];
    }

    const kind = assetKind(asset);
    const profile = instrumentRangeProfiles[range][kind];
    const lastOffset = profile[profile.length - 1] ?? 0;
    return profile.map((offset) => Math.max(asset.price * (1 + (offset - lastOffset) / 100), asset.price < 1 ? 0.0001 : 0.01));
  }, [asset, range]);

  const chartData = useMemo<SparklineDatum[]>(() => {
    if (!asset) {
      return [];
    }

    return values.map((value, index) => {
      const date = getInstrumentChartDate(index, values.length, range);
      return {
        dateLabel: instrumentDateFormatter.format(date),
        timeLabel: instrumentTimeFormatter.format(date),
        valueLabel: `$${formatPrice(value)}`,
      };
    });
  }, [asset, range, values]);

  if (!asset) {
    return (
      <ScreenScroll includeTopInset>
        <Stack.Screen options={{ headerShown: false }} />
        <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: "600" }}>
          Market unavailable
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 15, fontWeight: "500", lineHeight: 22 }}>
          This symbol is not part of the local demo market data.
        </Text>
      </ScreenScroll>
    );
  }

  const positive = asset.changePercent >= 0;
  const movementColor = positive ? colors.positive : colors.negative;
  const kind = assetKind(asset);
  const chartHeight = width >= 768 ? 300 : 260;
  const metrics = getMetrics(asset, values, getAssetMetrics(asset.symbol));
  const marketStatus = kind === "crypto" ? "24h market" : "Open";
  const chartMovementColor = (values[values.length - 1] ?? asset.price) >= (values[0] ?? asset.price) ? colors.positive : colors.negative;

  return (
    <ScreenScroll includeTopInset bottomInset={118} maxContentWidth={720}>
      <Stack.Screen options={{ headerShown: false, title: asset.symbol }} />
      <InstrumentBackdrop positive={positive} />

      <InstrumentTopBar asset={asset} />

      <Link.AppleZoomTarget>
        <Animated.View entering={FadeInUp.duration(520).springify()} style={{ gap: spacing.lg }}>
          <View style={{ gap: spacing.md, paddingHorizontal: spacing.lg }}>
            <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
              <AssetLogo background={asset.logoBackground} color={asset.logoColor} label={asset.logoLabel} size={58} />
              <View style={{ flex: 1, justifyContent: "center", minWidth: 0 }}>
                <View style={{ alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                  <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 36, fontWeight: "600", letterSpacing: 0 }}>
                    {asset.symbol}
                  </Text>
                  <Text
                    selectable
                    style={{ color: kind === "crypto" ? colors.purple : colors.brandAction, fontSize: 13, fontWeight: "600" }}
                  >
                    {kind === "crypto" ? "CRYPTO" : "STOCK"}
                  </Text>
                </View>
                <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 16, fontWeight: "500", marginTop: 2 }}>
                  {asset.name}
                </Text>
              </View>
            </View>

            <View style={{ alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              <Text selectable style={{ color: colors.ink, fontSize: 36, fontVariant: ["tabular-nums"], fontWeight: "600", letterSpacing: 0 }}>
                {formatPrice(asset.price)}
              </Text>
              <Text selectable style={{ color: movementColor, fontSize: 16, fontVariant: ["tabular-nums"], fontWeight: "600" }}>
                {formatSignedCurrency(asset.change)} ({formatPercent(asset.changePercent)})
              </Text>
            </View>

            <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
              <Text selectable style={{ color: colors.muted, fontSize: 14, fontWeight: "600" }}>
                Price movement
              </Text>
              <Text selectable style={{ color: colors.muted, fontSize: 14, fontWeight: "500" }}>
                {marketStatus}
              </Text>
            </View>
          </View>

          <Animated.View
            style={{
              alignSelf: "center",
              justifyContent: "center",
              marginHorizontal: -spacing.lg,
              overflow: "hidden",
              width,
            }}
          >
            <Sparkline
              color={chartMovementColor}
              data={chartData}
              fillArea
              height={chartHeight}
              interactive
              showDot
              showGuide={false}
              values={values}
              width={width}
            />
          </Animated.View>

          <RangeTabs value={range} onChange={setRange} />
        </Animated.View>
      </Link.AppleZoomTarget>

      <TradePanel asset={asset} holding={holding} />

      <Animated.View entering={FadeInUp.delay(120).duration(460).springify()} style={{ gap: spacing.md }}>
        <MetricsCarousel columns={metrics} />
      </Animated.View>
    </ScreenScroll>
  );
}
