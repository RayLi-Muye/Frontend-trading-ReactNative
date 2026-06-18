import { accountSummary, marketIndexes, watchlistAssets, type EquityAsset } from "@/data/portfolio";
import { formatPercent } from "@/utils/format";

export type DemoMarketBriefTone = "positive" | "negative" | "neutral";

export type DemoMarketBriefPoint = {
  label: string;
  value: string;
  detail: string;
  tone: DemoMarketBriefTone;
};

export type DemoMarketBrief = {
  id: string;
  provider: "local-demo";
  generatedAtLabel: string;
  headline: string;
  summary: string;
  focusPoints: DemoMarketBriefPoint[];
  riskNotes: string[];
  disclosure: string;
};

type DemoMarketBriefInput = {
  assets: EquityAsset[];
  generatedAtLabel: string;
  indexes: typeof marketIndexes;
};

export type MarketBriefProvider = {
  id: "local-demo";
  label: string;
  createBrief: (input?: Partial<DemoMarketBriefInput>) => DemoMarketBrief;
};

const notFinancialAdviceDisclosure =
  "Not financial advice: educational market context only. This does not recommend buying, selling, holding, timing, or allocating to any security.";

function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
}

function averageChangePercent(items: Array<{ changePercent: number }>) {
  if (items.length === 0) {
    return 0;
  }

  return roundPercent(items.reduce((total, item) => total + item.changePercent, 0) / items.length);
}

function getTopMover(assets: EquityAsset[]) {
  return [...assets].sort((a, b) => b.changePercent - a.changePercent)[0];
}

function getPressureMover(assets: EquityAsset[]) {
  return [...assets].sort((a, b) => a.changePercent - b.changePercent)[0];
}

function getPositiveBreadth(assets: EquityAsset[]) {
  return assets.filter((asset) => asset.changePercent >= 0).length;
}

export const demoMarketBriefProvider: MarketBriefProvider = {
  id: "local-demo",
  label: "Local demo",
  createBrief(input = {}) {
    const assets = input.assets ?? watchlistAssets;
    const indexes = input.indexes ?? marketIndexes;
    const generatedAtLabel = input.generatedAtLabel ?? accountSummary.lastUpdated;
    const topMover = getTopMover(assets);
    const pressureMover = getPressureMover(assets);
    const positiveBreadth = getPositiveBreadth(assets);
    const assetBreadth = `${positiveBreadth}/${assets.length}`;
    const averageIndexChange = averageChangePercent(indexes);
    const averageAssetChange = averageChangePercent(assets);
    const hasRiskOnTone = averageAssetChange >= averageIndexChange;

    return {
      id: "demo-market-brief-local",
      provider: "local-demo",
      generatedAtLabel,
      headline: hasRiskOnTone ? "Demo risk appetite is led by higher-beta movers" : "Demo index tone is steadier than single-name moves",
      summary: `${assetBreadth} demo instruments are positive, while the index strip averages ${formatPercent(averageIndexChange)}. Use this as market context for the simulator, not as a trade instruction.`,
      focusPoints: [
        {
          detail: "Largest positive move in the local demo watchlist.",
          label: "Leadership",
          tone: "positive",
          value: `${topMover.symbol} ${formatPercent(topMover.changePercent)}`,
        },
        {
          detail: "Largest downside move in the local demo watchlist.",
          label: "Pressure",
          tone: "negative",
          value: `${pressureMover.symbol} ${formatPercent(pressureMover.changePercent)}`,
        },
        {
          detail: "Positive instruments across the local demo watchlist.",
          label: "Breadth",
          tone: positiveBreadth > assets.length / 2 ? "positive" : "neutral",
          value: assetBreadth,
        },
      ],
      riskNotes: [
        "Large single-name and crypto moves can make simulated portfolio changes feel larger than broad index moves.",
        "Demo quotes are static local data with lightweight animation, so source freshness must be explicit before production use.",
      ],
      disclosure: notFinancialAdviceDisclosure,
    };
  },
};

export function createDemoMarketBrief(input?: Partial<DemoMarketBriefInput>) {
  return demoMarketBriefProvider.createBrief(input);
}
