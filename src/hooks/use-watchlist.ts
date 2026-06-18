import { useMemo, useSyncExternalStore } from "react";

import { holdings, watchlistAssets, type EquityAsset } from "@/data/portfolio";

const assetUniverse = new Map<string, EquityAsset>();

for (const asset of [...watchlistAssets, ...holdings]) {
  if (!assetUniverse.has(asset.symbol.toUpperCase())) {
    assetUniverse.set(asset.symbol.toUpperCase(), asset);
  }
}

let watchlistSymbols = new Set(watchlistAssets.map((asset) => asset.symbol.toUpperCase()));
let revision = 0;
const listeners = new Set<() => void>();

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
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function isWatchlisted(symbol: string) {
  return watchlistSymbols.has(symbol.toUpperCase());
}

export function toggleWatchlist(symbol: string) {
  const normalized = symbol.toUpperCase();
  const nextSymbols = new Set(watchlistSymbols);

  if (nextSymbols.has(normalized)) {
    nextSymbols.delete(normalized);
  } else {
    nextSymbols.add(normalized);
  }

  watchlistSymbols = nextSymbols;
  emitChange();

  return nextSymbols.has(normalized);
}

export function useWatchlistStatus(symbol: string | undefined) {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const normalized = symbol?.toUpperCase();

  return {
    isWatchlisted: normalized ? watchlistSymbols.has(normalized) : false,
    toggle: () => (normalized ? toggleWatchlist(normalized) : false),
  };
}

export function useWatchlistAssets() {
  const currentRevision = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(
    () =>
      Array.from(watchlistSymbols)
        .map((symbol) => assetUniverse.get(symbol))
        .filter((asset): asset is EquityAsset => Boolean(asset)),
    [currentRevision],
  );
}

export function useWatchlistAssetUniverse() {
  return useMemo(() => Array.from(assetUniverse.values()), []);
}
