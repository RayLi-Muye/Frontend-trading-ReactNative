import { ChevronDown } from "lucide-react-native";
import { Text, View } from "react-native";

import { accountSummary } from "@/data/portfolio";
import { colors, radius, shadows, spacing } from "@/design/theme";
import { formatCurrency } from "@/utils/format";

import { GlassSurface } from "./glass-surface";

export function AccountSummaryCard() {
  return (
    <GlassSurface
      interactive
      style={{
        ...shadows.card,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        gap: spacing.lg,
        padding: spacing.lg,
      }}
    >
      <View style={{ gap: spacing.sm }}>
        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
          <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "800" }}>
            Total value
          </Text>

          <View
            style={{
              alignItems: "center",
              borderColor: "#c4cad6",
              borderRadius: radius.full,
              borderWidth: 1,
              flexDirection: "row",
              flexShrink: 0,
              gap: spacing.sm,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
            }}
          >
            <Text selectable style={{ color: colors.muted, fontSize: 18, fontWeight: "900" }}>
              USD
            </Text>
            <ChevronDown color={colors.muted} size={18} strokeWidth={2.4} />
          </View>
        </View>

        <Text
          selectable
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{ color: colors.ink, fontSize: 42, fontVariant: ["tabular-nums"], fontWeight: "900", letterSpacing: 0 }}
        >
          {formatCurrency(accountSummary.totalValue)}
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "600" }}>
          Last updated at {accountSummary.lastUpdated}
        </Text>
      </View>

      <View style={{ backgroundColor: colors.brand, borderRadius: radius.full, height: 12 }} />

      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
        <View style={{ backgroundColor: colors.brandAction, borderRadius: radius.full, height: 28, width: 3 }} />
        <Text selectable style={{ color: colors.ink, fontSize: 24, fontVariant: ["tabular-nums"], fontWeight: "500" }}>
          100%
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 17, fontWeight: "700" }}>
          Investment account
        </Text>
      </View>
    </GlassSurface>
  );
}
