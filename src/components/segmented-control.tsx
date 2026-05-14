import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";

import { colors, radius, spacing } from "@/design/theme";

type Segment<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  segments: Array<Segment<T>>;
  onChange: (value: T) => void;
};

function selectWithHaptic<T extends string>(nextValue: T, onChange: (value: T) => void) {
  if (process.env.EXPO_OS === "ios") {
    void Haptics.selectionAsync();
  }

  onChange(nextValue);
}

export function SegmentedControl<T extends string>({ value, segments, onChange }: SegmentedControlProps<T>) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.sm,
        flexDirection: "row",
        gap: spacing.xs,
        padding: spacing.xs,
      }}
    >
      {segments.map((segment) => {
        const active = segment.value === value;

        return (
          <Pressable
            key={segment.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => selectWithHaptic(segment.value, onChange)}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: active ? colors.ink : "transparent",
              borderRadius: radius.xs,
              flex: 1,
              minHeight: 38,
              justifyContent: "center",
              opacity: pressed ? 0.72 : 1,
              paddingHorizontal: spacing.sm,
            })}
          >
            <Text
              style={{
                color: active ? colors.inverse : colors.muted,
                fontSize: 13,
                fontWeight: "800",
              }}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
