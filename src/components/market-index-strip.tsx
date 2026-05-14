import { useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { marketIndexes } from "@/data/portfolio";
import { useLiveIndexes } from "@/hooks/use-live-market";
import { colors, spacing } from "@/design/theme";
import { formatPercent } from "@/utils/format";

const ITEM_WIDTH = 118;
const PRICE_WIDTH = 94;
const LOOP_DURATION_PER_ITEM = 3200;

function formatIndexPrice(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: value >= 1000 ? 1 : 2,
    minimumFractionDigits: value >= 1000 ? 1 : 2,
  });
}

export function MarketIndexStrip() {
  const indexes = useLiveIndexes(marketIndexes);
  const translateX = useSharedValue(0);
  const loopWidth = marketIndexes.length * ITEM_WIDTH;

  useEffect(() => {
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-loopWidth, { duration: marketIndexes.length * LOOP_DURATION_PER_ITEM, easing: Easing.linear }),
      -1,
      false,
    );
  }, [loopWidth, translateX]);

  const tickerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const tickerItems = useMemo(() => [...indexes, ...indexes], [indexes]);

  return (
    <View style={{ marginHorizontal: -spacing.lg, overflow: "hidden", paddingVertical: spacing.xs }}>
      <Animated.View style={[{ flexDirection: "row", width: loopWidth * 2 }, tickerStyle]}>
        {tickerItems.map((index, itemIndex) => (
          <View
            key={`${index.symbol}-${itemIndex}`}
            style={{
              borderLeftColor: colors.line,
              borderLeftWidth: 1,
              gap: 2,
              paddingHorizontal: 10,
              width: ITEM_WIDTH,
            }}
          >
            <Text numberOfLines={1} selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "900" }}>
              {index.symbol}
            </Text>
            <Text
              numberOfLines={1}
              selectable
              style={{
                color: colors.ink,
                fontSize: 19,
                fontVariant: ["tabular-nums"],
                fontWeight: "900",
                width: PRICE_WIDTH,
              }}
            >
              {formatIndexPrice(index.value)}
            </Text>
            <Text
              numberOfLines={1}
              selectable
              style={{
                color: index.changePercent >= 0 ? colors.positive : colors.negative,
                fontSize: 13,
                fontVariant: ["tabular-nums"],
                fontWeight: "700",
                width: PRICE_WIDTH,
              }}
            >
              {formatPercent(index.changePercent)}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
