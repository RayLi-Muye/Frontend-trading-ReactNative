import { Link } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { Instrument } from "@/data/instruments";
import { colors, radius, shadows, spacing } from "@/design/theme";
import { formatPercent, formatPrice } from "@/utils/format";

import { Sparkline } from "./sparkline";

type InstrumentRowProps = {
  instrument: Instrument;
  compact?: boolean;
};

export function InstrumentRow({ instrument, compact }: InstrumentRowProps) {
  const positive = instrument.changePercent >= 0;
  const movementColor = positive ? colors.positive : colors.negative;

  return (
    <Link
      href={{
        pathname: "/instrument/[symbol]",
        params: { symbol: instrument.symbol },
      }}
      asChild
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${instrument.symbol} details`}
        style={({ pressed }) => ({
          ...shadows.card,
          backgroundColor: colors.surface,
          borderColor: pressed ? colors.brand : colors.line,
          borderRadius: radius.md,
          borderWidth: 1,
          flexDirection: "row",
          gap: spacing.md,
          minHeight: compact ? 94 : 112,
          opacity: pressed ? 0.84 : 1,
          padding: spacing.md,
        })}
      >
        <View style={{ flex: 1, gap: spacing.sm, minWidth: 0 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
            <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
              <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "900", letterSpacing: 0 }}>
                {instrument.symbol}
              </Text>
              <Text numberOfLines={1} selectable style={{ color: colors.muted, fontSize: 13 }}>
                {instrument.displayName}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end", gap: 2 }}>
              <Text selectable style={{ color: colors.ink, fontSize: 17, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
                {formatPrice(instrument.price)}
              </Text>
              <Text selectable style={{ color: movementColor, fontSize: 13, fontVariant: ["tabular-nums"], fontWeight: "800" }}>
                {formatPercent(instrument.changePercent)}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Sparkline values={instrument.sparkline} color={movementColor} />
            </View>
            <View style={{ alignItems: "flex-end", gap: 2, width: 66 }}>
              <Text selectable style={{ color: colors.subtle, fontSize: 11, fontWeight: "700" }}>
                RAW
              </Text>
              <Text selectable style={{ color: colors.ink, fontSize: 13, fontVariant: ["tabular-nums"], fontWeight: "800" }}>
                {instrument.spreadRaw.toFixed(1)}
              </Text>
            </View>
            <ChevronRight color={colors.subtle} size={18} strokeWidth={2.4} />
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
