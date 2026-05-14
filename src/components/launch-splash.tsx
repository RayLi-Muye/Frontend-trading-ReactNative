import { ArrowRight } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const ASCII_COLUMNS = 82;
const ASCII_ROWS = 50;
const BRAND_GREEN = "#2DBB69";

type SplashRequest = {
  autoHide: boolean;
};

const splashListeners = new Set<(request: SplashRequest) => void>();

export function showLaunchSplash(autoHide = false) {
  splashListeners.forEach((listener) => listener({ autoHide }));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getEightCenterline(angle: number) {
  const x = 4.5 * Math.sin(angle) * Math.cos(angle);
  const y = 6.5 * Math.cos(angle);
  const z = 1.1 * Math.sin(angle);

  return [x, y, z] as const;
}

function buildAsciiEightFrame(frame: number) {
  const time = frame * 0.02;
  const glyphs = new Array<string>(ASCII_COLUMNS * ASCII_ROWS).fill(" ");
  const depth = new Array<number>(ASCII_COLUMNS * ASCII_ROWS).fill(0);

  const tiltZ = -Math.PI / 7.5;
  const tiltX = Math.PI / 32;
  const swingY = Math.sin(time) * 0.45;
  const cosZ = Math.cos(tiltZ);
  const sinZ = Math.sin(tiltZ);
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const cosY = Math.cos(swingY);
  const sinY = Math.sin(swingY);
  const tubeRadius = 0.7;
  const cameraDistance = 18;
  const projectionX = 72;
  const projectionY = 42;

  for (let pathAngle = 0; pathAngle < Math.PI * 2; pathAngle += 0.03) {
    const [centerX, centerY, centerZ] = getEightCenterline(pathAngle);
    const [nextX, nextY, nextZ] = getEightCenterline(pathAngle + 0.01);
    let tangentX = nextX - centerX;
    let tangentY = nextY - centerY;
    let tangentZ = nextZ - centerZ;
    const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY + tangentZ * tangentZ);

    tangentX /= tangentLength;
    tangentY /= tangentLength;
    tangentZ /= tangentLength;

    let axisX = 0;
    let axisY = 1;
    let axisZ = 0;

    if (Math.abs(tangentY) > 0.95) {
      axisX = 1;
      axisY = 0;
      axisZ = 0;
    }

    let normalX = tangentY * axisZ - tangentZ * axisY;
    let normalY = tangentZ * axisX - tangentX * axisZ;
    let normalZ = tangentX * axisY - tangentY * axisX;
    const normalLength = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);

    normalX /= normalLength;
    normalY /= normalLength;
    normalZ /= normalLength;

    const binormalX = normalY * tangentZ - normalZ * tangentY;
    const binormalY = normalZ * tangentX - normalX * tangentZ;
    const binormalZ = normalX * tangentY - normalY * tangentX;

    for (let tubeAngle = 0; tubeAngle < Math.PI * 2; tubeAngle += 0.1) {
      const ringCos = Math.cos(tubeAngle);
      const ringSin = Math.sin(tubeAngle);
      const surfaceX = ringCos * binormalX + ringSin * normalX;
      const surfaceY = ringCos * binormalY + ringSin * normalY;
      const surfaceZ = ringCos * binormalZ + ringSin * normalZ;
      const modelX = centerX + tubeRadius * surfaceX;
      const modelY = centerY + tubeRadius * surfaceY;
      const modelZ = centerZ + tubeRadius * surfaceZ;

      const zRotatedX = modelX * cosZ - modelY * sinZ;
      const zRotatedY = modelX * sinZ + modelY * cosZ;
      const xRotatedY = zRotatedY * cosX - modelZ * sinX;
      const xRotatedZ = zRotatedY * sinX + modelZ * cosX;
      const yRotatedX = zRotatedX * cosY + xRotatedZ * sinY;
      const yRotatedZ = -zRotatedX * sinY + xRotatedZ * cosY;

      const normalZRotatedX = surfaceX * cosZ - surfaceY * sinZ;
      const normalZRotatedY = surfaceX * sinZ + surfaceY * cosZ;
      const normalXRotatedY = normalZRotatedY * cosX - surfaceZ * sinX;
      const normalXRotatedZ = normalZRotatedY * sinX + surfaceZ * cosX;
      const normalYRotatedZ = -normalZRotatedX * sinY + normalXRotatedZ * cosY;
      const luminance = (normalXRotatedY * 0.8 - normalYRotatedZ * 0.6 + 1) / 2;

      const perspective = 1 / (cameraDistance + yRotatedZ);
      const screenX = Math.floor(ASCII_COLUMNS / 2 + projectionX * perspective * yRotatedX);
      const screenY = Math.floor(ASCII_ROWS / 2 - projectionY * perspective * xRotatedY);

      if (screenX < 0 || screenX >= ASCII_COLUMNS || screenY < 0 || screenY >= ASCII_ROWS) {
        continue;
      }

      const index = screenX + screenY * ASCII_COLUMNS;

      if (perspective <= depth[index]) {
        continue;
      }

      depth[index] = perspective;
      glyphs[index] =
        luminance > 0.75
          ? "1"
          : luminance > 0.5
            ? (screenX + screenY) % 2 === 0
              ? "1"
              : "0"
            : luminance > 0.25
              ? (screenX + screenY) % 3 === 0
                ? "1"
                : "0"
              : "0";
    }
  }

  let output = "";

  for (let row = 0; row < ASCII_ROWS; row += 1) {
    output += `${glyphs.slice(row * ASCII_COLUMNS, (row + 1) * ASCII_COLUMNS).join("")}\n`;
  }

  return output;
}

