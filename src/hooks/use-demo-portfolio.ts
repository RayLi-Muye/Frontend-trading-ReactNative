import { useMemo, useSyncExternalStore } from "react";

import {
  accountSummary as initialAccountSummary,
  holdings as initialHoldings,
  walletAccounts as initialWalletAccounts,
  type EquityAsset,
  type Holding,
  type WalletAccount,
} from "@/data/portfolio";
import type { SimulatedLedgerEntry } from "@/domain/simulated-trading";
import { applyDemoSimulatedMarketOrder } from "@/services/demo-simulated-trading";

const holdingsStorageKey = "market-demo-portfolio-holdings-v1";
const accountsStorageKey = "market-demo-wallet-accounts-v1";
const ledgerStorageKey = "market-demo-simulated-ledger-v1";
let revision = 0;
let tradeSequence = 0;
const listeners = new Set<() => void>();

export type DemoAccountSummary = typeof initialAccountSummary;
export type DemoPortfolioTradeResult = {
  fillNotional: number;
  holding?: Holding;
  ledgerEntry: SimulatedLedgerEntry;
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function cloneInitialHoldings() {
  return initialHoldings.map((holding) => ({ ...holding }));
}

function cloneInitialWalletAccounts() {
  return initialWalletAccounts.map((account) => ({ ...account }));
}

function isHolding(value: unknown): value is Holding {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Holding>;
  return (
    typeof candidate.symbol === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.price === "number" &&
    typeof candidate.units === "number" &&
    typeof candidate.value === "number" &&
    Array.isArray(candidate.sparkline)
  );
}

function isWalletAccount(value: unknown): value is WalletAccount {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<WalletAccount>;
  return (
    typeof candidate.code === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.balance === "number" &&
    typeof candidate.available === "number" &&
    typeof candidate.accent === "string"
  );
}

function isSimulatedLedgerEntry(value: unknown): value is SimulatedLedgerEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SimulatedLedgerEntry>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.accountId === "string" &&
    typeof candidate.orderId === "string" &&
    typeof candidate.fillId === "string" &&
    (candidate.type === "virtual_cash_debit" || candidate.type === "virtual_cash_credit") &&
    candidate.currency === "USD" &&
    typeof candidate.amountCents === "number" &&
    typeof candidate.balanceAfterCents === "number" &&
    typeof candidate.occurredAt === "string"
  );
}

function loadStoredHoldings() {
  if (typeof localStorage === "undefined") {
    return cloneInitialHoldings();
  }

  try {
    const stored = localStorage.getItem(holdingsStorageKey);

    if (!stored) {
      return cloneInitialHoldings();
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed) || !parsed.every(isHolding)) {
      return cloneInitialHoldings();
    }

    return parsed.map((holding) => ({ ...holding }));
  } catch {
    return cloneInitialHoldings();
  }
}

function loadStoredWalletAccounts() {
  if (typeof localStorage === "undefined") {
    return cloneInitialWalletAccounts();
  }

  try {
    const stored = localStorage.getItem(accountsStorageKey);

    if (!stored) {
      return cloneInitialWalletAccounts();
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed) || !parsed.every(isWalletAccount)) {
      return cloneInitialWalletAccounts();
    }

    return parsed.map((account) => ({ ...account }));
  } catch {
    return cloneInitialWalletAccounts();
  }
}

function loadStoredLedgerEntries() {
  if (typeof localStorage === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(ledgerStorageKey);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed) || !parsed.every(isSimulatedLedgerEntry)) {
      return [];
    }

    return parsed.map((entry) => ({ ...entry }));
  } catch {
    return [];
  }
}

function persistDemoState() {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(holdingsStorageKey, JSON.stringify(portfolioHoldings));
    localStorage.setItem(accountsStorageKey, JSON.stringify(walletAccountState));
    localStorage.setItem(ledgerStorageKey, JSON.stringify(simulatedLedgerEntries));
  } catch {
    // In private browsing or restricted storage contexts, the in-memory demo store still works.
  }
}

let portfolioHoldings = loadStoredHoldings();
let walletAccountState = loadStoredWalletAccounts();
let simulatedLedgerEntries = loadStoredLedgerEntries();

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return revision;
}

function emitChange() {
  persistDemoState();
  revision += 1;
  listeners.forEach((listener) => listener());
}

function getUsdAccount() {
  return walletAccountState.find((account) => account.code.toUpperCase() === "USD");
}

function getWalletAccount(code: string) {
  return walletAccountState.find((account) => account.code.toUpperCase() === code.toUpperCase());
}

function adjustWalletCash(code: string, delta: number) {
  let changed = false;

  walletAccountState = walletAccountState.map((account) => {
    if (account.code.toUpperCase() !== code.toUpperCase()) {
      return account;
    }

    changed = true;
    return {
      ...account,
      available: roundCurrency(account.available + delta),
      balance: roundCurrency(account.balance + delta),
    };
  });

  return changed;
}

function getHolding(symbol: string) {
  const normalized = symbol.toUpperCase();
  return portfolioHoldings.find((holding) => holding.symbol.toUpperCase() === normalized);
}

function createAccountSummary(): DemoAccountSummary {
  const availableCash = roundCurrency(walletAccountState.reduce((total, account) => total + account.available, 0));
  const investmentValue = roundCurrency(portfolioHoldings.reduce((total, holding) => total + holding.value, 0));
  const totalValue = roundCurrency(availableCash + investmentValue);

  return {
    ...initialAccountSummary,
    availableCash,
    buyingPower: roundCurrency(availableCash * 2),
    investmentValue,
    totalChangePercent: totalValue === 0 ? 0 : roundCurrency((initialAccountSummary.totalChange / totalValue) * 100),
    totalValue,
  };
}

