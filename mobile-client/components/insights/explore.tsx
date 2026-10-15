import { Pressable, Text, View } from 'react-native';

import { Chip, ChipGroup } from '@/components/insights/chip-group';
import { InsightsLineChart } from '@/components/insights/line-chart';
import { MetricRow } from '@/components/insights/metric-row';
import { Colors } from '@/constants/theme';
import {
  METRICS,
  METRIC_WHY,
  availableMetrics,
  breakdown,
  compare,
  compact,
  exploreSeries,
  exploreSummary,
  fmtDay,
  fnum,
  fval,
  rangeName,
  weekStartDay,
  type CompareMode,
  type InsightsData,
  type MetricKey,
  type RangeWeeks,
  type Scope,
} from '@/lib/insights';

// The explorer: any metric × scope (all / exercise tag / exercise) × range ×
// comparison, with tap-a-week drill-down and breadcrumbs back up.
// docs/20261015_insights_glance_explorer_redesign.md

const RANGE_OPTIONS: { key: string; label: string }[] = [
  { key: '4', label: '4W' },
  { key: '8', label: '8W' },
  { key: '12', label: '12W' },
  { key: '26', label: '6M' },
  { key: '52', label: '1Y' },
];

const COMPARE_OPTIONS: { key: CompareMode; label: string }[] = [
  { key: 'avg', label: '4-wk avg' },
  { key: 'prev', label: 'Prev period' },
  { key: 'none', label: 'Off' },
];

