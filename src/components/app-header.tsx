import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Bell, ChevronDown, Menu, Search, Sparkles } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

import { showLaunchSplash } from "@/components/launch-splash";
import { colors, radius, shadows, spacing } from "@/design/theme";

import { GlassSurface } from "./glass-surface";
import { useHeaderPanelController } from "./header-panel-provider";
import { HeaderPanelSheet, type HeaderPanel } from "./header-panel-sheet";

type AppHeaderProps = {
  searchPlaceholder?: string;
  centerLabel?: string;
  centerSubLabel?: string;
  rewardLabel?: string;
};

function hapticTap() {
  Haptics.selectionAsync().catch(() => {});
}

function IconButton({ children, label, onPress }: { children: ReactNode; label: string; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={12}
      onPress={() => {
        hapticTap();
        onPress?.();
      }}
      style={({ pressed }) => ({
        alignItems: "center",
        borderRadius: radius.full,
        height: 48,
        justifyContent: "center",
        opacity: pressed ? 0.62 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
        width: 48,
      })}
    >
      <GlassSurface
        interactive
        intensity={100}
        tintColor="rgba(255,255,255,0.88)"
        style={{
          ...shadows.card,
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.76)",
          borderColor: "rgba(255,255,255,0.92)",
          borderRadius: radius.full,
          borderWidth: 1,
          height: 48,
          justifyContent: "center",
          width: 48,
        }}
      >
        {children}
      </GlassSurface>
    </Pressable>
  );
}

export function AppHeader({ searchPlaceholder, centerLabel, centerSubLabel, rewardLabel }: AppHeaderProps) {
  const router = useRouter();
  const headerPanelController = useHeaderPanelController();
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const [panel, setPanel] = useState<HeaderPanel | null>(null);
  const openPanel = (nextPanel: HeaderPanel) => {
    if (headerPanelController) {
      headerPanelController.openPanel(nextPanel);
      return;
    }

    setPanel(nextPanel);
  };

  return (
    <>
      <View style={{ alignItems: "center", flexDirection: "row", gap: compact ? spacing.sm : spacing.md }}>
        <IconButton label="Open menu" onPress={() => openPanel("menu")}>
          <Menu color={colors.muted} size={28} strokeWidth={2.4} />
        </IconButton>

        <View style={{ alignItems: "center", flex: 1, justifyContent: "center", minHeight: 48, minWidth: 0 }}>
          {searchPlaceholder ? (
            <GlassSurface
              interactive
              intensity={90}
              tintColor="rgba(255,255,255,0.7)"
              style={{
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.56)",
                borderColor: "rgba(255,255,255,0.76)",
                borderRadius: radius.full,
                borderWidth: 1,
                flex: 1,
                flexDirection: "row",
                gap: spacing.sm,
                height: 50,
                paddingHorizontal: spacing.lg,
                width: "100%",
              }}
            >
              <Search color={colors.muted} size={22} strokeWidth={2.3} />
              <Text style={{ color: colors.subtle, fontSize: 18, fontWeight: "700" }}>{searchPlaceholder}</Text>
            </GlassSurface>
          ) : centerLabel ? (
            <GlassSurface
              interactive
              intensity={88}
              tintColor="rgba(255,255,255,0.72)"
              style={{
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.56)",
                borderColor: "rgba(255,255,255,0.76)",
                borderRadius: radius.full,
                borderWidth: 1,
                gap: 1,
                minHeight: 50,
                paddingHorizontal: spacing.lg,
                paddingVertical: 5,
              }}
            >
              <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.xs }}>
                <Text selectable style={{ color: colors.ink, fontSize: 18, fontVariant: ["tabular-nums"], fontWeight: "800" }}>
                  {centerLabel}
                </Text>
                <ChevronDown color={colors.subtle} size={15} strokeWidth={2.4} />
              </View>
              {centerSubLabel ? (
                <Text selectable style={{ color: colors.negative, fontSize: 12, fontVariant: ["tabular-nums"], fontWeight: "800" }}>
                  {centerSubLabel}
                </Text>
              ) : null}
            </GlassSurface>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <IconButton label="Open market pulse" onPress={() => openPanel("promo")}>
            <View>
              <Sparkles color={colors.brandAction} size={22} strokeWidth={2.4} />
              <View
                style={{
                  backgroundColor: colors.brand,
                  borderColor: colors.surface,
                  borderRadius: radius.full,
                  borderWidth: 1.5,
                  height: 8,
                  position: "absolute",
                  right: -2,
                  top: -2,
                  width: 8,
                }}
              />
            </View>
          </IconButton>

          <IconButton label="Open notifications" onPress={() => openPanel("notifications")}>
            <View>
              <Bell color={colors.ink} fill={colors.ink} size={24} strokeWidth={2.3} />
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: "#cf241b",
                  borderColor: colors.surface,
                  borderRadius: radius.full,
                  borderWidth: 2,
                  height: 22,
                  justifyContent: "center",
                  position: "absolute",
                  right: -8,
                  top: -9,
                  width: 22,
                }}
              >
                <Text style={{ color: colors.inverse, fontSize: 12, fontWeight: "900" }}>1</Text>
              </View>
            </View>
          </IconButton>
        </View>
      </View>

      {headerPanelController ? null : (
        <HeaderPanelSheet
          panel={panel}
          rewardLabel={rewardLabel}
          onClose={() => setPanel(null)}
          onLogout={() => {
            setPanel(null);
            router.replace("/");
            showLaunchSplash(false);
          }}
        />
      )}
    </>
  );
}
