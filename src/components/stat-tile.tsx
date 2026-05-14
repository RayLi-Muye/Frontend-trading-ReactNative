import { Text, View } from "react-native";

import { colors, radius, spacing } from "@/design/theme";

type StatTone = "positive" | "negative" | "warning" | "neutral";

type StatTileProps = {
  label: string;
  value: string;
  tone?: StatTone;
  inverse?: boolean;
};

function toneColor(tone: StatTone | undefined, inverse: boolean | undefined) {
  if (tone === "positive") {
    return colors.positive;
  }

  if (tone === "negative") {
    return colors.negative;
  }

  if (tone === "warning") {
    return colors.warningDark;
  }

  return inverse ? colors.inverse : colors.ink;
}

export function StatTile({ label, value, tone, inverse }: StatTileProps) {
  return (
    <View
      style={{
        backgroundColor: inverse ? "rgba(255,255,255,0.08)" : colors.surface,
        borderColor: inverse ? "rgba(255,255,255,0.14)" : colors.line,
        borderRadius: radius.sm,
        borderWidth: 1,
        flex: 1,
        gap: spacing.xs,
        minHeight: 76,
        padding: spacing.md,
      }}
    >
      <Text selectable style={{ color: inverse ? colors.inverseMuted : colors.muted, fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
      <Text
        selectable
        style={{
          color: toneColor(tone, inverse),
          fontSize: 21,
          fontVariant: ["tabular-nums"],
          fontWeight: "900",
          letterSpacing: 0,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
