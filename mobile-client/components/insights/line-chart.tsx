import { Circle, Line, Path, Rect, Svg, Text as SvgText } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { compact, niceTicks, smoothedSegments } from '@/lib/insights';

// Shared line chart for the Insights glance + explorer: value line with a
// dashed rolling average, optional previous-period ghost, monotone-cubic
// smoothing, tap-to-select weeks. Ported from the redesign prototype's
// `lineChart` (docs/20261015_insights_glance_explorer_redesign.md).

const W = 342;
const PAD = { top: 26, bottom: 22, left: 32, right: 8 };
const GRID = '#e4e3e2';
const FAINT = '#a3a09c';
const X_LABEL = '#737373';
const GHOST = '#c9c6c2';
const FONT = 'Inter_400Regular';

type InsightsLineChartProps = {
  values: (number | null)[];
  avg?: (number | null)[] | null;
  ghost?: (number | null)[] | null;
  labels: string[];
  // Selected week index: vertical marker + tooltip. Null = no selection.
  selected?: number | null;
  // Current week index: hollow dot.
  current?: number | null;
  // Additive metrics pin the y-axis to zero.
  zeroBaseline?: boolean;
  // viewBox height (140 glance / 170 explorer).
  height?: number;
  // Tooltip value format, e.g. "8,763 kg".
  formatValue?: (v: number) => string;
  // Axis pill format (short), e.g. "8.8k".
  formatAxis?: (v: number) => string;
  onSelect?: (index: number) => void;
};

