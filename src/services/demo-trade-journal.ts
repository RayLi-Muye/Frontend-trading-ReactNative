import type { SimulatedLedgerEntry } from "../domain/simulated-trading";

export type DemoTradeJournalAction = "buy" | "sell";
export type DemoTradeJournalFilterValue = "all";

export type DemoTradeJournalFilter = {
  action?: DemoTradeJournalAction | DemoTradeJournalFilterValue;
  symbol?: string | DemoTradeJournalFilterValue;
};

export type DemoTradeJournalEntry = {
  action: DemoTradeJournalAction;
  balanceAfter: number;
  cashFlow: number;
  cashFlowLabel: string;
  id: string;
  positionImpact: string;
  recapPrompt: string;
  symbol: string;
};

export type DemoTradeJournal = {
  disclosure: string;
  emptyMessage: string;
  entries: DemoTradeJournalEntry[];
  filterOptions: {
    actions: DemoTradeJournalAction[];
    symbols: string[];
  };
};

export type DemoTradeJournalInput = {
  filter?: DemoTradeJournalFilter;
  ledgerEntries: SimulatedLedgerEntry[];
  limit?: number;
};

export const demoTradeJournalDisclosure =
  "Simulated trade journal only. Not financial advice; no real assets, broker routes, or live orders are involved.";

const emptyJournalMessage = "No simulated journal entries yet.";

function normalizeFilterSymbol(symbol: string | undefined) {
  const normalized = symbol?.trim();

  if (!normalized || normalized.toLowerCase() === "all") {
    return "all";
  }

  return normalized.toUpperCase();
}

function normalizeTradeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function normalizeAction(action: DemoTradeJournalFilter["action"]) {
  return action === "buy" || action === "sell" ? action : "all";
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function parseDemoOrder(entry: SimulatedLedgerEntry) {
  const match = entry.orderId.match(/^demo-order-\d+-\d+-([a-z0-9]+)-(buy|sell)$/i);

  if (!match) {
    return undefined;
  }

  return {
    action: match[2].toLowerCase() as DemoTradeJournalAction,
    symbol: normalizeTradeSymbol(match[1]),
  };
}

function uniqueValues<T extends string>(items: T[]) {
  return [...new Set(items)];
}

function createRecapPrompt(action: DemoTradeJournalAction) {
  return action === "buy"
    ? "Entry recap checklist: Why this symbol, why this size, and what would invalidate the idea?"
    : "Exit recap checklist: What changed, what did the trade teach, and would sizing change next time?";
}

function createPositionImpact(action: DemoTradeJournalAction, symbol: string) {
  return action === "buy"
    ? `${symbol} virtual position increased. Review sizing, concentration, and thesis before the next simulated trade.`
    : `${symbol} virtual position reduced or closed. Review exit rationale and what changed before the next simulated trade.`;
}

function createJournalEntry(entry: SimulatedLedgerEntry): DemoTradeJournalEntry | undefined {
  const order = parseDemoOrder(entry);

  if (!order) {
    return undefined;
  }

  const cashFlow = roundCurrency(entry.amountCents / 100);

  return {
    action: order.action,
    balanceAfter: roundCurrency(entry.balanceAfterCents / 100),
    cashFlow,
    cashFlowLabel: order.action === "buy" ? "Virtual cash flow debit" : "Virtual cash flow credit",
    id: entry.id,
    positionImpact: createPositionImpact(order.action, order.symbol),
    recapPrompt: createRecapPrompt(order.action),
    symbol: order.symbol,
  };
}

export function createDemoTradeJournal(input: DemoTradeJournalInput): DemoTradeJournal {
  const actionFilter = normalizeAction(input.filter?.action);
  const symbolFilter = normalizeFilterSymbol(input.filter?.symbol);
  const limit = Number.isFinite(input.limit) ? Math.max(0, Math.floor(input.limit ?? 0)) : 0;
  const allEntries = input.ledgerEntries
    .map(createJournalEntry)
    .filter((entry): entry is DemoTradeJournalEntry => Boolean(entry))
    .reverse();
  const filteredEntries = allEntries.filter((entry) => {
    const actionMatches = actionFilter === "all" || entry.action === actionFilter;
    const symbolMatches = symbolFilter === "all" || entry.symbol === symbolFilter;
    return actionMatches && symbolMatches;
  });

  return {
    disclosure: demoTradeJournalDisclosure,
    emptyMessage: emptyJournalMessage,
    entries: (limit > 0 ? filteredEntries.slice(0, limit) : filteredEntries).map((entry) => ({ ...entry })),
    filterOptions: {
      actions: uniqueValues(allEntries.map((entry) => entry.action)),
      symbols: uniqueValues(allEntries.map((entry) => entry.symbol)),
    },
  };
}
