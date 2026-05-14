import { Text, View } from "react-native";

import { colors, radius, spacing } from "@/design/theme";

type Insight = {
  label: string;
  title: string;
  body: string;
  tone: "positive" | "warning" | "neutral";
};

type InsightCardProps = {
  insight: Insight;
};

function colorsForTone(tone: Insight["tone"]) {
  if (tone === "positive") {
    return { background: colors.brandSoft, label: colors.brandDark };
  }

  if (tone === "warning") {
    return { background: colors.warning, label: colors.warningDark };
  }

  return { background: colors.purpleSoft, label: colors.purple };
}

export function InsightCard({ insight }: InsightCardProps) {
  const tone = colorsForTone(insight.tone);

  return (
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
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: tone.background,
          borderRadius: radius.xs,
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
        }}
      >
        <Text selectable style={{ color: tone.label, fontSize: 12, fontWeight: "900", letterSpacing: 0 }}>
          {insight.label.toUpperCase()}
        </Text>
      </View>
      <Text selectable style={{ color: colors.ink, fontSize: 20, fontWeight: "900", letterSpacing: 0, lineHeight: 24 }}>
        {insight.title}
      </Text>
      <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
        {insight.body}
      </Text>
    </View>
  );
}
