import { Link } from "expo-router";
import { Stack } from "expo-router/stack";
import { Pressable, Text, View } from "react-native";

import { colors, radius, spacing } from "@/design/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.xl,
          backgroundColor: colors.canvas,
          gap: spacing.md,
        }}
      >
        <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: "700" }}>
          Screen not found
        </Text>

        <Link href="/" asChild>
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: colors.brand,
              borderRadius: radius.sm,
              opacity: pressed ? 0.7 : 1,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            })}
          >
            <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "700" }}>Back to markets</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}
