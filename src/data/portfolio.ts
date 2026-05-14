export type EquityAsset = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  logoLabel: string;
  logoBackground: string;
  logoColor: string;
  sparkline: number[];
};

export type Holding = EquityAsset & {
  dateLabel: string;
  pnl: number;
  value: number;
  units: number;
};

export type WalletAccount = {
  code: string;
  name: string;
  balance: number;
  available: number;
  accent: string;
};

export const accountSummary = {
  totalValue: 23234.09,
  totalChange: -11.97,
  totalChangePercent: -0.05,
  lastUpdated: "10:31, 14/05/2026",
  availableCash: 3660.39,
  buyingPower: 7320.78,
  investmentValue: 19573.7,
};

export const homeCurve = [38, 41, 45, 52, 56, 57, 57, 57, 56.5, 58, 58.4, 55.2, 56.8, 56.8, 56.9, 58.1, 58.9, 59.3, 57.6, 59.7, 59.7, 59.8, 61.1, 60.8, 61.4, 63.6, 63.2, 63.2, 63.2, 62.4];

export const marketIndexes = [
  { symbol: "SPX500", value: 7456.91, changePercent: 0.07 },
  { symbol: "NAS100", value: 21482.37, changePercent: 0.18 },
  { symbol: "BTC", value: 79623.15, changePercent: 0.36 },
  { symbol: "DJ30", value: 49798.55, changePercent: 0.01 },
  { symbol: "SHCOMP", value: 3418.42, changePercent: -0.12 },
  { symbol: "HK50", value: 19724.83, changePercent: 0.22 },
  { symbol: "GER40", value: 18642.51, changePercent: -0.04 },
  { symbol: "FTSE100", value: 8264.17, changePercent: 0.09 },
  { symbol: "XAUUSD", value: 2341.62, changePercent: -0.16 },
];

export const movers = [
  {
    symbol: "FLR",
    name: "Fluor Corp",
    value: 1.18,
    logoLabel: "F",
    logoBackground: "#ef2f7b",
    logoColor: "#ffffff",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    value: 1.1,
    logoLabel: "N",
    logoBackground: "#b7ef00",
    logoColor: "#ffffff",
  },
  {
    symbol: "CASH",
    name: "USD idle",
    value: 0.42,
    logoLabel: "$",
    logoBackground: "#eff2f7",
    logoColor: "#98a2b3",
  },
];

export const watchlistAssets: EquityAsset[] = [
  {
    symbol: "SNDK",
    name: "Sandisk",
    price: 1446.81,
    change: -4.8,
    changePercent: -0.33,
    bid: 1446.52,
    ask: 1447,
    logoLabel: "S",
    logoBackground: "#ffffff",
    logoColor: "#f04438",
    sparkline: [52, 51.2, 51.5, 50.8, 50.1, 50.6, 49.9, 49.2],
  },
  {
    symbol: "ORCL",
    name: "Oracle",
    price: 190.31,
    change: 0.49,
    changePercent: 0.26,
    bid: 190.25,
    ask: 190.38,
    logoLabel: "ORCL",
    logoBackground: "#f22f2b",
    logoColor: "#ffffff",
    sparkline: [31, 31.2, 31.6, 31.5, 31.9, 32.1, 32.4, 32.3],
  },
  {
    symbol: "INTC",
    name: "Intel",
    price: 119.34,
    change: -0.98,
    changePercent: -0.81,
    bid: 119.31,
    ask: 119.37,
    logoLabel: "intel",
    logoBackground: "#2b82c9",
    logoColor: "#ffffff",
    sparkline: [24, 23.8, 23.1, 23.4, 22.8, 22.3, 22.5, 21.9],
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    price: 616.99,
    change: 13.63,
    changePercent: 2.26,
    bid: 616.91,
    ask: 617.07,
    logoLabel: "M",
    logoBackground: "#ffffff",
    logoColor: "#2674d9",
    sparkline: [42, 43.2, 44.1, 44.5, 45.6, 46.2, 47.4, 48.8],
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    price: 446.19,
    change: 0.54,
    changePercent: 0.12,
    bid: 446.04,
    ask: 446.34,
    logoLabel: "AMD",
    logoBackground: "#303236",
    logoColor: "#ffffff",
    sparkline: [33, 33.4, 33.1, 33.6, 33.5, 33.7, 33.9, 34],
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: 403.88,
    change: -1.38,
    changePercent: -0.34,
    bid: 403.83,
    ask: 403.92,
    logoLabel: "MS",
    logoBackground: "#ffffff",
    logoColor: "#f5a623",
    sparkline: [44, 43.9, 43.5, 43.8, 43.2, 42.9, 43, 42.6],
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    price: 228.34,
    change: 2.49,
    changePercent: 1.1,
    bid: 228.31,
    ask: 228.34,
    logoLabel: "N",
    logoBackground: "#b7ef00",
    logoColor: "#ffffff",
    sparkline: [28, 28.2, 28.6, 29.2, 29.5, 30.1, 30.4, 30.9],
  },
  {
    symbol: "FLR",
    name: "Fluor Corp",
    price: 0.0087,
    change: 0.0001,
    changePercent: 1.18,
    bid: 0.0086,
    ask: 0.0087,
    logoLabel: "F",
    logoBackground: "#ef2f7b",
    logoColor: "#ffffff",
    sparkline: [8, 8.1, 8.3, 8.2, 8.5, 8.8, 8.7, 9.1],
  },
  {
    symbol: "NFLX",
    name: "Netflix",
    price: 1092.42,
    change: -14.12,
    changePercent: -1.28,
    bid: 1092.18,
    ask: 1092.66,
    logoLabel: "N",
    logoBackground: "#111827",
    logoColor: "#e50914",
    sparkline: [68, 67.6, 67.2, 66.8, 66.1, 65.9, 65.2, 64.8],
  },
];

