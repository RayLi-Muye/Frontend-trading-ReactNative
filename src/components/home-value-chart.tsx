import * as Haptics from "expo-haptics";
import { Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { accountSummary, homeCurve } from "@/data/portfolio";
import { colors, radius, spacing } from "@/design/theme";
import { formatCurrency, formatPercent, formatSignedCurrency } from "@/utils/format";

import { GlassSurface } from "./glass-surface";
import { Sparkline } from "./sparkline";

type RangeScale = "hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

const RANGE_OPTIONS: { label: string; value: RangeScale }[] = [
  { label: "1H", value: "hourly" },
  { label: "1D", value: "daily" },
  { label: "1W", value: "weekly" },
  { label: "1M", value: "monthly" },
  { label: "1Q", value: "quarterly" },
  { label: "1Y", value: "yearly" },
];

const RANGE_META: Record<RangeScale, { multiplier: number; slope: number }> = {
  hourly: { multiplier: 0.28, slope: 0.03 },
  daily: { multiplier: 1, slope: 0.08 },
  weekly: { multiplier: 1.35, slope: 0.14 },
  monthly: { multiplier: 1.75, slope: 0.2 },
  quarterly: { multiplier: 2.2, slope: 0.28 },
  yearly: { multiplier: 2.85, slope: 0.34 },
};

function AccountMetric({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ flex: 1, gap: spacing.xs, minWidth: 0 }}>
      <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: "800" }}>
        {label}
      </Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={{ color: colors.ink, fontSize: 17, fontVariant: ["tabular-nums"], fontWeight: "900" }}
      >
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

