import { Link } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { InsightCard } from "@/components/insight-card";
import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { insights } from "@/data/instruments";
import { colors, radius, spacing } from "@/design/theme";

const toolCards = [
  {
    label: "Trader toolkit",
    title: "Learn the market language",
    body: "Mock glossary cards, platform tips, and risk basics for first-time reviewers.",
  },
  {
    label: "Market notes",
    title: "Explain movement quickly",
    body: "Short observations that connect the watchlist to the chart UI.",
  },
  {
    label: "Demo scope",
    title: "Clear product boundary",
    body: "No live trading, no account actions, and no external market feed in this build.",
  },
];

export default function InsightsScreen() {
  return (
    <ScreenScroll>
      <View style={{ gap: spacing.sm }}>
        <SectionHeader eyebrow="Knowledge hub direction" title="Market insights" />
        <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
          These cards mirror the education and insight areas from Eightcap's public site while staying fully mocked.
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionHeader eyebrow="Wireframe blocks" title="Tools to show in Figma" />
        {toolCards.map((card) => (
          <View
            key={card.title}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.line,
              borderRadius: radius.md,
              borderWidth: 1,
              gap: spacing.sm,
              padding: spacing.lg,
            }}
          >
            <Text selectable style={{ color: colors.brandDark, fontSize: 12, fontWeight: "800", letterSpacing: 0 }}>
              {card.label.toUpperCase()}
            </Text>
            <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "800", letterSpacing: 0 }}>
              {card.title}
            </Text>
            <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
              {card.body}
            </Text>
          </View>
        ))}
      </View>

      <Link href="/disclaimer" asChild>
        <Pressable
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: colors.brand,
            borderRadius: radius.sm,
            flexDirection: "row",
            gap: spacing.sm,
            justifyContent: "center",
            opacity: pressed ? 0.72 : 1,
            padding: spacing.md,
          })}
        >
          <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "800" }}>View demo notice</Text>
          <ArrowRight color={colors.ink} size={18} strokeWidth={2.4} />
        </Pressable>
      </Link>
    </ScreenScroll>
  );
}
