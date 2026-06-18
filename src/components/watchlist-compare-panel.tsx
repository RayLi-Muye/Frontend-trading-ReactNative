import { Link } from "expo-router";
import { GitCompareArrows, ShieldCheck } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { EquityAsset } from "@/data/portfolio";
import { colors, radius, shadows, spacing } from "@/design/theme";
import type { DemoWatchlistCompare } from "@/services/demo-watchlist-compare";
import { formatCurrency, formatPercent, formatPrice } from "@/utils/format";

type WatchlistComparePanelProps = {
  assets: EquityAsset[];
  compare: DemoWatchlistCompare;
  onToggleSymbol: (symbol: string) => void;
  selectedSymbols: string[];
};

function normalizedSymbols(symbols: string[]) {
  return new Set(symbols.map((symbol) => symbol.toUpperCase()));
}

export function WatchlistComparePanel({
  assets,
  compare,
  onToggleSymbol,
  selectedSymbols,
}: WatchlistComparePanelProps) {
  const selectedSet = normalizedSymbols(selectedSymbols);

  return (
    <View
      style={{
        ...shadows.card,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderColor: "rgba(8,11,18,0.05)",
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.lg,
        padding: spacing.lg,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.brandSoft,
            borderRadius: radius.full,
            height: 38,
            justifyContent: "center",
            width: 38,
          }}
        >
          <GitCompareArrows color={colors.brandAction} size={19} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 19, fontWeight: "700" }}>
            Compare Watchlist
          </Text>
          <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
            Pinned {compare.rows.length} of {compare.maxSymbols} demo symbols
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {assets.map((asset) => {
          const symbol = asset.symbol.toUpperCase();
          const selected = selectedSet.has(symbol);
          const canAdd = selected || selectedSet.size < compare.maxSymbols;
          const canRemove = !selected || selectedSet.size > compare.minSymbols;
          const disabled = !canAdd || !canRemove;

          return (
            <Pressable
              accessibilityLabel={`${selected ? "Remove" : "Add"} ${symbol} ${selected ? "from" : "to"} compare`}
              accessibilityRole="button"
              accessibilityState={{ disabled, selected }}
              disabled={disabled}
              key={symbol}
              onPress={() => onToggleSymbol(symbol)}
              style={({ pressed }) => ({
                backgroundColor: selected ? colors.brandAction : colors.surface,
                borderColor: selected ? colors.brandAction : colors.line,
                borderRadius: radius.full,
                borderWidth: 1,
                opacity: disabled ? 0.46 : pressed ? 0.72 : 1,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              })}
            >
              <Text
                selectable
                numberOfLines={1}
                style={{ color: selected ? colors.inverse : colors.muted, fontSize: 12, fontWeight: "700" }}
              >
                {symbol}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {compare.rows.length > 0 ? (
        <View style={{ gap: spacing.md }}>
          {compare.rows.map((row) => (
            <Link asChild href={{ pathname: "/instrument/[symbol]", params: { symbol: row.symbol } }} key={row.symbol}>
              <Pressable
                accessibilityLabel={`Open ${row.symbol} compare detail`}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  borderBottomColor: "rgba(8,11,18,0.07)",
                  borderBottomWidth: 1,
                  gap: spacing.sm,
                  opacity: pressed ? 0.72 : 1,
                  paddingBottom: spacing.md,
                })}
              >
                <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 15, fontWeight: "700" }}>
                      {row.symbol} {row.holdingStatus}
                    </Text>
                    <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
                      {row.name}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", flexShrink: 0, width: 112 }}>
                    <Text
                      selectable
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={{ color: colors.ink, fontSize: 15, fontVariant: ["tabular-nums"], fontWeight: "800" }}
                    >
                      {formatPrice(row.price)}
                    </Text>
                    <Text
                      selectable
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={{
                        color: row.changePercent >= 0 ? colors.positive : colors.negative,
                        fontSize: 12,
                        fontVariant: ["tabular-nums"],
                        fontWeight: "700",
                      }}
                    >
                      {formatPercent(row.changePercent)}
                    </Text>
                  </View>
                </View>

                <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
                  Position {formatCurrency(row.positionValue)} | Exposure {row.exposurePercent.toFixed(1)}% | Units{" "}
                  {row.units.toFixed(row.units % 1 === 0 ? 0 : 2)}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      ) : (
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
            No symbols selected
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: "500", lineHeight: 19 }}>
            {compare.emptyMessage}
          </Text>
        </View>
      )}

      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }}>
        <ShieldCheck color={colors.brandAction} size={17} strokeWidth={2.4} />
        <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
          {compare.disclosure}
        </Text>
      </View>
    </View>
  );
}
