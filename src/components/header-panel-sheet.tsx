import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, radius, spacing } from "@/design/theme";

import { HeaderPanelContent, type HeaderPanel } from "./header-panel-content";

type HeaderPanelSheetProps = {
  onClose: () => void;
  onLogout: () => void;
  panel: HeaderPanel | null;
  rewardLabel?: string;
};

export function HeaderPanelSheet({ onClose, onLogout, panel, rewardLabel }: HeaderPanelSheetProps) {
  const [inviteCopied, setInviteCopied] = useState(false);
  const [activePanel, setActivePanel] = useState<HeaderPanel | null>(panel);
  const [modalVisible, setModalVisible] = useState(panel !== null);
  const overlayOpacity = useSharedValue(0);
  const sheetOpacity = useSharedValue(0);
  const sheetScale = useSharedValue(1);
  const sheetTranslateX = useSharedValue(0);
  const sheetTranslateY = useSharedValue(0);

  useEffect(() => {
    if (!panel) {
      return;
    }

    setActivePanel(panel);
    setInviteCopied(false);
    setModalVisible(true);
    overlayOpacity.value = 0;
    sheetOpacity.value = 0;
    sheetScale.value = panel === "promo" ? 0.92 : 1;
    sheetTranslateX.value = panel === "menu" ? -328 : panel === "notifications" ? 328 : 0;
    sheetTranslateY.value = panel === "promo" ? -10 : 0;
    overlayOpacity.value = withTiming(1, { duration: 140, easing: Easing.out(Easing.cubic) });
    sheetOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
    sheetScale.value = withTiming(1, { duration: 210, easing: Easing.out(Easing.cubic) });
    sheetTranslateX.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    sheetTranslateY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [overlayOpacity, panel, sheetOpacity, sheetScale, sheetTranslateX, sheetTranslateY]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: sheetOpacity.value,
    transform: [{ translateX: sheetTranslateX.value }, { translateY: sheetTranslateY.value }, { scale: sheetScale.value }],
  }));

  function finishClose() {
    setModalVisible(false);
    setActivePanel(null);
    onClose();
  }

  function finishLogout() {
    setModalVisible(false);
    setActivePanel(null);
    onLogout();
  }

  function closeSheet() {
    const closingPanel = activePanel;
    overlayOpacity.value = withTiming(0, { duration: 160, easing: Easing.in(Easing.cubic) });
    sheetOpacity.value = withTiming(0, { duration: 130, easing: Easing.in(Easing.cubic) });
    sheetScale.value = withTiming(closingPanel === "promo" ? 0.94 : 1, { duration: 150, easing: Easing.in(Easing.cubic) });
    sheetTranslateX.value = withTiming(
      closingPanel === "menu" ? -328 : closingPanel === "notifications" ? 328 : 0,
      { duration: 180, easing: Easing.in(Easing.cubic) }
    );
    sheetTranslateY.value = withTiming(closingPanel === "promo" ? -8 : 0, { duration: 160, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(finishClose)();
      }
    });
  }

  function logout() {
    overlayOpacity.value = withTiming(0, { duration: 110, easing: Easing.in(Easing.cubic) });
    sheetOpacity.value = withTiming(0, { duration: 110, easing: Easing.in(Easing.cubic) });
    sheetTranslateX.value = withTiming(-328, { duration: 140, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(finishLogout)();
      }
    });
  }

  if (!modalVisible || !activePanel) {
    return null;
  }

  const isMenu = activePanel === "menu";
  const isPromo = activePanel === "promo";
  const isNotifications = activePanel === "notifications";

  return (
    <Modal animationType="none" transparent visible={modalVisible} onRequestClose={closeSheet}>
      <Animated.View
        style={[
          {
            backgroundColor: isPromo ? "rgba(8,11,18,0.08)" : "rgba(8,11,18,0.3)",
            flex: 1,
            justifyContent: isPromo ? "flex-start" : "center",
            paddingHorizontal: isPromo ? spacing.lg : 0,
            paddingTop: isPromo ? 78 : 0,
          },
          overlayStyle,
        ]}
      >
        <Pressable
          accessibilityLabel="Close top navigation panel"
          accessibilityRole="button"
          onPress={closeSheet}
          style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
        />
        <Animated.View
          style={[
            {
              alignSelf: isMenu ? "flex-start" : isNotifications ? "flex-end" : "flex-end",
              backgroundColor: colors.surfaceAlt,
              borderColor: "rgba(255,255,255,0.92)",
              borderBottomLeftRadius: isNotifications || isPromo ? 28 : 0,
              borderBottomRightRadius: isMenu || isPromo ? 28 : 0,
              borderTopLeftRadius: isNotifications ? 28 : isPromo ? 28 : 0,
              borderTopRightRadius: isMenu ? 28 : isPromo ? 28 : 0,
              borderWidth: 1,
              boxShadow: isPromo
                ? "0 18px 52px rgba(8, 11, 18, 0.22), inset 0 1px 0 rgba(255,255,255,0.92)"
                : "0 24px 72px rgba(8, 11, 18, 0.24), inset 0 1px 0 rgba(255,255,255,0.92)",
              gap: spacing.lg,
              height: isPromo ? undefined : "100%",
              maxWidth: isPromo ? 340 : 336,
              paddingBottom: isPromo ? spacing.lg : spacing.xl,
              paddingHorizontal: spacing.lg,
              paddingTop: isPromo ? spacing.lg : 62,
              position: "relative",
              width: isPromo ? "100%" : "86%",
            },
            sheetStyle,
          ]}
        >
          {isPromo ? (
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
          ) : null}
          <HeaderPanelContent
            activePanel={activePanel}
            inviteCopied={inviteCopied}
            rewardLabel={rewardLabel}
            onCopyInvite={() => setInviteCopied(true)}
            onLogout={logout}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export type { HeaderPanel };
