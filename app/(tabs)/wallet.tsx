import * as Haptics from "expo-haptics";
import { RotateCcw } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AccountSummaryCard } from "@/components/account-summary-card";
import { AppHeader } from "@/components/app-header";
import { PageTitle } from "@/components/page-title";
import { PerformanceRecapPanel } from "@/components/performance-recap-panel";
import { PortfolioLearningInsightsPanel } from "@/components/portfolio-learning-insights-panel";
import { ScreenScroll } from "@/components/screen-scroll";
import { TradeJournalRecapPanel } from "@/components/trade-journal-recap-panel";
import { WalletFloatingActions } from "@/components/wallet-floating-actions";
import { colors, radius, shadows, spacing } from "@/design/theme";
import type { SimulatedLedgerEntry } from "@/domain/simulated-trading";
import {
  resetDemoState,
  useDemoAccountSummary,
  useDemoPerformanceRecap,
  useDemoPortfolioLearningInsights,
  useDemoTradeJournal,
  useRecentSimulatedLedgerEntries,
  useWalletAccounts,
  type DemoTradeJournalAction,
  type DemoTradeJournalFilterValue,
} from "@/hooks/use-demo-portfolio";
import { formatCurrency } from "@/utils/format";

type SimulatedActivitySectionProps = {
  entries: SimulatedLedgerEntry[];
  onReset: () => void;
};

function formatLedgerType(entry: SimulatedLedgerEntry) {
  return entry.type === "virtual_cash_debit" ? "Virtual cash debit" : "Virtual cash credit";
}

function formatLedgerAmount(entry: SimulatedLedgerEntry) {
  const sign = entry.amountCents < 0 ? "-" : "+";
  return `${sign}${formatCurrency(Math.abs(entry.amountCents) / 100)}`;
}

function SimulatedActivitySection({ entries, onReset }: SimulatedActivitySectionProps) {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
        <Text selectable style={{ color: colors.ink, flex: 1, fontSize: 18, fontWeight: "600" }}>
          Simulated Activity
        </Text>

        <Pressable
          accessibilityLabel="Reset demo state"
          accessibilityRole="button"
          onPress={onReset}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: colors.surface,
            borderColor: colors.line,
            borderRadius: radius.full,
            borderWidth: 1,
            flexDirection: "row",
            gap: spacing.xs,
            opacity: pressed ? 0.72 : 1,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          })}
        >
          <RotateCcw color={colors.brandAction} size={15} strokeWidth={2.4} />
          <Text selectable style={{ color: colors.brandAction, fontSize: 12, fontWeight: "700" }}>
            Reset demo state
          </Text>
        </Pressable>
      </View>

      {entries.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          {entries.map((entry, index) => (
            <Animated.View
              entering={FadeInUp.delay(index * 70).duration(300).springify()}
              key={entry.id}
              style={{
                ...shadows.card,
                backgroundColor: colors.surface,
                borderColor: "rgba(255,255,255,0.78)",
                borderRadius: radius.lg,
                borderWidth: 1,
                gap: spacing.sm,
                padding: spacing.md,
              }}
            >
              <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
                <Text selectable style={{ color: colors.ink, flex: 1, fontSize: 15, fontWeight: "700" }}>
                  {formatLedgerType(entry)}
                </Text>
                <Text
                  selectable
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    color: entry.amountCents < 0 ? colors.negative : colors.brandAction,
                    flexShrink: 0,
                    fontSize: 16,
                    fontVariant: ["tabular-nums"],
                    fontWeight: "700",
                    textAlign: "right",
                    width: 116,
                  }}
                >
                  {formatLedgerAmount(entry)}
                </Text>
              </View>

              <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }}>
                <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 12, fontWeight: "500" }}>
                  Local simulation
                </Text>
                <Text
                  selectable
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    color: colors.muted,
                    flexShrink: 0,
                    fontSize: 12,
                    fontVariant: ["tabular-nums"],
                    fontWeight: "600",
                    textAlign: "right",
                    width: 170,
                  }}
                >
                  Balance after {formatCurrency(entry.balanceAfterCents / 100)}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View
          style={{
            ...shadows.card,
            backgroundColor: colors.surface,
            borderColor: "rgba(255,255,255,0.78)",
            borderRadius: radius.lg,
            borderWidth: 1,
            gap: spacing.xs,
            padding: spacing.lg,
          }}
        >
          <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
            No simulated trades yet
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: "500", lineHeight: 19 }}>
            Place a demo trade to see virtual cash movements here.
          </Text>
        </View>
      )}
    </View>
  );
}

export default function WalletScreen() {
  const walletAccounts = useWalletAccounts();
  const accountSummary = useDemoAccountSummary();
  const performanceRecap = useDemoPerformanceRecap();
  const learningInsights = useDemoPortfolioLearningInsights();
  const recentLedgerEntries = useRecentSimulatedLedgerEntries(3);
  const [selectedAccountCode, setSelectedAccountCode] = useState(walletAccounts[0]?.code ?? "USD");
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const [journalActionFilter, setJournalActionFilter] = useState<DemoTradeJournalAction | DemoTradeJournalFilterValue>("all");
  const [journalSymbolFilter, setJournalSymbolFilter] = useState<string | DemoTradeJournalFilterValue>("all");
  const tradeJournal = useDemoTradeJournal({ action: journalActionFilter, symbol: journalSymbolFilter });
  const selectedAccount = walletAccounts.find((account) => account.code === selectedAccountCode) ?? walletAccounts[0];

  function handleResetDemoState() {
    resetDemoState();
    setSelectedAccountCode("USD");
    setActionsExpanded(false);
    setJournalActionFilter("all");
    setJournalSymbolFilter("all");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

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

        <PerformanceRecapPanel recap={performanceRecap} />

        <PortfolioLearningInsightsPanel insights={learningInsights} />

        <TradeJournalRecapPanel
          actionFilter={journalActionFilter}
          journal={tradeJournal}
          onActionFilterChange={setJournalActionFilter}
          onSymbolFilterChange={setJournalSymbolFilter}
          symbolFilter={journalSymbolFilter}
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

        <SimulatedActivitySection entries={recentLedgerEntries} onReset={handleResetDemoState} />
      </ScreenScroll>

      <WalletFloatingActions account={selectedAccount} expanded={actionsExpanded} onExpandedChange={setActionsExpanded} />
    </View>
  );
}
