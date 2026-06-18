import type { Holding, WalletAccount } from "../data/portfolio";
import type { SimulatedLedgerEntry } from "../domain/simulated-trading";

export type DemoPortfolioTopExposure = {
  name: string;
  percentOfPortfolio: number;
  symbol: string;
  value: number;
};

export type DemoPortfolioRecentActivityInsight = {
  entryCount: number;
  label: string;
  summary: string;
};

export type DemoPortfolioLearningInsights = {
  cashAllocationPercent: number;
  disclosure: string;
  positionCount: number;
  recentActivity: DemoPortfolioRecentActivityInsight;
  topExposure?: DemoPortfolioTopExposure;
};

export type DemoPortfolioLearningInsightInput = {
  holdings: Holding[];
  ledgerEntries: SimulatedLedgerEntry[];
  walletAccounts: WalletAccount[];
};

export const demoPortfolioLearningDisclosure =
  "Simulated learning only. Not financial advice; no real assets, broker routes, or live orders are involved.";

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function cashTotal(walletAccounts: WalletAccount[]) {
  return walletAccounts.reduce((total, account) => total + account.available, 0);
}

function holdingsTotal(holdings: Holding[]) {
  return holdings.reduce((total, holding) => total + holding.value, 0);
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function formatLedgerActivity(entry: SimulatedLedgerEntry) {
  const direction = entry.type === "virtual_cash_debit" ? "debit" : "credit";
  return `Latest virtual cash ${direction} ${formatCurrency(Math.abs(entry.amountCents) / 100)}.`;
}

function createRecentActivityInsight(ledgerEntries: SimulatedLedgerEntry[]): DemoPortfolioRecentActivityInsight {
  const latestEntry = ledgerEntries[ledgerEntries.length - 1];

  if (!latestEntry) {
    return {
      entryCount: 0,
      label: "No simulated ledger entries yet",
      summary: "Place a simulated trade to create virtual cash activity here.",
    };
  }

  return {
    entryCount: ledgerEntries.length,
    label: "Latest simulated ledger",
    summary: `${ledgerEntries.length} simulated ledger ${ledgerEntries.length === 1 ? "entry" : "entries"} - ${formatLedgerActivity(latestEntry)}`,
  };
}

export function createDemoPortfolioLearningInsights(
  input: DemoPortfolioLearningInsightInput,
): DemoPortfolioLearningInsights {
  const cash = roundCurrency(cashTotal(input.walletAccounts));
  const invested = roundCurrency(holdingsTotal(input.holdings));
  const portfolioTotal = roundCurrency(cash + invested);
  const topHolding = input.holdings.reduce<Holding | undefined>(
    (currentTop, holding) => (!currentTop || holding.value > currentTop.value ? holding : currentTop),
    undefined,
  );

  return {
    cashAllocationPercent: portfolioTotal > 0 ? roundPercent((cash / portfolioTotal) * 100) : 0,
    disclosure: demoPortfolioLearningDisclosure,
    positionCount: input.holdings.length,
    recentActivity: createRecentActivityInsight(input.ledgerEntries),
    topExposure:
      topHolding && portfolioTotal > 0
        ? {
            name: topHolding.name,
            percentOfPortfolio: roundPercent((topHolding.value / portfolioTotal) * 100),
            symbol: topHolding.symbol,
            value: roundCurrency(topHolding.value),
          }
        : undefined,
  };
}
