import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { FilterPillBar } from "@/components/filter-pill-bar";
import { PageTitle } from "@/components/page-title";
import { PinnedAppHeaderScreen } from "@/components/pinned-app-header-screen";
import { ScreenScroll } from "@/components/screen-scroll";
import { WatchlistComparePanel } from "@/components/watchlist-compare-panel";
import { WatchlistQuoteRow } from "@/components/watchlist-quote-row";
import type { EquityAsset } from "@/data/portfolio";
import { colors, spacing } from "@/design/theme";
import { usePortfolioHoldings } from "@/hooks/use-demo-portfolio";
import { useLiveAssets } from "@/hooks/use-live-market";
import { useWatchlistAssets, useWatchlistAssetUniverse } from "@/hooks/use-watchlist";
import { createDemoWatchlistCompare, defaultDemoCompareSymbols } from "@/services/demo-watchlist-compare";

const watchlistFilters = [
  { id: "portfolio", label: "Portfolio" },
  { id: "open", label: "Open" },
  { id: "stocks", label: "Stocks" },
] as const;

type WatchlistFilterId = (typeof watchlistFilters)[number]["id"];

function matchesFilter(asset: EquityAsset, filterId: WatchlistFilterId, holdingSymbols: Set<string>) {
  if (filterId === "portfolio") {
    return holdingSymbols.has(asset.symbol.toUpperCase());
  }

  if (filterId === "open") {
    return asset.bid > 0 && asset.ask > 0;
  }

  return asset.assetClass !== "crypto";
}

export default function WatchlistScreen() {
  const watchlistAssets = useWatchlistAssets();
  const compareAssets = useWatchlistAssetUniverse();
  const portfolioHoldings = usePortfolioHoldings();
  const { assets, pulses } = useLiveAssets(watchlistAssets, { count: 3, intervalMs: 2000, scale: 0.0017 });
  const [selectedFilters, setSelectedFilters] = useState<WatchlistFilterId[]>([]);
  const [compareSymbols, setCompareSymbols] = useState(defaultDemoCompareSymbols);
  const holdingSymbols = useMemo(
    () => new Set(portfolioHoldings.map((holding) => holding.symbol.toUpperCase())),
    [portfolioHoldings],
  );
  const watchlistCompare = useMemo(
    () =>
      createDemoWatchlistCompare({
        assets: compareAssets,
        holdings: portfolioHoldings,
        selectedSymbols: compareSymbols,
      }),
    [compareAssets, compareSymbols, portfolioHoldings],
  );
  const visibleAssets = useMemo(() => {
    if (selectedFilters.length === 0) {
      return assets;
    }

    return assets.filter((asset) => selectedFilters.every((filterId) => matchesFilter(asset, filterId, holdingSymbols)));
  }, [assets, holdingSymbols, selectedFilters]);

  function toggleFilter(filterId: WatchlistFilterId) {
    setSelectedFilters((current) =>
      current.includes(filterId) ? current.filter((currentFilter) => currentFilter !== filterId) : [...current, filterId],
    );
  }

  function toggleCompareSymbol(symbol: string) {
    const normalized = symbol.toUpperCase();

    setCompareSymbols((current) => {
      if (current.includes(normalized)) {
        return current.length > watchlistCompare.minSymbols ? current.filter((item) => item !== normalized) : current;
      }

      return current.length < watchlistCompare.maxSymbols ? [...current, normalized] : current;
    });
  }

  return (
    <PinnedAppHeaderScreen>
      <ScreenScroll bottomInset={118}>
        <Animated.View entering={FadeInUp.duration(520).springify()} style={{ gap: spacing.xl }}>
          <PageTitle>Watch List</PageTitle>

          <FilterPillBar options={watchlistFilters} selectedIds={selectedFilters} onToggle={toggleFilter} />

          <WatchlistComparePanel
            assets={compareAssets}
            compare={watchlistCompare}
            onToggleSymbol={toggleCompareSymbol}
            selectedSymbols={compareSymbols}
          />
        </Animated.View>

        <View style={{ backgroundColor: colors.surface, marginHorizontal: -spacing.lg }}>
          <View
            style={{
              borderBottomColor: colors.line,
              borderBottomWidth: 1,
              flexDirection: "row",
              paddingBottom: spacing.md,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
            }}
          >
            <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 14, fontWeight: "600" }}>
              Market
            </Text>
            <Text selectable style={{ color: colors.muted, flex: 0.56, fontSize: 14, fontWeight: "600", textAlign: "center" }}>
              Sell
            </Text>
            <Text selectable style={{ color: colors.muted, flex: 0.56, fontSize: 14, fontWeight: "600", textAlign: "center" }}>
              Buy
            </Text>
          </View>

          {visibleAssets.map((asset) => (
            <WatchlistQuoteRow
              key={asset.symbol}
              asset={asset}
              hotSide={pulses[asset.symbol]?.direction === "down" ? "ask" : pulses[asset.symbol]?.direction === "up" ? "bid" : undefined}
              pulse={pulses[asset.symbol]}
            />
          ))}
        </View>
      </ScreenScroll>
    </PinnedAppHeaderScreen>
  );
}
