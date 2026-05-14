import { Text, View } from "react-native";

import { colors, spacing } from "@/design/theme";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
};

export function SectionHeader({ eyebrow, title }: SectionHeaderProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text selectable style={{ color: colors.brandDark, fontSize: 12, fontWeight: "800", letterSpacing: 0 }}>
        {eyebrow.toUpperCase()}
      </Text>
      <Text selectable style={{ color: colors.ink, fontSize: 23, fontWeight: "900", letterSpacing: 0 }}>
        {title}
      </Text>
    </View>
  );
}
