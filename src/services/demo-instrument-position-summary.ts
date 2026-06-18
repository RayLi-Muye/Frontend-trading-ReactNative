import type { EquityAsset, Holding, WalletAccount } from "../data/portfolio";
import type { SimulatedLedgerEntry } from "../domain/simulated-trading";

export type DemoInstrumentPositionActivity = {
  entryCount: number;
  label: string;
  summary: string;
};

export type DemoInstrumentPositionSummary = {
  allocationPercent: number;
  averageCost: number | null;
  costBasis: number;
  disclosure: string;
  hasPosition: boolean;
  marketValue: number;
  quantity: number;
  recentActivity: DemoInstrumentPositionActivity;
  symbol: string;
  unrealizedPnl: number;
};

export type DemoInstrumentPositionSummaryInput = {
  asset: EquityAsset;
  holdings: Holding[];
  ledgerEntries: SimulatedLedgerEntry[];
  walletAccounts: WalletAccount[];
};

export const demoInstrumentPositionDisclosure =
  "Simulated position summary only. Not financial advice; no real assets, broker routes, or live orders are involved.";

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function cashTotal(walletAccounts: WalletAccount[]) {
  return walletAccounts.reduce((total, account) => total + account.available, 0);
}

function holdingCostBasis(holding: Holding) {
  return roundCurrency(Math.max(holding.value - holding.pnl, 0));
}

function orderIdSymbol(entry: SimulatedLedgerEntry) {
  const match = entry.orderId.match(/^demo-order-\d+-\d+-([a-z0-9]+)-(buy|sell)$/i);
  return match ? normalizeSymbol(match[1]) : undefined;
}

function symbolLedgerEntries(ledgerEntries: SimulatedLedgerEntry[], symbol: string) {
  return ledgerEntries.filter((entry) => orderIdSymbol(entry) === symbol);
}

function createRecentActivityInsight(
  ledgerEntries: SimulatedLedgerEntry[],
  symbol: string,
): DemoInstrumentPositionActivity {
  const entries = symbolLedgerEntries(ledgerEntries, symbol);
  const latestEntry = entries[entries.length - 1];

  if (!latestEntry) {
    return {
      entryCount: 0,
      label: "No simulated activity",
      summary: `No local simulated fills for ${symbol} yet.`,
    };
  }

  const action = latestEntry.type === "virtual_cash_debit" ? "buy" : "sell";
  return {
    entryCount: entries.length,
    label: "Latest simulated activity",
    summary: `${symbol} simulated ${action} - virtual cash ${action === "buy" ? "debit" : "credit"} ${formatCurrency(Math.abs(latestEntry.amountCents) / 100)}.`,
  };
}

export function createDemoInstrumentPositionSummary(
  input: DemoInstrumentPositionSummaryInput,
): DemoInstrumentPositionSummary {
  const symbol = normalizeSymbol(input.asset.symbol);
  const holding = input.holdings.find((candidate) => normalizeSymbol(candidate.symbol) === symbol);
  const quantity = holding?.units ?? 0;
  const hasPosition = quantity > 0;
  const marketValue = hasPosition ? roundCurrency(input.asset.price * quantity) : 0;
  const costBasis = holding ? holdingCostBasis(holding) : 0;
  const averageCost = hasPosition ? roundCurrency(costBasis / quantity) : null;
  const unrealizedPnl = hasPosition ? roundCurrency(marketValue - costBasis) : 0;
  const otherHoldingsValue = input.holdings.reduce((total, candidate) => {
    if (normalizeSymbol(candidate.symbol) === symbol) {
      return total;
    }

    return total + candidate.value;
  }, 0);
  const portfolioTotal = roundCurrency(cashTotal(input.walletAccounts) + otherHoldingsValue + marketValue);

  return {
    allocationPercent: hasPosition && portfolioTotal > 0 ? roundPercent((marketValue / portfolioTotal) * 100) : 0,
    averageCost,
    costBasis,
    disclosure: demoInstrumentPositionDisclosure,
    hasPosition,
    marketValue,
    quantity,
    recentActivity: createRecentActivityInsight(input.ledgerEntries, symbol),
    symbol,
    unrealizedPnl,
  };
}
