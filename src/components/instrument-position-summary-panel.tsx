import { Activity, ShieldCheck } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors, radius, shadows, spacing } from "@/design/theme";
import type { DemoInstrumentPositionSummary } from "@/hooks/use-demo-portfolio";
import { formatCurrency, formatSignedCurrency } from "@/utils/format";

type SummaryTone = "negative" | "neutral" | "positive";

type SummaryMetricProps = {
  detail?: string;
  label: string;
  tone?: SummaryTone;
  value: string;
};

function formatUnits(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function SummaryMetric({ detail, label, tone = "neutral", value }: SummaryMetricProps) {
  const valueColor = tone === "positive" ? colors.positive : tone === "negative" ? colors.negative : colors.ink;

  return (
    <View style={{ borderBottomColor: "rgba(8,11,18,0.07)", borderBottomWidth: 1, gap: spacing.xs, paddingBottom: spacing.sm }}>
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
        <Text selectable numberOfLines={1} style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "700" }}>
          {label}
        </Text>
        <Text
          selectable
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            color: valueColor,
            flexShrink: 0,
            fontSize: 15,
            fontVariant: ["tabular-nums"],
            fontWeight: "700",
            maxWidth: 156,
            textAlign: "right",
          }}
        >
          {value}
        </Text>
      </View>
      {detail ? (
        <Text selectable numberOfLines={2} style={{ color: colors.muted, fontSize: 12, fontWeight: "500", lineHeight: 17 }}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

export function InstrumentPositionSummaryPanel({ summary }: { summary: DemoInstrumentPositionSummary }) {
  const pnlTone = summary.unrealizedPnl > 0 ? "positive" : summary.unrealizedPnl < 0 ? "negative" : "neutral";

  return (
    <View
      style={{
        ...shadows.card,
        backgroundColor: "rgba(255,255,255,0.86)",
        borderColor: "rgba(8,11,18,0.05)",
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.md,
        padding: spacing.lg,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: summary.hasPosition ? colors.brandSoft : colors.surfaceAlt,
            borderRadius: radius.full,
            height: 36,
            justifyContent: "center",
            width: 36,
          }}
        >
          <Activity color={summary.hasPosition ? colors.brandAction : colors.muted} size={18} strokeWidth={2.4} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 18, fontWeight: "700" }}>
            Simulated Position
          </Text>
          <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
            {summary.hasPosition ? `${summary.symbol} local learning summary` : "No simulated position"}
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <SummaryMetric label="Quantity" value={`${formatUnits(summary.quantity)} units`} />
        <SummaryMetric label="Market value" value={formatCurrency(summary.marketValue)} />
        <SummaryMetric
          detail={`Cost basis ${formatCurrency(summary.costBasis)}`}
          label="Avg cost"
          value={summary.averageCost === null ? "N/A" : formatCurrency(summary.averageCost)}
        />
        <SummaryMetric label="Unrealized P/L" tone={pnlTone} value={formatSignedCurrency(summary.unrealizedPnl)} />
        <SummaryMetric label="Allocation" value={formatPercent(summary.allocationPercent)} />
        <SummaryMetric
          detail={summary.recentActivity.summary}
          label={summary.recentActivity.label}
          value={
            summary.recentActivity.entryCount === 0
              ? "No entries"
              : `${summary.recentActivity.entryCount} ${summary.recentActivity.entryCount === 1 ? "entry" : "entries"}`
          }
        />
      </View>

      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }}>
        <ShieldCheck color={colors.brandAction} size={17} strokeWidth={2.4} />
        <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
          {summary.disclosure}
        </Text>
      </View>
    </View>
  );
}
