import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import 'react-native-reanimated';

import { colors } from "@/design/theme";

export {
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.canvas,
    border: colors.line,
    card: colors.surface,
    primary: colors.brand,
    text: colors.ink,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: {
            color: colors.ink,
            fontSize: 17,
            fontWeight: "700",
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="instrument/[symbol]" options={{ title: "Instrument" }} />
        <Stack.Screen name="disclaimer" options={{ title: "Demo Notice", presentation: "modal" }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
