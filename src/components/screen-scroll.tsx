import type { ReactNode } from "react";
import { ScrollView, type ScrollViewProps, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "@/design/theme";

type ScreenScrollProps = {
  children: ReactNode;
  refreshControl?: ScrollViewProps["refreshControl"];
  includeTopInset?: boolean;
  bottomInset?: number;
  maxContentWidth?: number;
};

export function ScreenScroll({ children, refreshControl, includeTopInset, bottomInset = 36, maxContentWidth }: ScreenScrollProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 768;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={refreshControl}
      style={{ backgroundColor: colors.canvas, flex: 1 }}
      contentContainerStyle={{
        gap: spacing.lg,
        paddingBottom: bottomInset + insets.bottom,
        paddingHorizontal: isWide ? spacing.xl : spacing.lg,
        paddingTop: includeTopInset ? insets.top + spacing.lg : spacing.lg,
      }}
    >
      <View
        style={{
          alignSelf: "center",
          gap: spacing.lg,
          maxWidth: isWide ? (maxContentWidth ?? 820) : undefined,
          width: "100%",
        }}
      >
        {children}
      </View>
    </ScrollView>
  );
}