function TimeSlotControl({
  onChange,
  value,
}: {
  onChange: (value: RangeScale) => void;
  value: RangeScale;
}) {
  const [trackWidth, setTrackWidth] = useState(1);
  const activeIndex = Math.max(
    0,
    RANGE_OPTIONS.findIndex((option) => option.value === value),
  );
  const pillX = useSharedValue(0);
  const slotWidth = Math.max((trackWidth - 8) / RANGE_OPTIONS.length, 1);

  useEffect(() => {
    pillX.value = withSpring(activeIndex * slotWidth, {
      damping: 20,
      mass: 0.75,
      stiffness: 260,
    });
  }, [activeIndex, pillX, slotWidth]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: slotWidth,
  }));

  return (
    <View
      onLayout={(event) => setTrackWidth(Math.max(event.nativeEvent.layout.width, 1))}
      style={{
        backgroundColor: "rgba(255,255,255,0.42)",
        borderColor: "rgba(255,255,255,0.72)",
        borderRadius: radius.full,
        borderWidth: 1,
        flexDirection: "row",
        height: 46,
        overflow: "hidden",
        padding: 4,
      }}
    >
      <Animated.View
        style={[
          {
            backgroundColor: colors.surface,
            borderColor: "rgba(5,184,63,0.18)",
            borderRadius: radius.full,
            borderWidth: 1,
            bottom: 4,
            boxShadow: "0 8px 22px rgba(5, 184, 63, 0.16)",
            left: 4,
            position: "absolute",
            top: 4,
          },
          pillStyle,
        ]}
      />
      {RANGE_OPTIONS.map((option, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            accessibilityLabel={`Set chart range to ${option.label}`}
            accessibilityRole="button"
            key={option.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(option.value);
            }}
            style={{
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <Text style={{ color: isActive ? colors.ink : colors.muted, fontSize: 13, fontWeight: "900" }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function HomeValueChart() {
  const { width } = useWindowDimensions();
  const isPad = width >= 768;
  const [range, setRange] = useState<RangeScale>("daily");
  const [curve, setCurve] = useState(homeCurve);
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const tickRef = useRef(0);
  const chartHeightValue = useSharedValue(isPad ? 181 : 150);
  const expandedProgress = useSharedValue(0);
  const activeRange = RANGE_META[range];

  useEffect(() => {
    const timer = setInterval(() => {
      tickRef.current += 1;
      setCurve((currentCurve) => {
        const last = currentCurve[currentCurve.length - 1] ?? 62;
        const delta = Math.sin(tickRef.current * 1.43) * 0.9 + 0.22;
        return [...currentCurve.slice(1), Math.max(last + delta, 34)];
      });
    }, 3400);

    return () => clearInterval(timer);
  }, []);

  const liveValue = useMemo(() => {
    const startingPoint = homeCurve[homeCurve.length - 1] ?? 62;
    const currentPoint = curve[curve.length - 1] ?? startingPoint;
    return accountSummary.totalValue + (currentPoint - startingPoint) * 18;
  }, [curve]);

  const rangeCurve = useMemo(() => {
    const base = homeCurve[0] ?? 38;
    return curve.map((point, index) => base + (point - base) * activeRange.multiplier + index * activeRange.slope);
  }, [activeRange.multiplier, activeRange.slope, curve]);

  const scaledChange = accountSummary.totalChange * activeRange.multiplier;
  const scaledPercent = accountSummary.totalChangePercent * activeRange.multiplier;
  const movementColor = scaledChange >= 0 ? colors.positive : colors.negative;
  const collapsedChartHeight = isPad ? 181 : 150;
  const expandedChartHeight = isPad ? 210 : 174;
  const chartHeight = expanded ? expandedChartHeight : collapsedChartHeight;
  const expandedPanelHeight = isPad ? 126 : 122;

  useEffect(() => {
    chartHeightValue.value = withTiming(expanded ? expandedChartHeight : collapsedChartHeight, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    });
    expandedProgress.value = withTiming(expanded ? 1 : 0, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [chartHeightValue, collapsedChartHeight, expanded, expandedChartHeight, expandedProgress]);

  const chartAnimatedStyle = useAnimatedStyle(() => ({
    height: chartHeightValue.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + expandedProgress.value * 0.28,
    transform: [{ rotate: `${expandedProgress.value * -90}deg` }, { scale: 1 + expandedProgress.value * 0.04 }],
  }));

  const expandedPanelStyle = useAnimatedStyle(() => ({
    height: expandedProgress.value * expandedPanelHeight,
    opacity: expandedProgress.value,
  }));

  const expandedPanelInnerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - expandedProgress.value) * -8 }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(560).springify()}
      layout={LinearTransition.duration(300)}
      style={{ gap: spacing.md, marginHorizontal: -spacing.lg }}
    >
      <View style={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text selectable numberOfLines={1} style={{ color: colors.brandAction, fontSize: isPad ? 28 : 25, fontWeight: "900" }}>
              Cash and Holding
            </Text>
          </View>

          <Pressable
            accessibilityLabel={expanded ? "Collapse cash and holding" : "Expand cash and holding"}
            accessibilityRole="button"
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setExpanded((current) => !current);
            }}
            style={({ pressed }) => ({
              alignItems: "center",
              height: 34,
              justifyContent: "center",
              opacity: pressed ? 0.58 : 1,
              width: 34,
            })}
          >
            <Animated.View style={iconAnimatedStyle}>
              {expanded ? (
                <Minimize2 color={colors.muted} size={20} strokeWidth={2.2} />
              ) : (
                <Maximize2 color={colors.muted} size={20} strokeWidth={2.2} />
              )}
            </Animated.View>
          </Pressable>
        </View>

        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" }}>
          <View style={{ alignItems: "center", flex: 1, flexDirection: "row", gap: spacing.xs, minWidth: 0 }}>
            <Text
              selectable
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                color: colors.ink,
                flexShrink: 1,
                fontSize: isPad ? 48 : 31,
                fontVariant: ["tabular-nums"],
                fontWeight: "900",
                letterSpacing: 0,
              }}
            >
              {hidden ? "$********" : formatCurrency(liveValue)}
            </Text>
            <Pressable
              accessibilityLabel={hidden ? "Show cash amount" : "Hide cash amount"}
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setHidden((current) => !current);
              }}
            >
              {hidden ? (
                <EyeOff color={colors.muted} size={21} strokeWidth={2.3} />
              ) : (
                <Eye color={colors.muted} size={21} strokeWidth={2.3} />
              )}
            </Pressable>
          </View>

          <Text
            selectable
            numberOfLines={1}
            style={{ color: movementColor, fontSize: isPad ? 16 : 12, fontVariant: ["tabular-nums"], fontWeight: "900" }}
          >
            {formatSignedCurrency(scaledChange)} ({formatPercent(scaledPercent)})
          </Text>
        </View>
      </View>

      <Animated.View
        style={[
          {
            justifyContent: "center",
            overflow: "hidden",
            width,
          },
          chartAnimatedStyle,
        ]}
      >
        <Sparkline
          color={colors.brandAction}
          fillArea
          height={chartHeight}
          showDot={false}
          showGuide={false}
          values={rangeCurve}
          width={width}
        />
      </Animated.View>

      <Animated.View
        style={[
          {
            overflow: "hidden",
            paddingHorizontal: spacing.lg,
            pointerEvents: expanded ? "auto" : "none",
          },
          expandedPanelStyle,
        ]}
      >
        <Animated.View layout={LinearTransition.duration(240)} style={[{ gap: spacing.md }, expandedPanelInnerStyle]}>
          <TimeSlotControl onChange={setRange} value={range} />

          <GlassSurface
            intensity={82}
            tintColor="rgba(255,255,255,0.34)"
            style={{
              backgroundColor: "rgba(255,255,255,0.34)",
              borderColor: "rgba(255,255,255,0.62)",
              borderRadius: radius.lg,
              borderWidth: 1,
              flexDirection: "row",
              gap: spacing.lg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}
          >
            <AccountMetric label="Invested" value={accountSummary.investmentValue} />
            <AccountMetric label="Available" value={accountSummary.availableCash} />
          </GlassSurface>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
