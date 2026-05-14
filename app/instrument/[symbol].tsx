import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { SegmentedControl } from "@/components/segmented-control";
import { Sparkline } from "@/components/sparkline";
import { StatTile } from "@/components/stat-tile";
import { getInstrumentBySymbol } from "@/data/instruments";
import { colors, radius, spacing } from "@/design/theme";
import { formatPercent, formatPrice } from "@/utils/format";

type Range = "1D" | "1W" | "1M" | "3M";

const rangeSegments: Array<{ label: string; value: Range }> = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
];

export default function InstrumentDetailScreen() {
  const params = useLocalSearchParams<{ symbol?: string }>();
  const symbol = Array.isArray(params.symbol) ? params.symbol[0] : params.symbol;
  const instrument = symbol ? getInstrumentBySymbol(symbol) : undefined;
  const [range, setRange] = useState<Range>("1D");

  const values = useMemo(() => {
    if (!instrument) {
      return [];
    }

    const multiplier = range === "1D" ? 1 : range === "1W" ? 1.035 : range === "1M" ? 0.965 : 1.08;
    return instrument.sparkline.map((value, index) => value * multiplier + index * 0.03);
  }, [instrument, range]);

  if (!instrument) {
    return (
      <ScreenScroll>
        <Stack.Screen options={{ title: "Instrument" }} />
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>
          Instrument unavailable
        </Text>
      </ScreenScroll>
    );
  }

  const positive = instrument.changePercent >= 0;
  const movementColor = positive ? colors.positive : colors.negative;

  return (
    <ScreenScroll>
      <Stack.Screen options={{ title: instrument.symbol }} />

      <View
        style={{
          backgroundColor: colors.ink,
          borderRadius: radius.md,
          gap: spacing.lg,
          padding: spacing.lg,
        }}
      >
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ color: colors.inverseMuted, fontSize: 13, fontWeight: "700" }}>
            {instrument.categoryLabel}
          </Text>
          <Text selectable style={{ color: colors.inverse, fontSize: 34, fontWeight: "900", letterSpacing: 0 }}>
            {instrument.symbol}
          </Text>
          <Text selectable style={{ color: colors.inverseMuted, fontSize: 15 }}>
            {instrument.displayName}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <Text selectable style={{ color: colors.inverseMuted, fontSize: 12, fontWeight: "700" }}>
              MOCK PRICE
            </Text>
            <Text selectable style={{ color: colors.inverse, fontSize: 26, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
              {formatPrice(instrument.price)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
            <Text selectable style={{ color: colors.inverseMuted, fontSize: 12, fontWeight: "700" }}>
              MOVE
            </Text>
            <Text selectable style={{ color: movementColor, fontSize: 20, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
              {formatPercent(instrument.changePercent)}
            </Text>
          </View>
        </View>

        <Sparkline values={values} color={movementColor} height={164} variant="dark" />
      </View>

      <SegmentedControl value={range} segments={rangeSegments} onChange={setRange} />

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <StatTile label="Raw spread" value={instrument.spreadRaw.toFixed(1)} />
        <StatTile label="Standard" value={instrument.spreadStandard.toFixed(1)} />
      </View>

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <StatTile label="Leverage" value={instrument.leverage} />
        <StatTile label="Status" value={instrument.marketStatus} tone={instrument.marketStatus === "open" ? "positive" : "warning"} />
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.line,
          borderRadius: radius.md,
          borderWidth: 1,
          gap: spacing.md,
          padding: spacing.lg,
        }}
      >
        <SectionHeader eyebrow="Mock insight" title={instrument.insightTitle} />
        <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
          {instrument.insightBody}
        </Text>
        <Text selectable style={{ color: colors.warningDark, fontSize: 12, lineHeight: 18 }}>
          Demo only. This screen does not provide financial advice or live market prices.
        </Text>
      </View>
    </ScreenScroll>
  );
}