export const holdings: Holding[] = [
  {
    ...watchlistAssets[5],
    dateLabel: "24/5",
    pnl: -2809.35,
    value: 9206.17,
    units: 22.8,
  },
  {
    symbol: "AAPL",
    name: "Apple",
    price: 298.68,
    change: -0.18,
    changePercent: -0.06,
    bid: 298.62,
    ask: 298.74,
    dateLabel: "24/5",
    logoLabel: "A",
    logoBackground: "#667085",
    logoColor: "#ffffff",
    pnl: 391.58,
    value: 1473.94,
    units: 4.9,
    sparkline: [42, 42.2, 41.9, 41.7, 41.6, 41.8, 41.5, 41.4],
  },
  {
    symbol: "TTWO",
    name: "Take-Two",
    price: 227.33,
    change: 0.34,
    changePercent: 0.15,
    bid: 227.29,
    ask: 227.38,
    dateLabel: "24/5",
    logoLabel: "T2",
    logoBackground: "#ffffff",
    logoColor: "#111827",
    pnl: -247.93,
    value: 4627.45,
    units: 20.3,
    sparkline: [21, 21.2, 21.1, 21.4, 21.3, 21.5, 21.7, 21.8],
  },
  {
    symbol: "GOOG",
    name: "Alphabet",
    price: 400.1,
    change: 1.08,
    changePercent: 0.27,
    bid: 400.02,
    ask: 400.17,
    dateLabel: "24/5",
    logoLabel: "G",
    logoBackground: "#3aa0ff",
    logoColor: "#ffffff",
    pnl: 663.22,
    value: 3119.98,
    units: 7.8,
    sparkline: [31, 31.2, 31.1, 31.5, 31.8, 32, 32.2, 32.4],
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    price: 446.59,
    change: 1.34,
    changePercent: 0.3,
    bid: 446.49,
    ask: 446.68,
    dateLabel: "24/5",
    logoLabel: "TESLA",
    logoBackground: "#ff2839",
    logoColor: "#ffffff",
    pnl: 31.23,
    value: 1144.3,
    units: 2.5,
    sparkline: [46, 46.2, 46.1, 46.5, 46.7, 47.1, 47.2, 47.5],
  },
];

export const walletAccounts: WalletAccount[] = [
  {
    code: "USD",
    name: "USD Account",
    balance: 3660.39,
    available: 3660.39,
    accent: "#05b83f",
  },
  {
    code: "AUD",
    name: "AUD Account",
    balance: 0,
    available: 0,
    accent: "#0f4a73",
  },
  {
    code: "GBP",
    name: "GBP Account",
    balance: 0,
    available: 0,
    accent: "#243b70",
  },
];

export function getAssetBySymbol(symbol: string) {
  return [...watchlistAssets, ...holdings].find((asset) => asset.symbol.toLowerCase() === symbol.toLowerCase());
}
