export type SimulatedOrderSide = "buy" | "sell";
export type SimulatedOrderType = "market";
export type SimulatedOrderStatus = "filled";
export type VirtualCurrencyCode = "USD";
export type SimulatedLedgerEntryType = "virtual_cash_debit" | "virtual_cash_credit";

export type SimulatedQuoteSnapshot = {
  symbol: string;
  bidPriceCents: number | null;
  askPriceCents: number | null;
  lastPriceCents: number;
  asOf: string;
  source: string;
  feedLabel?: string;
};

export type SimulatedPosition = {
  symbol: string;
  quantity: number;
  averageCostCents: number;
};

export type SimulatedAccountState = {
  accountId: string;
  currency: VirtualCurrencyCode;
  virtualCashCents: number;
  positions: SimulatedPosition[];
};

export type SimulatedMarketOrderRequest = {
  orderId: string;
  fillId: string;
  ledgerEntryId: string;
  accountId: string;
  symbol: string;
  side: SimulatedOrderSide;
  quantity: number;
  submittedAt: string;
  quote: SimulatedQuoteSnapshot;
};

export type SimulatedOrder = {
  id: string;
  accountId: string;
  symbol: string;
  side: SimulatedOrderSide;
  orderType: SimulatedOrderType;
  quantity: number;
  status: SimulatedOrderStatus;
  submittedAt: string;
  filledAt: string;
  quote: SimulatedQuoteSnapshot;
};

export type SimulatedFill = {
  id: string;
  orderId: string;
  accountId: string;
  symbol: string;
  side: SimulatedOrderSide;
  quantity: number;
  priceCents: number;
  notionalCents: number;
  filledAt: string;
  quote: SimulatedQuoteSnapshot;
};

export type SimulatedLedgerEntry = {
  id: string;
  accountId: string;
  orderId: string;
  fillId: string;
  type: SimulatedLedgerEntryType;
  currency: VirtualCurrencyCode;
  amountCents: number;
  balanceAfterCents: number;
  occurredAt: string;
};

export type SimulatedMarketOrderResult = {
  account: SimulatedAccountState;
  order: SimulatedOrder;
  fill: SimulatedFill;
  ledgerEntries: SimulatedLedgerEntry[];
};

export type SimulatedTradingErrorCode =
  | "ACCOUNT_MISMATCH"
  | "INSUFFICIENT_VIRTUAL_FUNDS"
  | "INSUFFICIENT_POSITION"
  | "INVALID_ORDER"
  | "INVALID_QUOTE";

export class SimulatedTradingError extends Error {
  code: SimulatedTradingErrorCode;

  constructor(code: SimulatedTradingErrorCode, message: string) {
    super(message);
    this.name = "SimulatedTradingError";
    this.code = code;
  }
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function assertPositiveNumber(value: number, code: SimulatedTradingErrorCode, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new SimulatedTradingError(code, `${label} must be greater than zero.`);
  }
}

function assertPositiveCents(
  value: number | null,
  code: SimulatedTradingErrorCode,
  label: string,
): asserts value is number {
  if (value === null || !Number.isInteger(value) || value <= 0) {
    throw new SimulatedTradingError(code, `${label} must be a positive cent amount.`);
  }
}

function roundQuantity(quantity: number) {
  return Math.round(quantity * 1_000_000) / 1_000_000;
}

function getExecutionPriceCents(side: SimulatedOrderSide, quote: SimulatedQuoteSnapshot): number {
  const quotedPrice = side === "buy" ? quote.askPriceCents : quote.bidPriceCents;

  if (quotedPrice !== null && Number.isInteger(quotedPrice) && quotedPrice > 0) {
    return quotedPrice;
  }

  assertPositiveCents(quote.lastPriceCents, "INVALID_QUOTE", "lastPriceCents");
  return quote.lastPriceCents;
}

function getPosition(positions: SimulatedPosition[], symbol: string) {
  return positions.find((position) => normalizeSymbol(position.symbol) === symbol);
}

function upsertBoughtPosition(positions: SimulatedPosition[], symbol: string, quantity: number, notionalCents: number) {
  const existing = getPosition(positions, symbol);

  if (!existing) {
    return [
      ...positions,
      {
        symbol,
        quantity,
        averageCostCents: Math.round(notionalCents / quantity),
      },
    ];
  }

  const nextQuantity = roundQuantity(existing.quantity + quantity);
  const existingCostCents = existing.averageCostCents * existing.quantity;
  const nextAverageCostCents = Math.round((existingCostCents + notionalCents) / nextQuantity);

  return positions.map((position) =>
    normalizeSymbol(position.symbol) === symbol
      ? {
          symbol,
          quantity: nextQuantity,
          averageCostCents: nextAverageCostCents,
        }
      : position,
  );
}

