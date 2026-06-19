import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AccountSummaryCard } from "@/components/account-summary-card";
import { AppHeader } from "@/components/app-header";
import { PageTitle } from "@/components/page-title";
import { ScreenScroll } from "@/components/screen-scroll";
import { WalletFloatingActions } from "@/components/wallet-floating-actions";
import { colors, radius, shadows, spacing } from "@/design/theme";
import { useDemoAccountSummary, useWalletAccounts } from "@/hooks/use-demo-portfolio";
import { formatCurrency } from "@/utils/format";

export default function WalletScreen() {
  const walletAccounts = useWalletAccounts();
  const accountSummary = useDemoAccountSummary();
  const [selectedAccountCode, setSelectedAccountCode] = useState(walletAccounts[0]?.code ?? "USD");
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const selectedAccount = walletAccounts.find((account) => account.code === selectedAccountCode) ?? walletAccounts[0];

  return (
    <View style={{ backgroundColor: colors.canvas, flex: 1 }}>
      <ScreenScroll includeTopInset bottomInset={184}>
        <AppHeader />

        <View style={{ gap: spacing.xs }}>
          <PageTitle size="large">Wallet</PageTitle>
        </View>

        <AccountSummaryCard
          accounts={walletAccounts}
          summary={accountSummary}
          selectedAccountCode={selectedAccountCode}
        />

        <View style={{ gap: spacing.md }}>
          <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "600" }}>
            Currency accounts
          </Text>

          {walletAccounts.map((account, index) => {
            const selected = account.code === selectedAccountCode;
            const currencySymbol = account.code === "AUD" ? "A$" : account.code === "GBP" ? "£" : "$";

            return (
              <Animated.View entering={FadeInUp.delay(index * 80).duration(360).springify()} key={account.code}>
                <Pressable
                  accessibilityLabel={`Select ${account.name}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedAccountCode(account.code);
                    setActionsExpanded(false);
                  }}
                  style={({ pressed }) => ({
                    ...shadows.card,
                    alignItems: "center",
                    backgroundColor: selected ? "rgba(231,250,238,0.86)" : colors.surface,
                    borderColor: selected ? "rgba(5,184,63,0.34)" : "rgba(255,255,255,0.78)",
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    flexDirection: "row",
                    gap: spacing.md,
                    opacity: pressed ? 0.72 : 1,
                    padding: spacing.lg,
                  })}
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
                    <Text selectable style={{ color: colors.inverse, fontSize: 17, fontWeight: "600" }}>
                      {account.code === "AUD" ? "A$" : account.code}
                    </Text>
                  </View>

                  <View style={{ flex: 1, justifyContent: "center", minWidth: 0 }}>
                    <Text selectable style={{ color: colors.ink, fontSize: 19, fontWeight: "600" }}>
                      {account.name}
                    </Text>
                    <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: "500" }}>
                      Available {formatCurrency(account.available, currencySymbol)}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end", flexShrink: 0, justifyContent: "center", width: 114 }}>
                    <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: colors.ink, fontSize: 19, fontVariant: ["tabular-nums"], fontWeight: "500" }}>
                      {formatCurrency(account.balance, currencySymbol)}
                    </Text>
                    <Text selectable numberOfLines={1} adjustsFontSizeToFit style={{ color: selected ? colors.brandAction : colors.muted, fontSize: 13, fontVariant: ["tabular-nums"], fontWeight: "500" }}>
                      {selected ? "Selected" : account.code}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScreenScroll>

      <WalletFloatingActions account={selectedAccount} expanded={actionsExpanded} onExpandedChange={setActionsExpanded} />
    </View>
  );
}
