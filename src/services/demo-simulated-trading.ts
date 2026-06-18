import {
  applySimulatedMarketOrder,
  type SimulatedLedgerEntry,
  type SimulatedMarketOrderRequest,
  type SimulatedOrderSide,
  type SimulatedQuoteSnapshot,
} from "../domain/simulated-trading";
import type { EquityAsset, Holding, WalletAccount } from "../data/portfolio";

export const demoSimulatedAccountId = "demo-simulated-account";

export type DemoSimulatedTradeIds = Pick<SimulatedMarketOrderRequest, "fillId" | "ledgerEntryId" | "orderId">;

export type DemoSimulatedTradingState = {
  holdings: Holding[];
  ledgerEntries: SimulatedLedgerEntry[];
  walletAccounts: WalletAccount[];
};

export type DemoSimulatedMarketOrderInput = {
  asset: EquityAsset;
  ids: DemoSimulatedTradeIds;
  quantity: number;
  side: SimulatedOrderSide;
  submittedAt: string;
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundQuantity(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

function centsToDollars(value: number) {
  return roundCurrency(value / 100);
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function getUsdWalletAccount(walletAccounts: WalletAccount[]) {
  return walletAccounts.find((account) => account.code.toUpperCase() === "USD");
}

function toPosition(holding: Holding) {
  return {
    symbol: normalizeSymbol(holding.symbol),
    quantity: holding.units,
    averageCostCents: dollarsToCents(holding.units > 0 ? holding.value / holding.units : holding.price),
  };
}

function toQuoteSnapshot(asset: EquityAsset, submittedAt: string): SimulatedQuoteSnapshot {
  return {
    symbol: normalizeSymbol(asset.symbol),
    askPriceCents: asset.ask > 0 ? Math.max(dollarsToCents(asset.ask), 1) : null,
    bidPriceCents: asset.bid > 0 ? Math.max(dollarsToCents(asset.bid), 1) : null,
    feedLabel: "local demo quote",
    lastPriceCents: Math.max(dollarsToCents(asset.price), 1),
    source: "local-demo",
    asOf: submittedAt,
  };
}

function updateUsdWalletAccount(walletAccounts: WalletAccount[], virtualCashCents: number) {
  const nextAvailable = centsToDollars(virtualCashCents);

  return walletAccounts.map((account) =>
    account.code.toUpperCase() === "USD"
      ? {
          ...account,
          available: nextAvailable,
          balance: nextAvailable,
        }
      : account,
  );
}

function reconcileHoldings(holdings: Holding[], tradedAsset: EquityAsset, positions: Array<{ quantity: number; symbol: string }>) {
  const sourceBySymbol = new Map<string, Holding | EquityAsset>();

  holdings.forEach((holding) => sourceBySymbol.set(normalizeSymbol(holding.symbol), holding));
  sourceBySymbol.set(normalizeSymbol(tradedAsset.symbol), tradedAsset);

  return positions.flatMap((position) => {
    const symbol = normalizeSymbol(position.symbol);
    const source = sourceBySymbol.get(symbol);

    if (!source || position.quantity <= 0) {
      return [];
    }

    return [
      {
        ...source,
        symbol,
        dateLabel: "Today",
        pnl: "pnl" in source ? source.pnl : 0,
        units: roundQuantity(position.quantity),
        value: roundCurrency(source.price * position.quantity),
      },
    ];
  });
}

export function createDemoSimulatedAccountState(walletAccounts: WalletAccount[], holdings: Holding[]) {
  const usdAccount = getUsdWalletAccount(walletAccounts);

  return {
    accountId: demoSimulatedAccountId,
    currency: "USD" as const,
    positions: holdings.map(toPosition),
    virtualCashCents: dollarsToCents(usdAccount?.available ?? 0),
  };
}

export function applyDemoSimulatedMarketOrder(
  state: DemoSimulatedTradingState,
  input: DemoSimulatedMarketOrderInput,
) {
  const account = createDemoSimulatedAccountState(state.walletAccounts, state.holdings);
  const result = applySimulatedMarketOrder(account, {
    ...input.ids,
    accountId: account.accountId,
    quantity: input.quantity,
    quote: toQuoteSnapshot(input.asset, input.submittedAt),
    side: input.side,
    submittedAt: input.submittedAt,
    symbol: input.asset.symbol,
  });

  return {
    fill: result.fill,
    holdings: reconcileHoldings(state.holdings, input.asset, result.account.positions),
    ledgerEntries: [...state.ledgerEntries, ...result.ledgerEntries],
    order: result.order,
    walletAccounts: updateUsdWalletAccount(state.walletAccounts, result.account.virtualCashCents),
  };
}
