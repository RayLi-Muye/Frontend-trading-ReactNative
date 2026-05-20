import { createElement, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Platform, View, type ViewStyle } from "react-native";

import { useAppViewportDimensions } from "@/hooks/use-app-viewport";

type PreviewMode = "phone" | "pad" | "widePad";

const previewFrames: Record<PreviewMode, { height: number; label: string; width: number }> = {
  phone: { height: 932, label: "Phone", width: 430 },
  pad: { height: 1024, label: "Pad", width: 768 },
  widePad: { height: 768, label: "Wide Pad", width: 1024 },
};

const previewModes = Object.keys(previewFrames) as PreviewMode[];

function isAppFrame() {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("appFrame") === "1";
}

function shouldUsePreviewShell(width: number) {
  if (Platform.OS !== "web" || typeof window === "undefined" || isAppFrame()) {
    return false;
  }

  return (width >= 480 && width < 768) || width > 932;
}

function frameSource() {
  const url = new URL(window.location.href);
  url.searchParams.set("appFrame", "1");
  url.searchParams.delete("previewMode");
  return url.toString();
}

function initialPreviewMode(): PreviewMode {
  if (typeof window === "undefined") {
    return "phone";
  }

  const mode = new URLSearchParams(window.location.search).get("previewMode");
  return previewModes.includes(mode as PreviewMode) ? (mode as PreviewMode) : "phone";
}

type WebPhonePreviewShellProps = {
  children: ReactNode;
};

export function WebPhonePreviewShell({ children }: WebPhonePreviewShellProps) {
  const viewport = useAppViewportDimensions();
  const [previewMode, setPreviewMode] = useState<PreviewMode>(initialPreviewMode);
  const [shellEnabled, setShellEnabled] = useState(false);
  const [source, setSource] = useState("");
  const frame = previewFrames[previewMode];

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return undefined;
    }

    const update = () => {
      setShellEnabled(shouldUsePreviewShell(window.innerWidth));
      setSource(frameSource());
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("popstate", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("popstate", update);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined" || isAppFrame()) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("previewMode", previewMode);
    window.history.replaceState(null, "", url.toString());
  }, [previewMode]);

  const scale = useMemo(() => {
    const controlsReserve = 76;
    const availableWidth = Math.max(viewport.width - 32, 1);
    const availableHeight = Math.max(viewport.height - controlsReserve - 32, 1);
    return Math.min(1, availableWidth / frame.width, availableHeight / frame.height);
  }, [frame.height, frame.width, viewport.height, viewport.width]);

  if (Platform.OS !== "web" || !shellEnabled || !source) {
    return <>{children}</>;
  }

  const slotWidth = frame.width * scale;
  const slotHeight = frame.height * scale;

  return (
    <View style={[rootStyle, { height: viewport.height, width: viewport.width }]}>
      <View style={controlBarStyle}>
        {previewModes.map((mode) => {
          const selected = mode === previewMode;
          return createElement(
            "button",
            {
              "aria-pressed": selected,
              key: mode,
              onClick: () => setPreviewMode(mode),
              style: {
                ...controlButtonStyle,
                ...(selected ? controlButtonActiveStyle : null),
              },
              type: "button",
            },
            previewFrames[mode].label,
          );
        })}
      </View>
      <View style={[slotStyle, { height: slotHeight, width: slotWidth }]}>
        <View
          style={[
            frameStyle,
            {
              borderRadius: previewMode === "phone" ? 44 : 28,
              height: frame.height,
              transform: [{ scale }],
              width: frame.width,
            },
          ]}
        >
          {createElement("iframe", {
            allow: "clipboard-read; clipboard-write",
            key: previewMode,
            src: source,
            style: {
              ...iframeStyle,
              height: frame.height,
              width: frame.width,
            },
            title: "Market Prototype mobile app preview",
          })}
        </View>
      </View>
    </View>
  );
}

const frameStyle = {
  backgroundColor: "#f7f8f5",
  boxShadow: "0 24px 70px rgba(8, 11, 18, 0.18)",
  left: 0,
  overflow: "hidden",
  position: "absolute",
  top: 0,
  transformOrigin: "top left",
} as ViewStyle;

const iframeStyle: CSSProperties = {
  backgroundColor: "#f7f8f5",
  border: 0,
  display: "block",
};

const rootStyle: ViewStyle = {
  alignItems: "center",
  backgroundColor: "#f7f8f5",
  justifyContent: "center",
  overflow: "hidden",
};

const slotStyle: ViewStyle = {
  position: "relative",
};

const controlBarStyle: ViewStyle = {
  backgroundColor: "rgba(255,255,255,0.78)",
  borderColor: "rgba(16, 24, 40, 0.08)",
  borderRadius: 999,
  borderWidth: 1,
  boxShadow: "0 14px 34px rgba(8, 11, 18, 0.10)",
  flexDirection: "row",
  gap: 4,
  marginBottom: 16,
  padding: 4,
};

const controlButtonStyle: CSSProperties = {
  appearance: "none",
  background: "transparent",
  border: 0,
  borderRadius: 999,
  color: "#667085",
  cursor: "pointer",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  height: 34,
  padding: "0 16px",
};

const controlButtonActiveStyle: CSSProperties = {
  background: "#18b85f",
  color: "#ffffff",
  boxShadow: "0 8px 18px rgba(24, 184, 95, 0.26)",
};
