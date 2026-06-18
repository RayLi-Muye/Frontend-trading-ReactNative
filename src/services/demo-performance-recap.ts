import type { Holding, WalletAccount } from "../data/portfolio";
import type { SimulatedLedgerEntry } from "../domain/simulated-trading";

export type DemoPerformanceContribution = {
  name: string;
  symbol: string;
  unrealizedPnl: number;
  value: number;
};

export type DemoPerformanceTimelinePoint = {
  accountValue: number;
  detail: string;
  id: string;
  label: string;
};

export type DemoPerformanceRecap = {
  bestContribution?: DemoPerformanceContribution;
  cashAllocationPercent: number;
  cashValue: number;
  currentAccountValue: number;
  disclosure: string;
  positionsAllocationPercent: number;
  positionsValue: number;
  timeline: DemoPerformanceTimelinePoint[];
  unrealizedPnl: number;
  worstContribution?: DemoPerformanceContribution;
};

export type DemoPerformanceRecapInput = {
  holdings: Holding[];
  ledgerEntries: SimulatedLedgerEntry[];
  walletAccounts: WalletAccount[];
};

export const demoPerformanceRecapDisclosure =
  "Local simulated performance recap only. Not financial advice; values use virtual cash, mock holdings, and local ledger activity with no real assets, broker routes, or live orders involved.";

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function cashTotal(walletAccounts: WalletAccount[]) {
  return roundCurrency(walletAccounts.reduce((total, account) => total + account.available, 0));
}

function positionsTotal(holdings: Holding[]) {
  return roundCurrency(holdings.reduce((total, holding) => total + holding.value, 0));
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function contributionFromHolding(holding: Holding): DemoPerformanceContribution {
  return {
    name: holding.name,
    symbol: holding.symbol,
    unrealizedPnl: roundCurrency(holding.pnl),
    value: roundCurrency(holding.value),
  };
}

function createTimeline(
  ledgerEntries: SimulatedLedgerEntry[],
  positionsValue: number,
  currentAccountValue: number,
): DemoPerformanceTimelinePoint[] {
  if (ledgerEntries.length === 0) {
    return [
      {
        accountValue: currentAccountValue,
        detail: "No simulated order ledger entries yet.",
        id: "starting-demo-state",
        label: "Starting demo state",
      },
    ];
  }

  return ledgerEntries
    .slice(-3)
    .reverse()
    .map((entry) => {
      const isDebit = entry.type === "virtual_cash_debit";
      const cashEffect = Math.abs(entry.amountCents) / 100;

      return {
        accountValue: roundCurrency(entry.balanceAfterCents / 100 + positionsValue),
        detail: `${formatCurrency(cashEffect)} ${isDebit ? "virtual cash debit" : "virtual cash credit"}.`,
        id: entry.id,
        label: isDebit ? "Virtual cash debit" : "Virtual cash credit",
      };
    });
}

export function createDemoPerformanceRecap(input: DemoPerformanceRecapInput): DemoPerformanceRecap {
  const cashValue = cashTotal(input.walletAccounts);
  const positionValue = positionsTotal(input.holdings);
  const currentAccountValue = roundCurrency(cashValue + positionValue);
  const unrealizedPnl = roundCurrency(input.holdings.reduce((total, holding) => total + holding.pnl, 0));
  const contributions = input.holdings.map(contributionFromHolding);
  const sortedByPnl = [...contributions].sort((left, right) => right.unrealizedPnl - left.unrealizedPnl);

  return {
    bestContribution: sortedByPnl[0],
    cashAllocationPercent: currentAccountValue > 0 ? roundPercent((cashValue / currentAccountValue) * 100) : 0,
    cashValue,
    currentAccountValue,
    disclosure: demoPerformanceRecapDisclosure,
    positionsAllocationPercent: currentAccountValue > 0 ? roundPercent((positionValue / currentAccountValue) * 100) : 0,
    positionsValue: positionValue,
    timeline: createTimeline(input.ledgerEntries, positionValue, currentAccountValue),
    unrealizedPnl,
    worstContribution: sortedByPnl[sortedByPnl.length - 1],
  };
}
