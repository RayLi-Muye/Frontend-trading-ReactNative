import type { ReactNode } from "react";
import { ScrollView, type ScrollViewProps, View, useWindowDimensions } from "react-native";

import { colors, spacing } from "@/design/theme";

type ScreenScrollProps = {
  children: ReactNode;
  refreshControl?: ScrollViewProps["refreshControl"];
};

export function ScreenScroll({ children, refreshControl }: ScreenScrollProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={refreshControl}
      style={{ backgroundColor: colors.canvas, flex: 1 }}
      contentContainerStyle={{
        gap: spacing.lg,
        paddingBottom: 36,
        paddingHorizontal: isWide ? spacing.xl : spacing.lg,
        paddingTop: spacing.lg,
      }}
    >
      <View
        style={{
          alignSelf: "center",
          gap: spacing.lg,
          maxWidth: isWide ? 820 : undefined,
          width: "100%",
        }}
      >
        {children}
      </View>
    </ScrollView>
  );
}
