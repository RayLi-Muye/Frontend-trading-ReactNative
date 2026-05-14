import * as Haptics from "expo-haptics";
import { ArrowRightLeft, Landmark, Plus, Smartphone } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AccountSummaryCard } from "@/components/account-summary-card";
import { AppHeader } from "@/components/app-header";
import { GlassSurface } from "@/components/glass-surface";
import { ScreenScroll } from "@/components/screen-scroll";
import { walletAccounts } from "@/data/portfolio";
import { colors, radius, shadows, spacing } from "@/design/theme";
import { formatCurrency } from "@/utils/format";

export default function WalletScreen() {
  return (
    <ScreenScroll includeTopInset bottomInset={118}>
      <AppHeader searchPlaceholder="Search" />

      <AccountSummaryCard />

      <GlassSurface
        interactive
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          flexDirection: "row",
          gap: spacing.md,
          padding: spacing.lg,
        }}
      >
        <View style={{ flex: 1, gap: spacing.sm }}>
          <Text selectable style={{ color: colors.ink, fontSize: 23, fontWeight: "900", lineHeight: 29 }}>
            Fund once, manage every position
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 16, fontWeight: "600", lineHeight: 23 }}>
            Cash, investment accounts, and available balances update in one place.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start funding"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})}
            style={({ pressed }) => ({
              alignItems: "center",
              alignSelf: "flex-start",
              backgroundColor: colors.brandAction,
              borderRadius: radius.full,
              opacity: pressed ? 0.72 : 1,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
            })}
          >
            <Text style={{ color: colors.inverse, fontSize: 17, fontWeight: "900" }}>Get started</Text>
          </Pressable>
        </View>

        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.brandSoft,
            borderRadius: radius.md,
            height: 112,
            justifyContent: "center",
            transform: [{ rotate: "-14deg" }],
            width: 112,
          }}
        >
          <Smartphone color={colors.brandAction} size={60} strokeWidth={1.7} />
        </View>
      </GlassSurface>

      <View style={{ backgroundColor: colors.surface, marginHorizontal: -spacing.lg }}>
        {walletAccounts.map((account, index) => (
          <Animated.View
            entering={FadeInUp.delay(index * 90).duration(430).springify()}
            key={account.code}
            style={{
              borderBottomColor: colors.line,
              borderBottomWidth: 1,
              flexDirection: "row",
              gap: spacing.md,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.lg,
            }}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: account.accent,
                borderRadius: radius.sm,
                height: 46,
                justifyContent: "center",
                width: 46,
              }}
            >
              <Text selectable style={{ color: colors.inverse, fontSize: 17, fontWeight: "900" }}>
                {account.code === "AUD" ? "A$" : account.code}
              </Text>
            </View>

            <View style={{ flex: 1, justifyContent: "center", minWidth: 0 }}>
              <Text selectable style={{ color: colors.ink, fontSize: 20, fontWeight: "900" }}>
                {account.code} Account
              </Text>
              <Text selectable style={{ color: colors.muted, fontSize: 14, fontWeight: "600" }}>
                Available {formatCurrency(account.available)}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end", flexShrink: 0, justifyContent: "center", width: 112 }}>
              <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: colors.ink, fontSize: 20, fontVariant: ["tabular-nums"], fontWeight: "600" }}>
                {formatCurrency(account.balance)}
              </Text>
              <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: colors.muted, fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "600" }}>
                {account.code === "USD" ? "$" : account.code === "AUD" ? "A$" : "£"}{account.balance.toFixed(2)}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: spacing.md,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Deposit funds"
          onPress={() => Haptics.selectionAsync().catch(() => {})}
          style={({ pressed }) => ({
            alignItems: "center",
            borderColor: colors.line,
            borderRadius: radius.full,
            borderWidth: 1,
            flex: 1,
            flexDirection: "row",
            gap: spacing.sm,
            justifyContent: "center",
            opacity: pressed ? 0.72 : 1,
            paddingVertical: spacing.md,
          })}
        >
          <Landmark color={colors.ink} size={20} strokeWidth={2.3} />
          <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "900" }}>Fund</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Transfer funds"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})}
          style={({ pressed }) => ({
            ...shadows.card,
            alignItems: "center",
            backgroundColor: colors.brandAction,
            borderRadius: radius.full,
            flex: 1,
            flexDirection: "row",
            gap: spacing.sm,
            justifyContent: "center",
            opacity: pressed ? 0.72 : 1,
            paddingVertical: spacing.md,
          })}
        >
          <ArrowRightLeft color={colors.inverse} size={20} strokeWidth={2.3} />
          <Text style={{ color: colors.inverse, fontSize: 17, fontWeight: "900" }}>Transfer</Text>
          <Plus color={colors.inverse} size={22} strokeWidth={2.3} />
        </Pressable>
      </View>
    </ScreenScroll>
  );
}