export function LaunchSplash() {
  const [frame, setFrame] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [autoHide, setAutoHide] = useState(false);
  const { height, width } = useWindowDimensions();
  const fade = useSharedValue(1);
  const asciiFrame = useMemo(() => buildAsciiEightFrame(frame), [frame]);
  const asciiFontSize =
    width < 600
      ? clamp(Math.min(height * 0.013, width * 0.023), 8, 12)
      : clamp(Math.min(height * 0.018, width * 0.018), 12, 16);
  const stageScale = (width < 390 ? 0.9 : 1) * 1.56;
  const stageOffsetX = -width * 0.05;
  const stageOffsetY = width < 600 ? 0 : 72;
  const asciiTextWidth = ASCII_COLUMNS * (asciiFontSize + 2);
  const asciiTextHeight = ASCII_ROWS * asciiFontSize * 1.1;

  useEffect(() => {
    let frameId = 0;
    let lastTick = 0;

    function tick(now: number) {
      if (now - lastTick > 33) {
        lastTick = now;
        setFrame((value) => value + 1);
      }

      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    function show(request: SplashRequest) {
      fade.value = 1;
      setAutoHide(request.autoHide);
      setIsVisible(true);
    }

    splashListeners.add(show);

    return () => {
      splashListeners.delete(show);
    };
  }, [fade]);

  useEffect(() => {
    if (!autoHide) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2600);

    return () => clearTimeout(timer);
  }, [autoHide]);

  function enterApp() {
    fade.value = withTiming(0, { duration: 460, easing: Easing.inOut(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(setIsVisible)(false);
      }
    });
  }

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View accessibilityViewIsModal style={[StyleSheet.absoluteFillObject, styles.root, containerStyle]}>
      <View pointerEvents="none" style={styles.asciiLayer}>
        <Text
          selectable={false}
          style={[
            styles.asciiText,
            {
              fontSize: asciiFontSize,
              height: asciiTextHeight,
              lineHeight: asciiFontSize * 1.1,
              transform: [{ translateX: stageOffsetX }, { translateY: stageOffsetY }, { scale: stageScale }],
              width: asciiTextWidth,
            },
          ]}
        >
          {asciiFrame}
        </Text>
      </View>

      <View pointerEvents="box-none" style={styles.contentLayer}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            Eight Cap <Text style={styles.titleStrong}>prototype</Text>
          </Text>
          <View style={styles.titleRule} />
        </View>

        <Pressable
          accessibilityLabel="Enter main interface"
          accessibilityRole="button"
          onPress={enterApp}
          style={({ pressed }) => [styles.enterButton, pressed && styles.enterButtonPressed]}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.enterButtonText}>Enter App</Text>
            <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.4} />
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  asciiLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  asciiText: {
    color: BRAND_GREEN,
    fontFamily: "Courier",
    fontWeight: "800",
    includeFontPadding: false,
    letterSpacing: 1.1,
    opacity: 0.9,
    textAlign: "center",
  },
  buttonContent: {
    alignItems: "center",
    backgroundColor: BRAND_GREEN,
    borderRadius: 30,
    flexDirection: "row",
    gap: 10,
    height: "100%",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 30,
  },
  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 48,
    paddingHorizontal: 32,
    paddingTop: 60,
    zIndex: 2,
  },
  enterButton: {
    backgroundColor: BRAND_GREEN,
    borderRadius: 30,
    height: 58,
    maxWidth: 384,
    overflow: "hidden",
    width: "100%",
  },
  enterButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  enterButtonText: {
    color: "#FFFFFF",
    fontFamily: "Courier",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  root: {
    backgroundColor: "#F8F9FA",
    overflow: "hidden",
    zIndex: 1000,
  },
  title: {
    backgroundColor: "#F8F9FA",
    color: "rgba(45, 187, 105, 0.9)",
    fontFamily: "Courier",
    fontSize: 22,
    fontWeight: "300",
    letterSpacing: 2.8,
    paddingHorizontal: 8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  titleRule: {
    backgroundColor: "rgba(45, 187, 105, 0.3)",
    height: 1,
    marginTop: 14,
    width: 48,
  },
  titleStrong: {
    color: BRAND_GREEN,
    fontWeight: "800",
  },
  titleWrap: {
    alignItems: "center",
    width: "100%",
  },
});
