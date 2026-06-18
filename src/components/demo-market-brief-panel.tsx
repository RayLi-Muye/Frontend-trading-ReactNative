import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { colors, radius, shadows, spacing } from "@/design/theme";
import { createDemoMarketBrief, type DemoMarketBriefPoint, type DemoMarketBriefTone } from "@/services/demo-market-brief";

const demoBrief = createDemoMarketBrief();

const toneColor: Record<DemoMarketBriefTone, string> = {
  negative: colors.negative,
  neutral: colors.purple,
  positive: colors.positive,
};

const toneBackground: Record<DemoMarketBriefTone, string> = {
  negative: "rgba(255,47,61,0.1)",
  neutral: colors.purpleSoft,
  positive: colors.brandSoft,
};

function BriefPoint({ point }: { point: DemoMarketBriefPoint }) {
  return (
    <View
      style={{
        backgroundColor: toneBackground[point.tone],
        borderColor: "rgba(8,11,18,0.06)",
        borderRadius: radius.md,
        borderWidth: 1,
        flex: 1,
        gap: spacing.xs,
        minWidth: 112,
        padding: spacing.md,
      }}
    >
      <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>
        {point.label}
      </Text>
      <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: toneColor[point.tone], fontSize: 18, fontVariant: ["tabular-nums"], fontWeight: "700" }}>
        {point.value}
      </Text>
      <Text selectable numberOfLines={2} style={{ color: colors.ink, fontSize: 12, fontWeight: "500", lineHeight: 17 }}>
        {point.detail}
      </Text>
    </View>
  );
}

export function DemoMarketBriefPanel() {
  const primaryRiskNote = demoBrief.riskNotes[0] ?? "Market context can change quickly; confirm source freshness before relying on any price.";

  return (
    <Animated.View
      entering={FadeInUp.delay(120).duration(420).springify()}
      style={{
        ...shadows.card,
        backgroundColor: "rgba(255,255,255,0.84)",
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
          <Sparkles color={colors.brandAction} size={19} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 19, fontWeight: "700" }}>
            Market Brief
          </Text>
          <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
            Local demo - {demoBrief.generatedAtLabel}
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text selectable style={{ color: colors.ink, fontSize: 17, fontWeight: "700", lineHeight: 23 }}>
          {demoBrief.headline}
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: "500", lineHeight: 20 }}>
          {demoBrief.summary}
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {demoBrief.focusPoints.map((point) => (
          <BriefPoint key={point.label} point={point} />
        ))}
      </View>

      <View style={{ gap: spacing.sm }}>
        <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }}>
          <AlertTriangle color={colors.warningDark} size={17} strokeWidth={2.4} />
          <Text selectable style={{ color: colors.warningDark, flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
            {primaryRiskNote}
          </Text>
        </View>
        <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }}>
          <ShieldCheck color={colors.brandAction} size={17} strokeWidth={2.4} />
          <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
            {demoBrief.disclosure}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