function createDemoTradeIds(side: "buy" | "sell", symbol: string) {
  tradeSequence += 1;
  const normalized = symbol.toLowerCase();
  const suffix = `${Date.now()}-${tradeSequence}-${normalized}-${side}`;

  return {
    fillId: `demo-fill-${suffix}`,
    ledgerEntryId: `demo-ledger-${suffix}`,
    orderId: `demo-order-${suffix}`,
  };
}

function placeDemoSimulatedOrder(asset: EquityAsset, side: "buy" | "sell", units: number, executionPrice?: number): DemoPortfolioTradeResult | undefined {
  const normalized = asset.symbol.toUpperCase();
  const submittedAt = new Date().toISOString();
  const tradeAsset =
    executionPrice && executionPrice > 0
      ? {
          ...asset,
          ask: side === "buy" ? executionPrice : asset.ask,
          bid: side === "sell" ? executionPrice : asset.bid,
          price: executionPrice,
        }
      : asset;

  try {
    const result = applyDemoSimulatedMarketOrder(
      {
        holdings: portfolioHoldings,
        ledgerEntries: simulatedLedgerEntries,
        walletAccounts: walletAccountState,
      },
      {
        asset: tradeAsset,
        ids: createDemoTradeIds(side, normalized),
        quantity: units,
        side,
        submittedAt,
      },
    );
    const ledgerEntry = result.ledgerEntries[result.ledgerEntries.length - 1];

    if (!ledgerEntry) {
      return undefined;
    }

    portfolioHoldings = result.holdings;
    walletAccountState = result.walletAccounts;
    simulatedLedgerEntries = result.ledgerEntries;
    emitChange();

    return {
      fillNotional: result.fill.notionalCents / 100,
      holding: getHolding(normalized),
      ledgerEntry,
    };
  } catch {
    return undefined;
  }
}

export function buyPortfolioAsset(asset: EquityAsset, units = 1) {
  const tradePrice = asset.ask > 0 ? asset.ask : asset.price;
  const tradeCost = roundCurrency(tradePrice * units);
  const usdAccount = getUsdAccount();

  if (tradeCost <= 0 || !usdAccount || usdAccount.available + 0.005 < tradeCost) {
    return undefined;
  }

  return placeDemoSimulatedOrder(asset, "buy", units, tradePrice);
}

export function sellPortfolioAsset(symbol: string, units = 1, executionPrice?: number) {
  const normalized = symbol.toUpperCase();
  const holding = getHolding(normalized);

  if (!holding) {
    return undefined;
  }

  const tradePrice = executionPrice && executionPrice > 0 ? executionPrice : holding.bid > 0 ? holding.bid : holding.price;
  return placeDemoSimulatedOrder(holding, "sell", units, tradePrice);
}

export function resetDemoState() {
  portfolioHoldings = cloneInitialHoldings();
  walletAccountState = cloneInitialWalletAccounts();
  simulatedLedgerEntries = [];
  tradeSequence = 0;
  emitChange();
}

export function depositWalletFunds(code: string, amount: number) {
  if (amount <= 0) {
    return undefined;
  }

  const changed = adjustWalletCash(code, amount);

  if (!changed) {
    return undefined;
  }

  emitChange();
  return getWalletAccount(code);
}

export function withdrawWalletFunds(code: string, amount: number) {
  const account = getWalletAccount(code);

  if (!account || amount <= 0 || account.available + 0.005 < amount) {
    return undefined;
  }

  adjustWalletCash(code, -amount);
  emitChange();
  return getWalletAccount(code);
}

export function transferWalletFunds(fromCode: string, toCode: string, amount: number) {
  const fromAccount = getWalletAccount(fromCode);
  const toAccount = getWalletAccount(toCode);

  if (!fromAccount || !toAccount || fromCode.toUpperCase() === toCode.toUpperCase() || amount <= 0 || fromAccount.available + 0.005 < amount) {
    return undefined;
  }

  adjustWalletCash(fromCode, -amount);
  adjustWalletCash(toCode, amount);
  emitChange();

  return {
    from: getWalletAccount(fromCode),
    to: getWalletAccount(toCode),
  };
}

export function usePortfolioHoldings() {
  const currentRevision = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => portfolioHoldings.map((holding) => ({ ...holding })), [currentRevision]);
}

export function useWalletAccounts() {
  const currentRevision = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => walletAccountState.map((account) => ({ ...account })), [currentRevision]);
}

export function useDemoAccountSummary() {
  const currentRevision = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => createAccountSummary(), [currentRevision]);
}

export function usePortfolioHolding(symbol: string | undefined) {
  const currentRevision = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const normalized = symbol?.toUpperCase();

  return useMemo(() => {
    if (!normalized) {
      return undefined;
    }

    const holding = portfolioHoldings.find((item) => item.symbol.toUpperCase() === normalized);
    return holding ? { ...holding } : undefined;
  }, [currentRevision, normalized]);
}

export function useLatestSimulatedLedgerEntry() {
  const currentRevision = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(() => {
    const entry = simulatedLedgerEntries[simulatedLedgerEntries.length - 1];
    return entry ? { ...entry } : undefined;
  }, [currentRevision]);
}

export function useRecentSimulatedLedgerEntries(limit = 3) {
  const currentRevision = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const normalizedLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;

  return useMemo(() => {
    if (normalizedLimit === 0) {
      return [];
    }

    return simulatedLedgerEntries.slice(-normalizedLimit).reverse().map((entry) => ({ ...entry }));
  }, [currentRevision, normalizedLimit]);
}
