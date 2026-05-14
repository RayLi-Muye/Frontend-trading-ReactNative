import { useMemo, useState } from "react";
import { RefreshControl, Text, View } from "react-native";

import { InstrumentRow } from "@/components/instrument-row";
import { MarketHero } from "@/components/market-hero";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { SegmentedControl } from "@/components/segmented-control";
import { StatTile } from "@/components/stat-tile";
import { categories, instruments, marketSummary, type MarketCategory } from "@/data/instruments";
import { colors, spacing } from "@/design/theme";
import { formatPercent } from "@/utils/format";

type CategoryFilter = "all" | MarketCategory;

const categorySegments: Array<{ label: string; value: CategoryFilter }> = [
  { label: "All", value: "all" },
  ...categories.map((category) => ({
    label: category.label,
    value: category.value,
  })),
];

export default function MarketsScreen() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const filteredInstruments = useMemo(() => {
    if (category === "all") {
      return instruments;
    }

    return instruments.filter((instrument) => instrument.category === category);
  }, [category]);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }

  return (
    <ScreenScroll
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={colors.brand}
          onRefresh={handleRefresh}
        />
      }
    >
      <MarketHero />

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <StatTile label="Watchlist move" value={formatPercent(marketSummary.watchlistMove)} tone="positive" />
        <StatTile label="Volatility" value={marketSummary.volatility} tone="neutral" />
      </View>

      <SegmentedControl value={category} segments={categorySegments} onChange={setCategory} />

      <View style={{ gap: spacing.sm }}>
        <SectionHeader eyebrow="Mock market data" title="Top instruments" />
        <Text selectable style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>
          Prices, spreads, leverage, and movement are deterministic demo data for UI review only.
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        {filteredInstruments.map((instrument) => (
          <InstrumentRow key={instrument.symbol} instrument={instrument} />
        ))}
      </View>
    </ScreenScroll>
  );
}
