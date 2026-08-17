import { View } from "react-native";
import { Svg, Defs, Pattern, Rect, Line, RadialGradient, Stop } from "react-native-svg";

import { Colors } from "@/constants/theme";

const LINE_SPACING = 30;

export function RuledBackground() {
  return (
    <View className="absolute inset-0" pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="lines"
            x="0"
            y="0"
            width={LINE_SPACING}
            height={LINE_SPACING}
            patternUnits="userSpaceOnUse"
          >
            <Line
              x1="0"
              y1={LINE_SPACING}
              x2="10000"
              y2={LINE_SPACING}
              stroke={Colors.gridLine}
              strokeWidth="1"
            />
            <Line
              x1={LINE_SPACING}
              y1="0"
              x2={LINE_SPACING}
              y2="10000"
              stroke={Colors.gridLine}
              strokeWidth="1"
            />
          </Pattern>
          <RadialGradient
            id="vignette"
            cx="50%"
            cy="50%"
            rx="80%"
            ry="80%"
            fx="50%"
            fy="50%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor={Colors.surface} stopOpacity="0" />
            <Stop offset="75%" stopColor={Colors.surface} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={Colors.surface} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#lines)" />
        <Rect width="100%" height="100%" fill="url(#vignette)" />
      </Svg>
    </View>
  );
}
