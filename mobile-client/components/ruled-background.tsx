import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { Svg, Defs, Pattern, Rect, Line, LinearGradient, Stop } from "react-native-svg";

import { Colors } from "@/constants/theme";

/**
 * Ruled (grid) background rendered *inside* each screen (see `Screen`).
 *
 * ── Tuning knobs ──────────────────────────────────────────────────────────
 * Adjust these and they apply identically on web (CSS) and native (SVG):
 */
const LINE_SPACING = 25; // px between grid lines
const LINE_OPACITY = 0.7; // 0–1, strength of the grid lines
const LINE_WIDTH = 1; // px line thickness
const FADE_OPACITY = 0.9; // 0–1, how strongly the grid fades under the header / above the footer
const FADE_TOP = 0.3; // fraction of screen height the top fade spans
const FADE_BOTTOM = 0.06; // fraction of screen height the bottom fade spans

/** '#rrggbb' + opacity → 'rgba(r,g,b,a)' (for the web CSS path). */
function rgba(hex: string, opacity: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${opacity})`;
}

export function RuledBackground() {
  if (Platform.OS === "web") {
    const line = `${LINE_SPACING}px`;
    const grid = rgba(Colors.gridLine, LINE_OPACITY);
    const fade = (o: number) => rgba(Colors.surface, o);
    // web-only CSS backgroundImage (not part of the RN style types).
    // Note: layers stack first-on-top, so the fades come first.
    const webGridStyle = {
      backgroundImage: [
        // soft fade under the header
        `linear-gradient(to bottom, ${fade(FADE_OPACITY)}, ${fade(0)} ${FADE_TOP * 100}%)`,
        // soft fade above the footer / tab bar
        `linear-gradient(to top, ${fade(FADE_OPACITY)}, ${fade(0)} ${FADE_BOTTOM * 100}%)`,
        // vertical lines
        `repeating-linear-gradient(to right, ${grid} 0px, ${grid} ${LINE_WIDTH}px, transparent ${LINE_WIDTH}px, transparent ${line})`,
        // horizontal lines
        `repeating-linear-gradient(to bottom, ${grid} 0px, ${grid} ${LINE_WIDTH}px, transparent ${LINE_WIDTH}px, transparent ${line})`,
      ].join(", "),
    } as unknown as ViewStyle;
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, webGridStyle]} />
    );
  }

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
              strokeWidth={LINE_WIDTH}
              strokeOpacity={LINE_OPACITY}
            />
            <Line
              x1={LINE_SPACING}
              y1="0"
              x2={LINE_SPACING}
              y2={10000}
              stroke={Colors.gridLine}
              strokeWidth={LINE_WIDTH}
              strokeOpacity={LINE_OPACITY}
            />
          </Pattern>
          <LinearGradient id="topFade" x1="0" y1="0" x2="0" y2={FADE_TOP}>
            <Stop offset="0" stopColor={Colors.surface} stopOpacity={FADE_OPACITY} />
            <Stop offset="1" stopColor={Colors.surface} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="bottomFade" x1="0" y1={1 - FADE_BOTTOM} x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.surface} stopOpacity={0} />
            <Stop offset="1" stopColor={Colors.surface} stopOpacity={FADE_OPACITY} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#lines)" />
        <Rect width="100%" height="100%" fill="url(#topFade)" />
        <Rect width="100%" height="100%" fill="url(#bottomFade)" />
      </Svg>
    </View>
  );
}
