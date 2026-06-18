import type { EquityAsset, Holding } from "../data/portfolio";

export type DemoWatchlistCompareRow = {
  changePercent: number;
  exposurePercent: number;
  holdingStatus: "Held" | "Not held";
  isHeld: boolean;
  name: string;
  positionValue: number;
  price: number;
  symbol: string;
  units: number;
};

export type DemoWatchlistCompare = {
  disclosure: string;
  emptyMessage: string;
  maxSymbols: number;
  minSymbols: number;
  rows: DemoWatchlistCompareRow[];
};

export type DemoWatchlistCompareInput = {
  assets: EquityAsset[];
  holdings: Holding[];
  maxSymbols?: number;
  minSymbols?: number;
  selectedSymbols: string[];
};

export const defaultDemoCompareSymbols = ["SNDK", "ORCL", "META", "NVDA", "MSFT"];

export const demoWatchlistCompareDisclosure =
  "Local watchlist comparison only. Not financial advice; prices and holdings are demo context with no real assets, broker routes, or live orders involved.";

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function uniqueSymbols(symbols: string[]) {
  const seen = new Set<string>();

  return symbols.flatMap((symbol) => {
    const normalized = normalizeSymbol(symbol);

    if (!normalized || seen.has(normalized)) {
      return [];
    }

    seen.add(normalized);
    return [normalized];
  });
}

export function createDemoWatchlistCompare(input: DemoWatchlistCompareInput): DemoWatchlistCompare {
  const minSymbols = input.minSymbols ?? 3;
  const maxSymbols = input.maxSymbols ?? 5;
  const assetsBySymbol = new Map(input.assets.map((asset) => [normalizeSymbol(asset.symbol), asset]));
  const holdingsBySymbol = new Map(input.holdings.map((holding) => [normalizeSymbol(holding.symbol), holding]));
  const portfolioValue = input.holdings.reduce((total, holding) => total + holding.value, 0);
  const selectedSymbols = uniqueSymbols(input.selectedSymbols)
    .filter((symbol) => assetsBySymbol.has(symbol))
    .slice(0, maxSymbols);

  return {
    disclosure: demoWatchlistCompareDisclosure,
    emptyMessage: "Select 3-5 demo symbols to compare local market context.",
    maxSymbols,
    minSymbols,
    rows: selectedSymbols.map((symbol) => {
      const asset = assetsBySymbol.get(symbol);
      const holding = holdingsBySymbol.get(symbol);
      const positionValue = roundCurrency(holding?.value ?? 0);

      return {
        changePercent: asset?.changePercent ?? 0,
        exposurePercent: holding && portfolioValue > 0 ? roundPercent((positionValue / portfolioValue) * 100) : 0,
        holdingStatus: holding ? "Held" : "Not held",
        isHeld: Boolean(holding),
        name: asset?.name ?? symbol,
        positionValue,
        price: asset?.price ?? 0,
        symbol,
        units: holding?.units ?? 0,
      };
    }),
  };
}
