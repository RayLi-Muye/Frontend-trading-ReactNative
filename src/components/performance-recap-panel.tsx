import { Activity, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors, radius, shadows, spacing } from "@/design/theme";
import type { DemoPerformanceContribution, DemoPerformanceRecap } from "@/hooks/use-demo-portfolio";
import { formatCurrency, formatSignedCurrency } from "@/utils/format";

type RecapMetricProps = {
  detail: string;
  label: string;
  tone?: "negative" | "neutral" | "positive";
  value: string;
};

function metricColor(tone: RecapMetricProps["tone"]) {
  if (tone === "positive") {
    return colors.positive;
  }

  if (tone === "negative") {
    return colors.negative;
  }

  return colors.ink;
}

function RecapMetric({ detail, label, tone = "neutral", value }: RecapMetricProps) {
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
            color: metricColor(tone),
            flexShrink: 0,
            fontSize: 16,
            fontVariant: ["tabular-nums"],
            fontWeight: "800",
            maxWidth: 150,
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

function contributionLabel(contribution: DemoPerformanceContribution | undefined) {
  if (!contribution) {
    return "None";
  }

  return `${contribution.symbol} ${formatSignedCurrency(contribution.unrealizedPnl)}`;
}

export function PerformanceRecapPanel({ recap }: { recap: DemoPerformanceRecap }) {
  const latestPoint = recap.timeline[0];
  const pnlTone = recap.unrealizedPnl > 0 ? "positive" : recap.unrealizedPnl < 0 ? "negative" : "neutral";

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
          <Activity color={colors.brandAction} size={19} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 19, fontWeight: "700" }}>
            Performance Recap
          </Text>
          <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
            Local virtual account timeline
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <RecapMetric
          detail="Virtual cash plus current simulated position value."
          label="Current virtual value"
          value={formatCurrency(recap.currentAccountValue)}
        />
        <RecapMetric
          detail={`${formatCurrency(recap.cashValue)} virtual cash and ${formatCurrency(recap.positionsValue)} in simulated positions.`}
          label="Cash vs positions"
          value={`${recap.cashAllocationPercent.toFixed(1)}% / ${recap.positionsAllocationPercent.toFixed(1)}%`}
        />
        <RecapMetric
          detail="Sum of local unrealized P/L across simulated holdings."
          label="Unrealized P/L"
          tone={pnlTone}
          value={formatSignedCurrency(recap.unrealizedPnl)}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
          <Activity color={colors.brandAction} size={17} strokeWidth={2.4} />
          <Text selectable style={{ color: colors.ink, flex: 1, fontSize: 14, fontWeight: "700" }}>
            Recent account checkpoint
          </Text>
        </View>
        <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
          {latestPoint?.label ?? "Starting demo state"} - {latestPoint?.detail ?? "No simulated activity yet."} Checkpoint value{" "}
          {formatCurrency(latestPoint?.accountValue ?? recap.currentAccountValue)}.
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.xs, minWidth: 0 }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.xs }}>
            <TrendingUp color={colors.positive} size={16} strokeWidth={2.4} />
            <Text selectable numberOfLines={1} style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "700" }}>
              Best contribution
            </Text>
          </View>
          <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: colors.ink, fontSize: 14, fontWeight: "800" }}>
            {contributionLabel(recap.bestContribution)}
          </Text>
        </View>

        <View style={{ flex: 1, gap: spacing.xs, minWidth: 0 }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.xs }}>
            <TrendingDown color={colors.negative} size={16} strokeWidth={2.4} />
            <Text selectable numberOfLines={1} style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "700" }}>
              Worst contribution
            </Text>
          </View>
          <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: colors.ink, fontSize: 14, fontWeight: "800" }}>
            {contributionLabel(recap.worstContribution)}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }}>
        <ShieldCheck color={colors.brandAction} size={17} strokeWidth={2.4} />
        <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
          {recap.disclosure}
        </Text>
      </View>
    </View>
  );
}
