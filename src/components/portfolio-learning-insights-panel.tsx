import { Activity, ChartPie, ShieldCheck } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors, radius, shadows, spacing } from "@/design/theme";
import type { DemoPortfolioLearningInsights } from "@/hooks/use-demo-portfolio";
import { formatCurrency } from "@/utils/format";

type LearningMetricProps = {
  detail: string;
  label: string;
  value: string;
};

function LearningMetric({ detail, label, value }: LearningMetricProps) {
  return (
    <View
      style={{
        borderBottomColor: "rgba(8,11,18,0.07)",
        borderBottomWidth: 1,
        gap: spacing.xs,
        paddingBottom: spacing.md,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
        <Text selectable numberOfLines={1} style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "700" }}>
          {label}
        </Text>
        <Text
          selectable
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            color: colors.ink,
            flexShrink: 0,
            fontSize: 16,
            fontVariant: ["tabular-nums"],
            fontWeight: "700",
            maxWidth: 144,
            textAlign: "right",
          }}
        >
          {value}
        </Text>
      </View>
      <Text selectable numberOfLines={2} style={{ color: colors.muted, fontSize: 12, fontWeight: "500", lineHeight: 17 }}>
        {detail}
      </Text>
    </View>
  );
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function PortfolioLearningInsightsPanel({ insights }: { insights: DemoPortfolioLearningInsights }) {
  const topExposureValue = insights.topExposure ? `${insights.topExposure.symbol} ${formatPercent(insights.topExposure.percentOfPortfolio)}` : "None yet";
  const topExposureDetail = insights.topExposure
    ? `${formatCurrency(insights.topExposure.value)} simulated exposure in ${insights.topExposure.name}.`
    : "Place a simulated trade to create portfolio exposure.";
  const activityValue =
    insights.recentActivity.entryCount === 0
      ? "No entries"
      : `${insights.recentActivity.entryCount} ${insights.recentActivity.entryCount === 1 ? "entry" : "entries"}`;

  return (
    <View
      style={{
        ...shadows.card,
        backgroundColor: "rgba(255,255,255,0.86)",
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
          <ChartPie color={colors.brandAction} size={19} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 19, fontWeight: "700" }}>
            Learning Insights
          </Text>
          <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
            Local simulated portfolio context
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <LearningMetric
          detail="Share of total demo portfolio value still held as virtual cash."
          label="Cash allocation"
          value={formatPercent(insights.cashAllocationPercent)}
        />
        <LearningMetric detail={topExposureDetail} label="Top exposure" value={topExposureValue} />
        <LearningMetric
          detail="Number of symbols currently held in the local simulated portfolio."
          label="Positions"
          value={String(insights.positionCount)}
        />
        <LearningMetric detail={insights.recentActivity.summary} label={insights.recentActivity.label} value={activityValue} />
      </View>

      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }}>
        <Activity color={colors.brandAction} size={17} strokeWidth={2.4} />
        <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
          These insights are derived from local virtual cash, holdings, and ledger state only.
        </Text>
      </View>

      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }}>
        <ShieldCheck color={colors.brandAction} size={17} strokeWidth={2.4} />
        <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
          {insights.disclosure}
        </Text>
      </View>
    </View>
  );
}