export function InsightsLineChart({
  values,
  avg = null,
  ghost = null,
  labels,
  selected = null,
  current = null,
  zeroBaseline = false,
  height: H = 150,
  formatValue,
  formatAxis,
  onSelect,
}: InsightsLineChartProps) {
  const { top: pt, bottom: pb, left: pl, right: pr } = PAD;
  const pool = [...values, ...(avg ?? []), ...(ghost ?? [])].filter(
    (v): v is number => v != null,
  );
  let lo = 0;
  let hi = 1;
  if (pool.length) {
    lo = zeroBaseline ? 0 : Math.min(...pool);
    hi = Math.max(...pool);
    if (zeroBaseline) {
      hi = hi * 1.1 || 1;
    } else {
      const p = (hi - lo) * 0.2 || Math.abs(hi) * 0.05 || 1;
      lo -= p;
      hi += p;
    }
  }

  const n = values.length;
  const xs = (i: number) => (n === 1 ? pl + (W - pl - pr) / 2 : pl + (i * (W - pl - pr)) / (n - 1));
  const ys = (v: number) => pt + (H - pt - pb) * (1 - (v - lo) / (hi - lo));

  const ticks = niceTicks(lo, hi, 3);
  const focus = selected != null && selected >= 0 && values[selected] != null ? selected : null;
  const rr = n > 16 ? 1.8 : 3;

  // X labels: every week up to 8 points, every 2nd up to 12, else ~5 labels;
  // the last label always shows and a too-close neighbour is dropped.
  const step = n <= 8 ? 1 : n <= 12 ? 2 : Math.ceil(n / 5);

  const tooltipText = focus != null
    ? `${formatValue ? formatValue(values[focus]!) : compact(values[focus]!)} · ${labels[focus]}`
    : '';
  const tooltipW = tooltipText.length * 5 + 16;

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', aspectRatio: W / H }}>
      {ticks.map((t, k) => (
        <Line
          key={`gy${k}`}
          x1={pl}
          x2={W - pr + 4}
          y1={ys(t)}
          y2={ys(t)}
          stroke={GRID}
          strokeWidth={1}
          opacity={t === 0 ? 1 : 0.6}
        />
      ))}
      {ticks.map((t, k) => (
        <SvgText
          key={`ty${k}`}
          x={pl - 6}
          y={ys(t) + 3}
          fontSize={8}
          fontFamily={FONT}
          fill={FAINT}
          textAnchor="end"
        >
          {compact(t)}
        </SvgText>
      ))}
      {(!zeroBaseline || !ticks.includes(0)) && (
        <Line x1={pl} x2={W - pr + 4} y1={H - pb} y2={H - pb} stroke={GRID} strokeWidth={1} />
      )}
      {ghost ? (
        <Path d={smoothedSegments(ghost, xs, ys)} fill="none" stroke={GHOST} strokeWidth={1.5} />
      ) : null}
      {avg ? (
        <Path
          d={smoothedSegments(avg, xs, ys)}
          fill="none"
          stroke={FAINT}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ) : null}
      {selected != null && selected >= 0 ? (
        <Line
          x1={xs(selected)}
          x2={xs(selected)}
          y1={pt - 4}
          y2={H - pb}
          stroke="rgba(103,63,138,0.35)"
          strokeWidth={1}
        />
      ) : null}
      <Path
        d={smoothedSegments(values, xs, ys)}
        fill="none"
        stroke={Colors.secondary}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      {values.map((v, i) => {
        if (v == null) return null;
        const isF = i === focus;
        const isSel = i === selected;
        const isCur = i === current;
        return (
          <Circle
            key={`p${i}`}
            cx={xs(i)}
            cy={ys(v)}
            r={isF || isSel ? 4.5 : isCur ? 3.5 : rr}
            fill={
              isSel ? Colors.primary : isF ? Colors.secondary : isCur ? Colors.surface : Colors.secondary
            }
            stroke={isSel ? Colors.primary : Colors.secondary}
            strokeWidth={1.5}
          />
        );
      })}
      {labels.map((t, i) => {
        if (i % step !== 0 && i !== n - 1) return null;
        if (i !== n - 1 && n - 1 - i < step) return null;
        return (
          <SvgText
            key={`t${i}`}
            x={Math.min(Math.max(xs(i), pl - 4), W - 14)}
            y={H - 6}
            fontSize={8}
            fontFamily={FONT}
            fill={i === focus ? Colors.primary : X_LABEL}
            textAnchor="middle"
          >
            {t}
          </SvgText>
        );
      })}
      {focus != null ? (
        <>
          <Line
            x1={pl}
            x2={xs(focus)}
            y1={ys(values[focus]!)}
            y2={ys(values[focus]!)}
            stroke={Colors.primary}
            strokeWidth={1}
            strokeDasharray="2 3"
            opacity={0.6}
          />
          <Rect x={0} y={ys(values[focus]!) - 7} width={pl - 3} height={14} rx={7} fill={Colors.primary} />
          <SvgText
            x={(pl - 3) / 2}
            y={ys(values[focus]!) + 3}
            fontSize={8}
            fontFamily={FONT}
            fill="#fff"
            textAnchor="middle"
          >
            {formatAxis ? formatAxis(values[focus]!) : compact(values[focus]!)}
          </SvgText>
          <Rect
            x={Math.min(Math.max(xs(focus) - tooltipW / 2, pl), W - tooltipW)}
            y={Math.max(ys(values[focus]!) - 26, 0)}
            width={tooltipW}
            height={18}
            rx={9}
            fill={Colors.onSurface}
          />
          <SvgText
            x={Math.min(Math.max(xs(focus) - tooltipW / 2, pl), W - tooltipW) + tooltipW / 2}
            y={Math.max(ys(values[focus]!) - 26, 0) + 12}
            fontSize={9}
            fontFamily={FONT}
            fill="#fff"
            textAnchor="middle"
          >
            {tooltipText}
          </SvgText>
        </>
      ) : null}
      {onSelect
        ? values.map((_, i) => {
            const cw = n === 1 ? W - pl - pr : (W - pl - pr) / (n - 1);
            return (
              <Rect
                key={`h${i}`}
                x={xs(i) - cw / 2}
                y={0}
                width={cw}
                height={H}
                fill="transparent"
                onPress={() => onSelect(i)}
              />
            );
          })
        : null}
    </Svg>
  );
}
