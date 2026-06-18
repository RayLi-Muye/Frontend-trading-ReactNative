import { BookOpenCheck, Filter, ShieldCheck } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors, radius, shadows, spacing } from "@/design/theme";
import type {
  DemoTradeJournal,
  DemoTradeJournalAction,
  DemoTradeJournalFilterValue,
} from "@/hooks/use-demo-portfolio";
import { formatCurrency } from "@/utils/format";

type TradeJournalFilterButtonProps<T extends string> = {
  label: string;
  onPress: (value: T) => void;
  selected: boolean;
  value: T;
};

type TradeJournalRecapPanelProps = {
  actionFilter: DemoTradeJournalAction | DemoTradeJournalFilterValue;
  journal: DemoTradeJournal;
  onActionFilterChange: (value: DemoTradeJournalAction | DemoTradeJournalFilterValue) => void;
  onSymbolFilterChange: (value: string | DemoTradeJournalFilterValue) => void;
  symbolFilter: string | DemoTradeJournalFilterValue;
};

function formatCashFlow(value: number) {
  const sign = value < 0 ? "-" : "+";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

function formatAction(value: DemoTradeJournalAction) {
  return value === "buy" ? "Buy" : "Sell";
}

function activeFilterSummary(symbol: string, action: DemoTradeJournalAction | DemoTradeJournalFilterValue) {
  const symbolLabel = symbol === "all" ? "all symbols" : symbol;
  const actionLabel = action === "all" ? "all actions" : `${action}s`;
  return `Showing ${symbolLabel} ${actionLabel}`;
}

function TradeJournalFilterButton<T extends string>({
  label,
  onPress,
  selected,
  value,
}: TradeJournalFilterButtonProps<T>) {
  return (
    <Pressable
      accessibilityLabel={`Filter journal ${label.toLowerCase()}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(value)}
      style={({ pressed }) => ({
        backgroundColor: selected ? colors.brandAction : colors.surface,
        borderColor: selected ? colors.brandAction : colors.line,
        borderRadius: radius.full,
        borderWidth: 1,
        opacity: pressed ? 0.72 : 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      })}
    >
      <Text
        selectable
        numberOfLines={1}
        style={{
          color: selected ? colors.inverse : colors.muted,
          fontSize: 12,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TradeJournalRecapPanel({
  actionFilter,
  journal,
  onActionFilterChange,
  onSymbolFilterChange,
  symbolFilter,
}: TradeJournalRecapPanelProps) {
  const actionOptions: Array<DemoTradeJournalAction | DemoTradeJournalFilterValue> = ["all", ...journal.filterOptions.actions];
  const symbolOptions = ["all", ...journal.filterOptions.symbols];

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
          <BookOpenCheck color={colors.brandAction} size={19} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 19, fontWeight: "700" }}>
            Trade Journal
          </Text>
          <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
            Local simulated recap prompts
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
          <Filter color={colors.brandAction} size={16} strokeWidth={2.4} />
          <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "700" }}>
            {activeFilterSummary(symbolFilter, actionFilter)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {actionOptions.map((action) => (
            <TradeJournalFilterButton
              key={action}
              label={action === "all" ? "All actions" : formatAction(action)}
              onPress={onActionFilterChange}
              selected={actionFilter === action}
              value={action}
            />
          ))}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {symbolOptions.map((symbol) => (
            <TradeJournalFilterButton
              key={symbol}
              label={symbol === "all" ? "All symbols" : symbol}
              onPress={onSymbolFilterChange}
              selected={symbolFilter === symbol}
              value={symbol}
            />
          ))}
        </View>
      </View>

      {journal.entries.length > 0 ? (
        <View style={{ gap: spacing.md }}>
          {journal.entries.map((entry) => (
            <View
              key={entry.id}
              style={{
                borderBottomColor: "rgba(8,11,18,0.07)",
                borderBottomWidth: 1,
                gap: spacing.sm,
                paddingBottom: spacing.md,
              }}
            >
              <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
                <Text selectable style={{ color: colors.ink, flex: 1, fontSize: 15, fontWeight: "700" }}>
                  {entry.symbol} {formatAction(entry.action)}
                </Text>
                <Text
                  selectable
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    color: entry.cashFlow < 0 ? colors.negative : colors.brandAction,
                    flexShrink: 0,
                    fontSize: 15,
                    fontVariant: ["tabular-nums"],
                    fontWeight: "800",
                    maxWidth: 128,
                    textAlign: "right",
                  }}
                >
                  {formatCashFlow(entry.cashFlow)}
                </Text>
              </View>

              <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "700", lineHeight: 18 }}>
                {entry.cashFlowLabel}. Balance after {formatCurrency(entry.balanceAfter)}.
              </Text>
              <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
                {entry.positionImpact}
              </Text>
              <Text selectable style={{ color: colors.ink, fontSize: 12, fontWeight: "700", lineHeight: 18 }}>
                {entry.recapPrompt}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
            {journal.emptyMessage}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: "500", lineHeight: 19 }}>
            Place a simulated trade to generate a local learning recap.
          </Text>
        </View>
      )}

      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }}>
        <ShieldCheck color={colors.brandAction} size={17} strokeWidth={2.4} />
        <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
          {journal.disclosure}
        </Text>
      </View>
    </View>
  );
}
