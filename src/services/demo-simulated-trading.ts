import {
  applySimulatedMarketOrder,
  SimulatedTradingError,
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

export type DemoSimulatedOrderPreviewWarning = {
  code: "CONCENTRATION";
  message: string;
};

export type DemoSimulatedOrderPreviewBlock = {
  code: SimulatedTradingError["code"];
  message: string;
};

export type DemoSimulatedMarketOrderPreview = {
  canSubmit: boolean;
  cashAfterCents: number;
  cashBeforeCents: number;
  estimatedNotionalCents: number;
  ledgerEffectCents: number;
  positionAfterQuantity: number;
  positionBeforeQuantity: number;
  warningMessages: DemoSimulatedOrderPreviewWarning[];
  blockingReason?: DemoSimulatedOrderPreviewBlock;
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

function executionPriceCents(side: SimulatedOrderSide, asset: EquityAsset, submittedAt: string) {
  const quote = toQuoteSnapshot(asset, submittedAt);
  const sideQuote = side === "buy" ? quote.askPriceCents : quote.bidPriceCents;

  return sideQuote && sideQuote > 0 ? sideQuote : quote.lastPriceCents;
}

function getUsdWalletAccount(walletAccounts: WalletAccount[]) {
  return walletAccounts.find((account) => account.code.toUpperCase() === "USD");
}

function getPositionQuantity(positions: Array<{ quantity: number; symbol: string }>, symbol: string) {
  return positions.find((position) => normalizeSymbol(position.symbol) === symbol)?.quantity ?? 0;
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

function blockingReason(error: unknown): DemoSimulatedOrderPreviewBlock {
  if (error instanceof SimulatedTradingError) {
    if (error.code === "INSUFFICIENT_VIRTUAL_FUNDS") {
      return {
        code: error.code,
        message: "Insufficient virtual funds: lower the quantity or add demo cash before submitting.",
      };
    }

    if (error.code === "INSUFFICIENT_POSITION") {
      return {
        code: error.code,
        message: "Oversell guardrail: lower the quantity to the simulated position available.",
      };
    }

    return {
      code: error.code,
      message: error.message,
    };
  }

  return {
    code: "INVALID_ORDER",
    message: "Order preview is unavailable for this simulated input.",
  };
}

function previewWarnings(input: DemoSimulatedMarketOrderInput, cashBeforeCents: number, estimatedNotionalCents: number) {
  const warnings: DemoSimulatedOrderPreviewWarning[] = [];

  if (input.side === "buy" && cashBeforeCents > 0 && estimatedNotionalCents >= cashBeforeCents * 0.25) {
    warnings.push({
      code: "CONCENTRATION",
      message: "Concentration warning: this simulated order uses more than 25% of current virtual cash.",
    });
  }

  return warnings;
}

export function previewDemoSimulatedMarketOrder(
  state: DemoSimulatedTradingState,
  input: DemoSimulatedMarketOrderInput,
): DemoSimulatedMarketOrderPreview {
  const account = createDemoSimulatedAccountState(state.walletAccounts, state.holdings);
  const symbol = normalizeSymbol(input.asset.symbol);
  const quantity = Number.isFinite(input.quantity) ? Math.max(input.quantity, 0) : 0;
  const positionBeforeQuantity = getPositionQuantity(account.positions, symbol);
  const estimatedNotionalCents = Math.round(executionPriceCents(input.side, input.asset, input.submittedAt) * quantity);
  const ledgerEffectCents = input.side === "buy" ? -estimatedNotionalCents : estimatedNotionalCents;
  const fallbackPositionAfterQuantity = roundQuantity(
    input.side === "buy" ? positionBeforeQuantity + quantity : positionBeforeQuantity - quantity,
  );

  try {
    const result = applySimulatedMarketOrder(account, {
      ...input.ids,
      accountId: account.accountId,
      quantity: input.quantity,
      quote: toQuoteSnapshot(input.asset, input.submittedAt),
      side: input.side,
      submittedAt: input.submittedAt,
      symbol: input.asset.symbol,
    });
    const ledgerEntry = result.ledgerEntries[0];

    return {
      canSubmit: true,
      cashAfterCents: result.account.virtualCashCents,
      cashBeforeCents: account.virtualCashCents,
      estimatedNotionalCents: result.fill.notionalCents,
      ledgerEffectCents: ledgerEntry?.amountCents ?? ledgerEffectCents,
      positionAfterQuantity: getPositionQuantity(result.account.positions, symbol),
      positionBeforeQuantity,
      warningMessages: previewWarnings(input, account.virtualCashCents, result.fill.notionalCents),
    };
  } catch (error) {
    return {
      blockingReason: blockingReason(error),
      canSubmit: false,
      cashAfterCents: account.virtualCashCents + ledgerEffectCents,
      cashBeforeCents: account.virtualCashCents,
      estimatedNotionalCents,
      ledgerEffectCents,
      positionAfterQuantity: fallbackPositionAfterQuantity,
      positionBeforeQuantity,
      warningMessages: previewWarnings(input, account.virtualCashCents, estimatedNotionalCents),
    };
  }
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