type ExploreProps = {
  D: InsightsData;
  scope: Scope;
  metric: MetricKey;
  win: RangeWeeks;
  cmp: CompareMode;
  sel: number | null;
  onBack: () => void;
  onSetScope: (scope: Scope) => void;
  onSetMetric: (metric: MetricKey) => void;
  onSetWin: (win: RangeWeeks) => void;
  onSetCmp: (cmp: CompareMode) => void;
  onSetSel: (sel: number | null) => void;
  onOpenSheet: () => void;
};

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function InsightsExplore({
  D,
  scope,
  metric: m,
  win: n,
  cmp,
  sel,
  onBack,
  onSetScope,
  onSetMetric,
  onSetWin,
  onSetCmp,
  onSetSel,
  onOpenSheet,
}: ExploreProps) {
  const meta = METRICS[m];
  const CUR = D.today.wk;
  const { weeks, vals, avg, ghost } = exploreSeries(D, scope, m, n, cmp);
  const selWeek = sel != null && sel >= weeks[0] ? sel : CUR;
  const c = compare(D, m, scope, selWeek);
  const cur = selWeek === CUR;

  const crumbs: { key: string; label: string; primary: boolean; onPress: () => void }[] = [
    { key: 'back', label: '‹ Insights', primary: true, onPress: onBack },
  ];
  if (scope.type !== 'all') {
    crumbs.push({ key: 'all', label: 'All', primary: false, onPress: () => onSetScope({ type: 'all' }) });
    const tag = scope.type === 'tag' ? scope.id : D.exercises.get(scope.id)?.tags[0];
    if (tag)
      crumbs.push({
        key: 'tag',
        label: `› ${tag}`,
        primary: false,
        onPress: () => onSetScope({ type: 'tag', id: tag }),
      });
  }

  const title = scope.type === 'all' ? 'All training' : scope.type === 'tag' ? cap(scope.id) : scope.id;
  const labels = weeks.map((w) => fmtDay(weekStartDay(w)));
  const legend = [
    cmp === 'avg'
      ? 'Dashed: your rolling 4-week average'
      : cmp === 'prev'
        ? `Grey: previous ${rangeName(n)}`
        : null,
    'tap a week to drill in',
  ]
    .filter(Boolean)
    .join(' · ');
  const [why, whySrc] = METRIC_WHY[m];
  const summary = exploreSummary(D, scope, m, n);
  const rows = breakdown(D, m, scope, selWeek);

  return (
    <>
      {/* Breadcrumbs */}
      <View className="mb-1.5 flex-row flex-wrap items-center gap-2">
        {crumbs.map((c) => (
          <Pressable key={c.key} onPress={c.onPress} className="py-1">
            <Text
              className="font-body text-[10px] uppercase tracking-[2px]"
              style={{ color: c.primary ? Colors.primary : Colors.onSurfaceVariant }}
            >
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Title + scope picker */}
      <View className="mb-4 flex-row items-center justify-between gap-3">
        <Text className="min-w-0 flex-1 font-heading text-[32px] leading-[34px] tracking-[-1.2px] text-foreground">
          {title}
        </Text>
        <Chip label="Change ▾" size="sm" tone="ink" onPress={onOpenSheet} />
      </View>

      <ChipGroup
        options={availableMetrics(D, scope).map((k) => ({ key: k, label: METRICS[k].label }))}
        value={m}
        onChange={(k) => onSetMetric(k as MetricKey)}
        size="sm"
      />

      {/* Selected-week readout */}
      <Text className="mt-6 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
        Week of {fmtDay(weekStartDay(selWeek))}
        {cur && meta.add ? ' · so far' : ''}
      </Text>
      <View className="mt-1 flex-row items-baseline gap-1.5">
        <Text
          className="font-heading text-[44px] leading-[44px] tracking-[-1.6px] text-foreground"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {fnum(m, c.v)}
        </Text>
        {c.v != null ? (
          <Text className="font-body text-[12px] text-muted-foreground">{meta.unit}</Text>
        ) : null}
      </View>
      <Text className="mt-1 font-body text-[13px] leading-5 text-muted-foreground">{c.text}</Text>

      {/* Chart */}
      <View className="mt-3">
        <InsightsLineChart
          values={vals}
          avg={avg}
          ghost={ghost}
          labels={labels}
          selected={weeks.indexOf(selWeek)}
          current={weeks.length - 1}
          zeroBaseline={!!meta.add}
          height={170}
          formatValue={(v) => fval(m, v)}
          formatAxis={(v) => {
            const s = fnum(m, v);
            return s.length > 5 ? compact(m === 'e1rm' ? Math.round(v) : v) : s;
          }}
          onSelect={(i) => onSetSel(weeks[i])}
        />
      </View>
      <Text className="font-body text-[10px] leading-4" style={{ color: Colors.faint }}>
        {legend}
      </Text>

      {/* About this metric */}
      <View className="mt-4 gap-1 rounded-xl bg-surface-container-low px-3.5 py-3">
        <Text className="font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
          About this metric
        </Text>
        <Text className="font-body text-[12px] leading-[18px] text-muted-foreground">{why}</Text>
        {whySrc ? (
          <Text className="font-body text-[10px] leading-[15px]" style={{ color: Colors.faint }}>
            {whySrc}
          </Text>
        ) : null}
      </View>

      {/* Controls */}
      <View className="mt-4 gap-2.5">
        <View className="flex-row items-center gap-3">
          <Text className="w-16 font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
            Range
          </Text>
          <View className="flex-1">
            <ChipGroup
              options={RANGE_OPTIONS}
              value={String(n)}
              onChange={(k) => onSetWin(Number(k) as RangeWeeks)}
              size="xs"
            />
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="w-16 font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
            Compare
          </Text>
          <View className="flex-1">
            <ChipGroup
              options={COMPARE_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
              value={cmp}
              onChange={(k) => onSetCmp(k as CompareMode)}
              size="xs"
            />
          </View>
        </View>
      </View>

      {/* Summary */}
      <View className="mt-7">
        {summary.map((row) => (
          <MetricRow key={row.label} label={row.label} value={row.value} />
        ))}
      </View>

      {/* This week, broken down */}
      <Text className="mt-8 font-heading text-[20px] tracking-[-0.4px] text-foreground">
        {cur ? 'This week' : `Week of ${fmtDay(weekStartDay(selWeek))}`}, broken down
      </Text>
      <Text className="mb-1 mt-0.5 font-body text-[11px] text-muted-foreground">
        {rows.some((r) => r.drill)
          ? 'Tap a row to drill one level deeper.'
          : scope.type === 'exercise'
            ? 'Every logged set, per session.'
            : 'Each session that week.'}
      </Text>
      {rows.map((r, i) => (
        <Pressable
          key={`${r.label}-${r.sub}-${i}`}
          onPress={r.drill ? () => onSetScope(r.drill!) : undefined}
          disabled={!r.drill}
          className="flex-row items-center gap-3 border-b border-border py-3"
        >
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="font-body-medium text-[14px] text-foreground">{r.label}</Text>
            {r.sub ? (
              <Text
                className="font-body text-[11px] text-muted-foreground"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {r.sub}
              </Text>
            ) : null}
          </View>
          <Text
            className="font-heading text-[18px] text-foreground"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {r.value}
          </Text>
          <Text className="w-3 font-body text-[12px] text-primary">{r.drill ? '→' : ''}</Text>
        </Pressable>
      ))}
      {rows.length === 0 ? (
        <Text className="py-3 font-body text-[13px] text-muted-foreground">
          Nothing logged that week.
        </Text>
      ) : null}
    </>
  );
}
