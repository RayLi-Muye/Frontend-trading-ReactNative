import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { showLaunchSplash } from "@/components/launch-splash";
import { colors, spacing } from "@/design/theme";

import { HeaderPanelContent, type HeaderPanel } from "./header-panel-content";

type HeaderPanelController = {
  openPanel: (panel: HeaderPanel) => void;
};

const HeaderPanelContext = createContext<HeaderPanelController | null>(null);

export function useHeaderPanelController() {
  return useContext(HeaderPanelContext);
}

export function HeaderPanelProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(326, Math.max(286, width * 0.82));
  const [activePanel, setActivePanel] = useState<HeaderPanel | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const foregroundX = useSharedValue(0);
  const drawerOpacity = useSharedValue(0);
  const promoOpacity = useSharedValue(0);
  const promoScale = useSharedValue(0.92);
  const promoY = useSharedValue(-8);
  const isDrawer = activePanel === "menu" || activePanel === "notifications";
  const isPromo = activePanel === "promo";

  useEffect(() => {
    if (activePanel === "menu") {
      drawerOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
      foregroundX.value = withTiming(drawerWidth, { duration: 280, easing: Easing.out(Easing.cubic) });
    } else if (activePanel === "notifications") {
      drawerOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
      foregroundX.value = withTiming(-drawerWidth, { duration: 280, easing: Easing.out(Easing.cubic) });
    } else if (activePanel === "promo") {
      promoOpacity.value = 0;
      promoScale.value = 0.92;
      promoY.value = -8;
      promoOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
      promoScale.value = withTiming(1, { duration: 210, easing: Easing.out(Easing.cubic) });
      promoY.value = withTiming(0, { duration: 210, easing: Easing.out(Easing.cubic) });
    }
  }, [activePanel, drawerOpacity, drawerWidth, foregroundX, promoOpacity, promoScale, promoY]);

  const drawerStyle = useAnimatedStyle(() => ({
    opacity: drawerOpacity.value,
  }));

  const foregroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: foregroundX.value }],
  }));

  const promoStyle = useAnimatedStyle(() => ({
    opacity: promoOpacity.value,
    transform: [{ translateY: promoY.value }, { scale: promoScale.value }],
  }));

  function openPanel(panel: HeaderPanel) {
    setInviteCopied(false);
    setActivePanel(panel);
  }

  function finishClose() {
    setActivePanel(null);
  }

  function closePanel() {
    if (activePanel === "promo") {
      promoOpacity.value = withTiming(0, { duration: 130, easing: Easing.in(Easing.cubic) });
      promoScale.value = withTiming(0.94, { duration: 150, easing: Easing.in(Easing.cubic) });
      promoY.value = withTiming(-8, { duration: 150, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      });
      return;
    }

    foregroundX.value = withTiming(0, { duration: 240, easing: Easing.in(Easing.cubic) });
    drawerOpacity.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(finishClose)();
      }
    });
  }

  function logout() {
    foregroundX.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.cubic) });
    drawerOpacity.value = withTiming(0, { duration: 130, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(finishClose)();
      }
    });
    router.replace("/");
    showLaunchSplash(false);
  }

  return (
    <HeaderPanelContext.Provider value={{ openPanel }}>
      <View style={{ backgroundColor: colors.canvas, flex: 1, overflow: "hidden" }}>
        {isDrawer ? (
          <Animated.View
            pointerEvents="box-none"
            style={[
              {
                bottom: 0,
                left: activePanel === "menu" ? 0 : undefined,
                position: "absolute",
                right: activePanel === "notifications" ? 0 : undefined,
                top: 0,
                width: drawerWidth,
              },
              drawerStyle,
            ]}
          >
            <View
              style={{
                backgroundColor: colors.surfaceAlt,
                flex: 1,
                gap: spacing.lg,
                paddingBottom: spacing.xl + insets.bottom,
                paddingHorizontal: spacing.lg,
                paddingTop: insets.top + 54,
              }}
            >
              <HeaderPanelContent
                activePanel={activePanel}
                inviteCopied={inviteCopied}
                rewardLabel="Earn $200"
                onCopyInvite={() => setInviteCopied(true)}
                onLogout={logout}
              />
            </View>
          </Animated.View>
        ) : null}

        <Animated.View
          style={[
            {
              backgroundColor: colors.canvas,
              flex: 1,
              overflow: "hidden",
              shadowColor: "#080b12",
              shadowOffset: { height: 0, width: activePanel === "menu" ? -12 : 12 },
              shadowOpacity: isDrawer ? 0.16 : 0,
              shadowRadius: 24,
            },
            foregroundStyle,
          ]}
        >
          {children}
          {isDrawer ? (
            <Pressable
              accessibilityLabel="Close navigation drawer"
              accessibilityRole="button"
              onPress={closePanel}
              style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
            />
          ) : null}
        </Animated.View>

        {isPromo ? (
          <View pointerEvents="box-none" style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}>
            <Pressable
              accessibilityLabel="Close promo panel"
              accessibilityRole="button"
              onPress={closePanel}
              style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
            />
            <Animated.View
              style={[
                {
                  alignSelf: "flex-end",
                  backgroundColor: colors.surfaceAlt,
                  borderColor: "rgba(255,255,255,0.92)",
                  borderRadius: 28,
                  borderWidth: 1,
                  boxShadow: "0 18px 52px rgba(8, 11, 18, 0.22), inset 0 1px 0 rgba(255,255,255,0.92)",
                  marginRight: spacing.lg,
                  marginTop: insets.top + 70,
                  maxWidth: 340,
                  padding: spacing.lg,
                  width: width < 380 ? width - spacing.xl : 340,
                },
                promoStyle,
              ]}
            >
              <View
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderColor: "rgba(255,255,255,0.92)",
                  borderLeftWidth: 1,
                  borderTopWidth: 1,
                  height: 16,
                  position: "absolute",
                  right: 72,
                  top: -8,
                  transform: [{ rotate: "45deg" }],
                  width: 16,
                }}
              />
              <HeaderPanelContent
                activePanel="promo"
                inviteCopied={inviteCopied}
                rewardLabel="Earn $200"
                onCopyInvite={() => setInviteCopied(true)}
                onLogout={logout}
              />
            </Animated.View>
          </View>
        ) : null}
      </View>
    </HeaderPanelContext.Provider>
  );
}
