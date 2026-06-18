import { Activity, ShieldCheck } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors, radius, spacing } from "@/design/theme";
import type { DemoPositionSizingCoach, DemoPositionSizingCoachCheckTone, DemoPositionSizingGuardrail } from "@/hooks/use-demo-portfolio";

function checkColor(tone: DemoPositionSizingCoachCheckTone) {
  if (tone === "positive") {
    return colors.positive;
  }

  if (tone === "negative") {
    return colors.negative;
  }

  if (tone === "warning") {
    return colors.warningDark;
  }

  return colors.ink;
}

function guardrailColor(guardrail: DemoPositionSizingGuardrail) {
  if (guardrail.tone === "blocking") {
    return colors.negative;
  }

  if (guardrail.tone === "warning") {
    return colors.warningDark;
  }

  return colors.muted;
}

export function PositionSizingCoachPanel({ coach }: { coach: DemoPositionSizingCoach }) {
  return (
    <View
      style={{
        backgroundColor: "rgba(241,243,239,0.72)",
        borderColor: "rgba(8,11,18,0.07)",
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.md,
        padding: spacing.md,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.brandSoft,
            borderRadius: radius.full,
            height: 30,
            justifyContent: "center",
            width: 30,
          }}
        >
          <Activity color={colors.brandAction} size={16} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text selectable numberOfLines={1} style={{ color: colors.ink, fontSize: 14, fontWeight: "800" }}>
            Practice Sizing Checklist
          </Text>
          <Text selectable numberOfLines={1} style={{ color: colors.muted, fontSize: 11, fontWeight: "700" }}>
            Local pre-trade risk budget
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        {coach.checks.map((check) => (
          <View key={check.label} style={{ gap: spacing.xs }}>
            <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" }}>
              <Text selectable numberOfLines={1} style={{ color: colors.muted, flex: 1, fontSize: 11, fontWeight: "800", textTransform: "uppercase" }}>
                {check.label}
              </Text>
              <Text
                selectable
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: checkColor(check.tone),
                  flexShrink: 0,
                  fontSize: 13,
                  fontVariant: ["tabular-nums"],
                  fontWeight: "800",
                  maxWidth: 150,
                  textAlign: "right",
                }}
              >
                {check.value}
              </Text>
            </View>
            <Text selectable numberOfLines={2} style={{ color: colors.muted, fontSize: 11, fontWeight: "600", lineHeight: 16 }}>
              {check.detail}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text selectable style={{ color: colors.ink, fontSize: 12, fontWeight: "800" }}>
          Preview guardrails
        </Text>
        {coach.guardrails.map((guardrail) => (
          <Text selectable key={`${guardrail.tone}-${guardrail.message}`} style={{ color: guardrailColor(guardrail), fontSize: 11, fontWeight: "700", lineHeight: 16 }}>
            {guardrail.message}
          </Text>
        ))}
      </View>

      <View style={{ alignItems: "flex-start", flexDirection: "row", gap: spacing.sm }}>
        <ShieldCheck color={colors.brandAction} size={15} strokeWidth={2.4} />
        <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 11, fontWeight: "600", lineHeight: 16 }}>
          {coach.disclosure}
        </Text>
      </View>
    </View>
  );
}
