export type MarketCategory = "forex" | "indices" | "commodities" | "crypto";

export type Sentiment = "bullish" | "neutral" | "bearish";

export type MarketStatus = "open" | "closed" | "volatile";

export type Instrument = {
  symbol: string;
  displayName: string;
  category: MarketCategory;
  categoryLabel: string;
  price: number;
  change: number;
  changePercent: number;
  spreadRaw: number;
  spreadStandard: number;
  leverage: string;
  sparkline: number[];
  sentiment: Sentiment;
  marketStatus: MarketStatus;
  insightTitle: string;
  insightBody: string;
};

export const categories: Array<{ label: string; value: MarketCategory }> = [
  { label: "Forex", value: "forex" },
  { label: "Indices", value: "indices" },
  { label: "Commodities", value: "commodities" },
  { label: "Crypto", value: "crypto" },
];

export const instruments: Instrument[] = [
  {
    symbol: "XAUUSD",
    displayName: "Gold vs US Dollar",
    category: "commodities",
    categoryLabel: "Commodities",
    price: 2342.18,
    change: 22.14,
    changePercent: 0.94,
    spreadRaw: 1.2,
    spreadStandard: 1.6,
    leverage: "1:200",
    sparkline: [42, 43, 42.4, 44, 45.2, 44.8, 46.1, 47.3, 48.2, 47.9, 49.4, 50.2, 49.8, 51.1, 52.3, 53.1],
    sentiment: "bullish",
    marketStatus: "open",
    insightTitle: "Gold stays bid in the mock session",
    insightBody: "The demo view highlights XAUUSD as a defensive mover with a steady intraday climb and a slightly wider spread profile than major FX pairs.",
  },
  {
    symbol: "EURUSD",
    displayName: "Euro / US Dollar",
    category: "forex",
    categoryLabel: "Forex",
    price: 1.0864,
    change: 0.0031,
    changePercent: 0.29,
    spreadRaw: 0.0,
    spreadStandard: 1.0,
    leverage: "1:500",
    sparkline: [21, 20.8, 21.2, 21.5, 21.3, 21.7, 22, 22.1, 21.9, 22.5, 22.7, 22.6, 23.1, 23.2, 23.4, 23.7],
    sentiment: "bullish",
    marketStatus: "open",
    insightTitle: "Major FX remains stable",
    insightBody: "EURUSD is presented as a low-spread scanning row, useful for showing how dense quote data can stay readable on small devices.",
  },
  {
    symbol: "GBPUSD",
    displayName: "British Pound / US Dollar",
    category: "forex",
    categoryLabel: "Forex",
    price: 1.2728,
    change: -0.0042,
    changePercent: -0.33,
    spreadRaw: 0.1,
    spreadStandard: 1.1,
    leverage: "1:500",
    sparkline: [31, 31.4, 31.1, 30.9, 31.2, 30.8, 30.1, 29.9, 30.2, 29.7, 29.1, 29.4, 28.9, 28.4, 28.7, 28.2],
    sentiment: "bearish",
    marketStatus: "open",
    insightTitle: "Sterling softens in the mock tape",
    insightBody: "The downward sparkline makes the red movement state visible without turning the row into an alert-heavy interface.",
  },
  {
    symbol: "USDJPY",
    displayName: "US Dollar / Japanese Yen",
    category: "forex",
    categoryLabel: "Forex",
    price: 156.82,
    change: 0.41,
    changePercent: 0.26,
    spreadRaw: 0.2,
    spreadStandard: 1.2,
    leverage: "1:500",
    sparkline: [18, 18.2, 18.6, 18.4, 18.8, 19.1, 19.4, 19.2, 19.7, 20, 19.9, 20.4, 20.1, 20.6, 20.9, 21.1],
    sentiment: "bullish",
    marketStatus: "volatile",
    insightTitle: "Yen pair shows higher sensitivity",
    insightBody: "The volatile status gives the detail screen a useful state for caution styling and market-status labeling.",
  },
  {
    symbol: "NDX100",
    displayName: "Nasdaq 100 Index",
    category: "indices",
    categoryLabel: "Indices",
    price: 18432.7,
    change: 118.4,
    changePercent: 0.65,
    spreadRaw: 1.0,
    spreadStandard: 1.4,
    leverage: "1:200",
    sparkline: [61, 60.4, 61.2, 62.3, 62.8, 63.1, 62.7, 63.6, 64.4, 65.2, 65.1, 66.4, 66.2, 67.3, 68.1, 69],
    sentiment: "bullish",
    marketStatus: "open",
    insightTitle: "Growth index leads the mock board",
    insightBody: "NDX100 is useful for testing larger prices, tabular numerals, and chart scaling across compact row and detail views.",
  },
  {
    symbol: "US30",
    displayName: "Dow Jones 30 Index",
    category: "indices",
    categoryLabel: "Indices",
    price: 39022.4,
    change: -82.2,
    changePercent: -0.21,
    spreadRaw: 2.4,
    spreadStandard: 2.8,
    leverage: "1:200",
    sparkline: [74, 73.8, 74.2, 73.3, 72.9, 73.4, 72.6, 72.1, 71.8, 72.2, 71.7, 71.1, 70.8, 71, 70.2, 69.8],
    sentiment: "bearish",
    marketStatus: "open",
    insightTitle: "US30 fades from session high",
    insightBody: "The mocked index row demonstrates how negative movement can remain calm and professional rather than alarmist.",
  },
  {
    symbol: "USOUSD",
    displayName: "US Oil vs US Dollar",
    category: "commodities",
    categoryLabel: "Commodities",
    price: 78.42,
    change: -1.18,
    changePercent: -1.48,
    spreadRaw: 0.4,
    spreadStandard: 0.6,
    leverage: "1:100",
    sparkline: [39, 38.4, 38.8, 38.1, 37.5, 37.9, 36.8, 36.2, 36.5, 35.7, 35.1, 35.3, 34.6, 34.1, 33.8, 33.4],
    sentiment: "bearish",
    marketStatus: "volatile",
    insightTitle: "Oil carries the strongest mock decline",
    insightBody: "This instrument stress-tests larger negative percentages and the volatility status in both the home list and detail chart.",
  },
  {
    symbol: "BTCUSD",
    displayName: "Bitcoin / US Dollar",
    category: "crypto",
    categoryLabel: "Crypto",
    price: 67280.5,
    change: 942.8,
    changePercent: 1.42,
    spreadRaw: 8.5,
    spreadStandard: 10.0,
    leverage: "1:20",
    sparkline: [52, 51.4, 52.8, 53.2, 54.9, 54.1, 55.4, 56.8, 56.1, 57.4, 58.6, 59.1, 58.3, 60.4, 61.2, 62.8],
    sentiment: "bullish",
    marketStatus: "open",
    insightTitle: "Crypto adds contrast to the board",
    insightBody: "BTCUSD gives the demo a high-price, high-spread row while keeping the product language clearly separated from real trading.",
  },
];

export const watchlistSymbols = ["XAUUSD", "EURUSD", "NDX100", "USOUSD", "BTCUSD"];

export const marketSummary = {
  watchlistMove: 0.62,
  volatility: "Medium",
  topMover: "BTCUSD",
};

export const insights = [
  {
    id: "risk",
    label: "Risk note",
    title: "Keep leverage visible, not hidden",
    body: "The demo surfaces leverage and spread values beside price movement so reviewers can see how financial context is handled in compact UI.",
    tone: "warning" as const,
  },
  {
    id: "ux",
    label: "UX pattern",
    title: "Scan first, inspect second",
    body: "The market home favors rows and quick filters, while the detail screen handles chart range, stats, and longer explanation.",
    tone: "positive" as const,
  },
  {
    id: "delivery",
    label: "Delivery",
    title: "Best interview link is Expo web",
    body: "A Vercel-hosted Expo web build is easier for email recipients than asking them to install Expo Go before reviewing the work.",
    tone: "neutral" as const,
  },
];

export function getInstrumentBySymbol(symbol: string) {
  return instruments.find((instrument) => instrument.symbol.toLowerCase() === symbol.toLowerCase());
}
