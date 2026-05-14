import { Link } from "expo-router";
import { ArrowRight, Zap } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { marketSummary } from "@/data/instruments";
import { colors, radius, shadows, spacing } from "@/design/theme";

export function MarketHero() {
  return (
    <View
      style={{
        ...shadows.card,
        backgroundColor: colors.ink,
        borderRadius: radius.lg,
        gap: spacing.lg,
        overflow: "hidden",
        padding: spacing.lg,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.sm }}>
          <Text selectable style={{ color: colors.brand, fontSize: 12, fontWeight: "900", letterSpacing: 0 }}>
            MARKET PULSE DEMO
          </Text>
          <Text selectable style={{ color: colors.inverse, fontSize: 31, fontWeight: "900", letterSpacing: 0, lineHeight: 34 }}>
            Fast market scanning without real trading risk.
          </Text>
        </View>

        <View
          style={{
            alignItems: "center",
            backgroundColor: "rgba(0,255,106,0.14)",
            borderColor: "rgba(0,255,106,0.28)",
            borderRadius: radius.full,
            borderWidth: 1,
            height: 48,
            justifyContent: "center",
            width: 48,
          }}
        >
          <Zap color={colors.brand} size={23} strokeWidth={2.4} />
        </View>
      </View>

      <Text selectable style={{ color: colors.inverseMuted, fontSize: 15, lineHeight: 22 }}>
        A mobile-first React Native prototype inspired by Eightcap's public visual system. Data is mocked so reviewers can focus on interface quality.
      </Text>

      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.08)",
          borderColor: "rgba(255,255,255,0.12)",
          borderRadius: radius.md,
          borderWidth: 1,
          flexDirection: "row",
          gap: spacing.md,
          padding: spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text selectable style={{ color: colors.inverseMuted, fontSize: 12, fontWeight: "700" }}>
            TOP MOVER
          </Text>
          <Text selectable style={{ color: colors.inverse, fontSize: 20, fontWeight: "900" }}>
            {marketSummary.topMover}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text selectable style={{ color: colors.inverseMuted, fontSize: 12, fontWeight: "700" }}>
            SESSION
          </Text>
          <Text selectable style={{ color: colors.brand, fontSize: 20, fontWeight: "900" }}>
            Mock live
          </Text>
        </View>
      </View>

      <Link href="/disclaimer" asChild>
        <Pressable
          style={({ pressed }) => ({
            alignItems: "center",
            alignSelf: "flex-start",
            backgroundColor: colors.brand,
            borderRadius: radius.sm,
            flexDirection: "row",
            gap: spacing.sm,
            opacity: pressed ? 0.72 : 1,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          })}
        >
          <Text style={{ color: colors.ink, fontSize: 14, fontWeight: "900" }}>Demo notice</Text>
          <ArrowRight color={colors.ink} size={16} strokeWidth={2.4} />
        </Pressable>
      </Link>
    </View>
  );
}
