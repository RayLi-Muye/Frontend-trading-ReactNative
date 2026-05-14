import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import { InstrumentRow } from "@/components/instrument-row";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { SegmentedControl } from "@/components/segmented-control";
import { StatTile } from "@/components/stat-tile";
import { instruments, watchlistSymbols } from "@/data/instruments";
import { colors, radius, spacing } from "@/design/theme";

type SortMode = "move" | "spread" | "name";

const sortSegments: Array<{ label: string; value: SortMode }> = [
  { label: "Move", value: "move" },
  { label: "Spread", value: "spread" },
  { label: "Name", value: "name" },
];

export default function WatchlistScreen() {
  const [sortMode, setSortMode] = useState<SortMode>("move");

  const watchlist = useMemo(() => {
    const base = instruments.filter((instrument) => watchlistSymbols.includes(instrument.symbol));

    return [...base].sort((a, b) => {
      if (sortMode === "move") {
        return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      }

      if (sortMode === "spread") {
        return a.spreadRaw - b.spreadRaw;
      }

      return a.symbol.localeCompare(b.symbol);
    });
  }, [sortMode]);

  return (
    <ScreenScroll>
      <View
        style={{
          backgroundColor: colors.ink,
          borderRadius: radius.md,
          gap: spacing.lg,
          padding: spacing.lg,
        }}
      >
        <Text selectable style={{ color: colors.inverse, fontSize: 26, fontWeight: "800", letterSpacing: 0 }}>
          Saved markets
        </Text>
        <Text selectable style={{ color: colors.inverseMuted, fontSize: 14, lineHeight: 20 }}>
          A compact list for repeated scanning. In the final demo this can support add/remove gestures and local persistence.
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <StatTile label="Saved" value={`${watchlist.length}`} inverse />
          <StatTile label="Open" value="4/5" inverse tone="positive" />
        </View>
      </View>

      <SegmentedControl value={sortMode} segments={sortSegments} onChange={setSortMode} />

      <View style={{ gap: spacing.sm }}>
        <SectionHeader eyebrow="Curated list" title="Priority instruments" />
        {watchlist.map((instrument) => (
          <InstrumentRow key={instrument.symbol} instrument={instrument} compact />
        ))}
      </View>
    </ScreenScroll>
  );
}