function applySoldPosition(positions: SimulatedPosition[], symbol: string, quantity: number) {
  const existing = getPosition(positions, symbol);

  if (!existing || existing.quantity + 0.000001 < quantity) {
    throw new SimulatedTradingError("INSUFFICIENT_POSITION", "Cannot sell more units than the simulated position holds.");
  }

  const nextQuantity = roundQuantity(existing.quantity - quantity);

  if (nextQuantity <= 0) {
    return positions.filter((position) => normalizeSymbol(position.symbol) !== symbol);
  }

  return positions.map((position) =>
    normalizeSymbol(position.symbol) === symbol
      ? {
          ...position,
          symbol,
          quantity: nextQuantity,
        }
      : position,
  );
}

function validateRequest(account: SimulatedAccountState, request: SimulatedMarketOrderRequest) {
  if (account.accountId !== request.accountId) {
    throw new SimulatedTradingError("ACCOUNT_MISMATCH", "Order accountId must match the simulated account.");
  }

  const symbol = normalizeSymbol(request.symbol);
  const quoteSymbol = normalizeSymbol(request.quote.symbol);

  if (!request.orderId || !request.fillId || !request.ledgerEntryId || !symbol) {
    throw new SimulatedTradingError("INVALID_ORDER", "Simulated order identifiers and symbol are required.");
  }

  if (symbol !== quoteSymbol) {
    throw new SimulatedTradingError("INVALID_QUOTE", "Quote symbol must match the simulated order symbol.");
  }

  assertPositiveNumber(request.quantity, "INVALID_ORDER", "quantity");
  assertPositiveCents(request.quote.lastPriceCents, "INVALID_QUOTE", "lastPriceCents");

  return symbol;
}

export function applySimulatedMarketOrder(
  account: SimulatedAccountState,
  request: SimulatedMarketOrderRequest,
): SimulatedMarketOrderResult {
  const symbol = validateRequest(account, request);
  const quantity = roundQuantity(request.quantity);
  const priceCents = getExecutionPriceCents(request.side, request.quote);
  const notionalCents = Math.round(priceCents * quantity);

  assertPositiveCents(notionalCents, "INVALID_ORDER", "notionalCents");

  if (request.side === "buy" && account.virtualCashCents < notionalCents) {
    throw new SimulatedTradingError(
      "INSUFFICIENT_VIRTUAL_FUNDS",
      "Simulated account has insufficient virtual funds for this order.",
    );
  }

  const cashDeltaCents = request.side === "buy" ? -notionalCents : notionalCents;
  const nextPositions =
    request.side === "buy"
      ? upsertBoughtPosition(account.positions, symbol, quantity, notionalCents)
      : applySoldPosition(account.positions, symbol, quantity);
  const nextCashCents = account.virtualCashCents + cashDeltaCents;
  const quote = {
    ...request.quote,
    symbol,
  };
  const order: SimulatedOrder = {
    id: request.orderId,
    accountId: account.accountId,
    symbol,
    side: request.side,
    orderType: "market",
    quantity,
    status: "filled",
    submittedAt: request.submittedAt,
    filledAt: request.submittedAt,
    quote,
  };
  const fill: SimulatedFill = {
    id: request.fillId,
    orderId: order.id,
    accountId: account.accountId,
    symbol,
    side: request.side,
    quantity,
    priceCents,
    notionalCents,
    filledAt: request.submittedAt,
    quote,
  };
  const ledgerEntry: SimulatedLedgerEntry = {
    id: request.ledgerEntryId,
    accountId: account.accountId,
    orderId: order.id,
    fillId: fill.id,
    type: request.side === "buy" ? "virtual_cash_debit" : "virtual_cash_credit",
    currency: account.currency,
    amountCents: cashDeltaCents,
    balanceAfterCents: nextCashCents,
    occurredAt: request.submittedAt,
  };

  return {
    account: {
      ...account,
      virtualCashCents: nextCashCents,
      positions: nextPositions,
    },
    order,
    fill,
    ledgerEntries: [ledgerEntry],
  };
}
