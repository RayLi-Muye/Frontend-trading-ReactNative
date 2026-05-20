import { Link } from "expo-router";
import { ShieldCheck } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { ScreenScroll } from "@/components/screen-scroll";
import { SectionHeader } from "@/components/section-header";
import { colors, radius, spacing } from "@/design/theme";

export default function DisclaimerScreen() {
  return (
    <ScreenScroll>
      <View
        style={{
          alignItems: "flex-start",
          backgroundColor: colors.surface,
          borderColor: colors.line,
          borderRadius: radius.md,
          borderWidth: 1,
          gap: spacing.lg,
          padding: spacing.lg,
        }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.brandSoft,
            borderRadius: radius.full,
            height: 48,
            justifyContent: "center",
            width: 48,
          }}
        >
          <ShieldCheck color={colors.brandDark} size={24} strokeWidth={2.4} />
        </View>

        <SectionHeader eyebrow="Portfolio demo" title="Clear boundary for reviewers" />

        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 23 }}>
          This project is a React Native interview demonstration. It is not affiliated with any brokerage, does not connect to live market feeds, and does not allow trading or account actions.
        </Text>

        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 23 }}>
          All prices, spreads, leverage values, charts, and insights are mock data. They exist to demonstrate UI architecture, responsive behavior, visual polish, and project documentation.
        </Text>

        <Text selectable style={{ color: colors.warningDark, fontSize: 13, lineHeight: 20 }}>
          Trading CFDs and leveraged products can involve significant risk. This demo must not be used for financial decisions.
        </Text>
      </View>

      <Link href="/" asChild>
        <Pressable
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: colors.brand,
            borderRadius: radius.sm,
            opacity: pressed ? 0.72 : 1,
            padding: spacing.md,
          })}
        >
          <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "500" }}>Back to markets</Text>
        </Pressable>
      </Link>
    </ScreenScroll>
  );
}
