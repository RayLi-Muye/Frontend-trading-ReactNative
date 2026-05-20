import { useMemo, useSyncExternalStore } from "react";

import {
  accountSummary as initialAccountSummary,
  holdings as initialHoldings,
  walletAccounts as initialWalletAccounts,
  type EquityAsset,
  type Holding,
  type WalletAccount,
} from "@/data/portfolio";

const holdingsStorageKey = "market-demo-portfolio-holdings-v1";
const accountsStorageKey = "market-demo-wallet-accounts-v1";
const tradeDateLabel = "Today";
let revision = 0;
const listeners = new Set<() => void>();

export type DemoAccountSummary = typeof initialAccountSummary;

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

function persistDemoState() {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(holdingsStorageKey, JSON.stringify(portfolioHoldings));
    localStorage.setItem(accountsStorageKey, JSON.stringify(walletAccountState));
  } catch {
    // In private browsing or restricted storage contexts, the in-memory demo store still works.
  }
}

let portfolioHoldings = loadStoredHoldings();
let walletAccountState = loadStoredWalletAccounts();

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

function adjustUsdCash(delta: number) {
  adjustWalletCash("USD", delta);
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

function createHolding(asset: EquityAsset, units: number): Holding {
  const tradePrice = asset.ask > 0 ? asset.ask : asset.price;

  return {
    ...asset,
    dateLabel: tradeDateLabel,
    pnl: 0,
    units,
    value: roundCurrency(tradePrice * units),
  };
}

export function buyPortfolioAsset(asset: EquityAsset, units = 1) {
  const normalized = asset.symbol.toUpperCase();
  const tradePrice = asset.ask > 0 ? asset.ask : asset.price;
  const tradeCost = roundCurrency(tradePrice * units);
  const usdAccount = getUsdAccount();
  let nextHolding: Holding | undefined;

  if (tradeCost <= 0 || !usdAccount || usdAccount.available + 0.005 < tradeCost) {
    return undefined;
  }

  portfolioHoldings = portfolioHoldings.map((holding) => {
    if (holding.symbol.toUpperCase() !== normalized) {
      return holding;
    }

    nextHolding = {
      ...holding,
      ask: asset.ask,
      bid: asset.bid,
      change: asset.change,
      changePercent: asset.changePercent,
      price: asset.price,
      sparkline: asset.sparkline,
      units: roundCurrency(holding.units + units),
      value: roundCurrency(holding.value + tradePrice * units),
    };
    return nextHolding;
  });

  if (!nextHolding) {
    nextHolding = createHolding(asset, units);
    portfolioHoldings = [...portfolioHoldings, nextHolding];
  }

  adjustUsdCash(-tradeCost);
  emitChange();
  return nextHolding;
}

export function sellPortfolioAsset(symbol: string, units = 1, executionPrice?: number) {
  const normalized = symbol.toUpperCase();
  let nextHolding: Holding | undefined;
  let proceeds = 0;
  let changed = false;

  portfolioHoldings = portfolioHoldings.flatMap((holding) => {
    if (holding.symbol.toUpperCase() !== normalized) {
      return [holding];
    }

    changed = true;
    const sellUnits = Math.min(units, holding.units);
    const tradePrice = executionPrice && executionPrice > 0 ? executionPrice : holding.bid > 0 ? holding.bid : holding.price;
    proceeds = roundCurrency(tradePrice * sellUnits);
    const remainingUnits = roundCurrency(holding.units - sellUnits);

    if (remainingUnits <= 0) {
      return [];
    }

    nextHolding = {
      ...holding,
      units: remainingUnits,
      value: roundCurrency(holding.price * remainingUnits),
    };
    return [nextHolding];
  });

  if (changed) {
    adjustUsdCash(proceeds);
    emitChange();
  }

  return nextHolding;
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
