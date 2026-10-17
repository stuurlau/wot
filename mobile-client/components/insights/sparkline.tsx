import { Circle, Path, Svg } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { smoothedSegments } from '@/lib/insights';

// Smoothed 84×28 sparkline of a weekly series with a dot on the last value.
const W = 84;
const H = 28;

export function Sparkline({ values }: { values: (number | null)[] }) {
  const nn = values.filter((v): v is number => v != null);
  if (!nn.length) return null;
  let lo = Math.min(...nn);
  let hi = Math.max(...nn);
  if (hi === lo) {
    hi += 1;
    lo -= 1;
  }
  const xs = (i: number) => 2 + (i * (W - 4)) / (values.length - 1);
  const ys = (v: number) => 3 + (H - 6) * (1 - (v - lo) / (hi - lo));
  let last = -1;
  values.forEach((v, i) => {
    if (v != null) last = i;
  });

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', aspectRatio: W / H }}>
      <Path
        d={smoothedSegments(values, xs, ys)}
        fill="none"
        stroke={Colors.secondary}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {last >= 0 ? (
        <Circle cx={xs(last)} cy={ys(values[last]!)} r={2.5} fill={Colors.secondary} />
      ) : null}
    </Svg>
  );
}
