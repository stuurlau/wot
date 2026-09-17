import { View } from "react-native";
import { Svg, Defs, Pattern, Rect, Line, LinearGradient, Stop } from "react-native-svg";

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
              strokeOpacity={0.85}
            />
            <Line
              x1={LINE_SPACING}
              y1="0"
              x2={LINE_SPACING}
              y2={10000}
              stroke={Colors.gridLine}
              strokeWidth="1"
              strokeOpacity={0.85}
            />
          </Pattern>
          {/* Soft surface fade only at the very top (under the AppHeader) and
              very bottom (above the VersionFooter / tab bar). Leaves the
              middle of the screen fully crisp. */}
          <LinearGradient id="topFade" x1="0" y1="0" x2="0" y2="0.08">
            <Stop offset="0" stopColor={Colors.surface} stopOpacity={0.55} />
            <Stop offset="1" stopColor={Colors.surface} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="bottomFade" x1="0" y1="0.94" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.surface} stopOpacity={0} />
            <Stop offset="1" stopColor={Colors.surface} stopOpacity={0.55} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#lines)" />
        <Rect width="100%" height="100%" fill="url(#topFade)" />
        <Rect width="100%" height="100%" fill="url(#bottomFade)" />
      </Svg>
    </View>
  );
}
