import * as Haptics from "expo-haptics";
import { Link2 } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { colors, radius, spacing } from "@/design/theme";

export type HeaderPanel = "menu" | "promo" | "notifications";

function hapticTap() {
  Haptics.selectionAsync().catch(() => {});
}

function PanelRow({ children, dotColor }: { children: ReactNode; dotColor: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: "rgba(218,223,229,0.92)",
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.md,
        padding: spacing.md,
      }}
    >
      <View style={{ backgroundColor: dotColor, borderRadius: radius.full, height: 10, width: 10 }} />
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
    </View>
  );
}

function MenuOption({ label, destructive, onPress }: { label: string; destructive?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() => {
        hapticTap();
        onPress?.();
      }}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
        borderColor: "rgba(218,223,229,0.92)",
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        minHeight: 48,
        opacity: pressed ? 0.78 : 1,
        paddingHorizontal: spacing.lg,
      })}
    >
      <Text style={{ color: destructive ? colors.negative : colors.ink, fontSize: 16, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}

export function HeaderPanelContent({
  activePanel,
  inviteCopied,
  onCopyInvite,
  onLogout,
  rewardLabel,
}: {
  activePanel: HeaderPanel;
  inviteCopied: boolean;
  onCopyInvite: () => void;
  onLogout: () => void;
  rewardLabel?: string;
}) {
  const title = activePanel === "menu" ? "EightCap" : activePanel === "promo" ? "Promo" : "Notification";
  const rewardAmount = rewardLabel?.replace(/^Earn\s+/i, "") ?? "$200";

  return (
    <>
      {activePanel === "promo" ? null : <Text style={{ color: colors.muted, fontSize: 25, fontWeight: "900" }}>{title}</Text>}

      {activePanel === "menu" ? (
        <View style={{ gap: spacing.sm }}>
          <MenuOption label="Terms & Privacy Policy" />
          <MenuOption label="Settings" />
          <MenuOption label="Help Center" />
          <MenuOption label="Contact us" />
          <MenuOption destructive label="Logout" onPress={onLogout} />
        </View>
      ) : activePanel === "promo" ? (
        <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.md }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>Invite traders</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: 5 }}>
              <Text style={{ color: colors.muted, fontSize: 14, fontWeight: "700" }}>Share invitation link with a</Text>
              <Text style={{ color: colors.muted, fontSize: 14, fontWeight: "700" }}>friend to earn</Text>
              <Text style={{ color: colors.brandAction, fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
                {rewardAmount}
              </Text>
            </View>
            {inviteCopied ? (
              <Text style={{ color: colors.brandAction, fontSize: 13, fontWeight: "900", marginTop: spacing.sm }}>
                邀请链接已复制
              </Text>
            ) : null}
          </View>

          <Pressable
            accessibilityLabel="Copy invitation link"
            accessibilityRole="button"
            onPress={() => {
              hapticTap();
              onCopyInvite();
            }}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: colors.brandSoft,
              borderColor: "rgba(5,184,63,0.28)",
              borderRadius: radius.full,
              borderWidth: 1,
              height: 42,
              justifyContent: "center",
              opacity: pressed ? 0.72 : 1,
              width: 42,
            })}
          >
            <Link2 color={colors.brandAction} size={19} strokeWidth={2.4} />
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          <PanelRow dotColor={colors.negative}>
            <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "900" }}>Portfolio alert</Text>
            <Text style={{ color: colors.muted, fontSize: 14, fontWeight: "600", marginTop: 3 }}>
              Your daily movement crossed the demo threshold.
            </Text>
          </PanelRow>
          <PanelRow dotColor={colors.brandAction}>
            <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "900" }}>Market pulse</Text>
            <Text style={{ color: colors.muted, fontSize: 14, fontWeight: "600", marginTop: 3 }}>
              Quote flashes and index updates are running from local mock data.
            </Text>
          </PanelRow>
        </View>
      )}
    </>
  );
}
