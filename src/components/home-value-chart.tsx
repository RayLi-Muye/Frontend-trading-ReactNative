import { Eye, ScanLine } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";

import { accountSummary, homeCurve } from "@/data/portfolio";
import { colors, spacing } from "@/design/theme";
import { formatCurrency, formatPercent, formatSignedCurrency } from "@/utils/format";

import { Sparkline } from "./sparkline";

export function HomeValueChart() {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width, 520);
  const [curve, setCurve] = useState(homeCurve);
  const tickRef = useRef(0);

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

  return (
    <Animated.View entering={FadeInUp.duration(560).springify()} layout={LinearTransition.duration(300)} style={{ gap: spacing.xl, marginHorizontal: -spacing.lg }}>
      <View style={{ gap: spacing.md, paddingHorizontal: spacing.lg }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text selectable style={{ color: colors.ink, fontSize: 26, fontWeight: "900", lineHeight: 31 }}>
              Welcome back!{"\n"}Cash and holdings
            </Text>
            <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
              <Text
                selectable
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ color: colors.ink, fontSize: 48, fontVariant: ["tabular-nums"], fontWeight: "900", letterSpacing: 0 }}
              >
                {formatCurrency(liveValue)}
              </Text>
              <Eye color={colors.muted} size={22} strokeWidth={2.3} />
            </View>
            <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
              <Text selectable style={{ color: colors.negative, fontSize: 18, fontVariant: ["tabular-nums"], fontWeight: "700" }}>
                {formatSignedCurrency(accountSummary.totalChange)} ({formatPercent(accountSummary.totalChangePercent)})
              </Text>
              <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>
                Today
              </Text>
            </View>
          </View>

          <View
            style={{
              alignItems: "center",
              borderColor: colors.line,
              borderRadius: 10,
              borderWidth: 1,
              height: 38,
              justifyContent: "center",
              marginTop: 42,
              width: 38,
            }}
          >
            <ScanLine color={colors.muted} size={22} strokeWidth={2.1} />
          </View>
        </View>
      </View>

      <View style={{ height: 210, width: "100%" }}>
        <Sparkline
          values={curve}
          color={colors.brandAction}
          fillArea
          height={210}
          width={chartWidth}
          showDot={false}
          showGuide={false}
        />
      </View>
    </Animated.View>
  );
}
