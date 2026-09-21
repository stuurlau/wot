// Tab icons rendered as inline SVG so they work everywhere — including
// release APKs, where @expo/vector-icons font assets can fail to load.
// Icon `name`s follow SF Symbol naming; paths are 24×24 Material-style glyphs.

import { OpaqueColorValue } from 'react-native';
import { Path, Svg } from 'react-native-svg';

const PATHS = {
  'house.fill': 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  'clock.arrow.circlepath':
    'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
  'chart.bar.fill': 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',
} as const;

export type IconSymbolName = keyof typeof PATHS;

export function IconSymbol({
  name,
  size = 24,
  color,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={PATHS[name]} fill={color as string} />
    </Svg>
  );
}
