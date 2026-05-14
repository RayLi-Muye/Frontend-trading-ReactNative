import Svg, { Circle, Line, Path } from "react-native-svg";

import { colors } from "@/design/theme";

type SparklineProps = {
  values: number[];
  color: string;
  height?: number;
  variant?: "light" | "dark";
};

export function Sparkline({ values, color, height = 54, variant = "light" }: SparklineProps) {
  const width = 132;
  const padding = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
    const y = padding + (1 - (value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const lastPoint = points[points.length - 1];
  const guideColor = variant === "dark" ? "rgba(255,255,255,0.15)" : colors.line;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <Line x1={padding} x2={width - padding} y1={height / 2} y2={height / 2} stroke={guideColor} strokeWidth={1} />
      <Path d={path} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
      {lastPoint ? <Circle cx={lastPoint.x} cy={lastPoint.y} fill={color} r={3.5} /> : null}
    </Svg>
  );
}
