import { Pressable, Text, View } from 'react-native';

import { InsightsLineChart } from '@/components/insights/line-chart';
import { MetricRow } from '@/components/insights/metric-row';
import { SignalCard } from '@/components/insights/signal-card';
import { Sparkline } from '@/components/insights/sparkline';
import { TextLink } from '@/components/insights/text-link';
import { Colors } from '@/constants/theme';
import {
  advancedRows,
  deriveSignals,
  fmtDay,
  glanceLoadChart,
  glanceVerdict,
  keyLifts,
  tagBalance,
  weekStartDay,
  type DataMaturity,
  type InsightsData,
  type MetricKey,
  type Scope,
} from '@/lib/insights';

// The glance: curated, read top-to-bottom in under five seconds. Layout never
// changes; every block opens the explorer.
// docs/20261015_insights_glance_explorer_redesign.md

type GlanceProps = {
  D: InsightsData;
  stage: DataMaturity;
  loading: boolean;
  sessionCount: number;
  advOpen: boolean;
  onToggleAdv: () => void;
  onOpenExplore: (
    scope: Scope,
    metric: MetricKey,
    extra?: { win?: 4 | 8 | 12 | 26 | 52; sel?: number | null },
  ) => void;
  onOpenPicker: () => void;
};

export function InsightsGlance({
  D,
  stage,
  loading,
  sessionCount,
  advOpen,
  onToggleAdv,
  onOpenExplore,
  onOpenPicker,
}: GlanceProps) {
  const showCharts = stage === 'trending' || stage === 'full';

  return (
    <>
      <Text className="mb-7 font-heading text-[40px] leading-[38px] tracking-[-1.6px] text-foreground">
        Insights
      </Text>

      {loading ? (
        <Text className="font-body text-[12px] text-muted-foreground">Loading…</Text>
      ) : null}

      {stage === 'empty' && !loading ? (
        <Text className="font-body text-[13px] leading-6 text-muted-foreground">
          Log a few sessions and patterns will start appearing here.
        </Text>
      ) : null}

      {stage === 'warming-up' ? (
        <View className="items-start gap-3">
          <Text className="font-body text-[13px] leading-6 text-muted-foreground">
            {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'} logged — nice start.
            Load trend and exercise tags appear after a week of training.
          </Text>
          <TextLink tone="primary" onPress={() => onOpenExplore({ type: 'all' }, 'volume', { win: 8 })}>
            Browse what you logged →
          </TextLink>
        </View>
      ) : null}

      {showCharts ? <GlanceCharts D={D} stage={stage} advOpen={advOpen} onToggleAdv={onToggleAdv} onOpenExplore={onOpenExplore} onOpenPicker={onOpenPicker} /> : null}
    </>
  );
}

function GlanceCharts({
  D,
  stage,
  advOpen,
  onToggleAdv,
  onOpenExplore,
  onOpenPicker,
}: Omit<GlanceProps, 'loading' | 'sessionCount'>) {
  const full = stage === 'full';
  const verdict = glanceVerdict(D, stage);
  const chart = glanceLoadChart(D, stage);
  const lifts = keyLifts(D);
  const balance = tagBalance(D, stage);
  const signals = deriveSignals(D, stage, lifts);
  const adv = advancedRows(D);
  const labels = chart.weeks.map((w) => fmtDay(weekStartDay(w)));

  return (
    <>
      {/* A. Am I progressing? · volume load */}
      <View className="mb-10">
        <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
          Am I progressing? · volume load
        </Text>
        <Text className="font-heading text-[26px] leading-[30px] tracking-[-0.8px] text-foreground">
          {verdict.title}
        </Text>
        <Text
          className="mt-1 font-body text-[13px] leading-5 text-muted-foreground"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {verdict.sub}
        </Text>
        <View className="mt-4">
          <InsightsLineChart
            values={chart.vals}
            avg={chart.avg}
            labels={labels}
            current={chart.vals.length - 1}
            zeroBaseline
            height={140}
            formatValue={(v) => `${Math.round(v).toLocaleString('en-US')} kg`}
            onSelect={(i) =>
              onOpenExplore({ type: 'all' }, 'volume', { win: 8, sel: chart.weeks[i] })
            }
          />
        </View>
        <View className="mt-1 flex-row items-center justify-between gap-3">
          <Text className="min-w-0 flex-1 font-body text-[10px] leading-4" style={{ color: Colors.faint }}>
            {full ? 'Dashed: your 4-week average · ' : ''}Hollow: this week so far · tap a week to
            explore
          </Text>
          <TextLink tone="primary" onPress={() => onOpenExplore({ type: 'all' }, 'volume', { win: 8 })}>
            Explore →
          </TextLink>
        </View>
      </View>

      {/* B. Key lifts */}
      {lifts.length > 0 ? (
        <View className="mb-10">
          <View className="mb-1 flex-row items-baseline justify-between">
            <Text className="font-heading text-[24px] tracking-[-0.6px] text-foreground">
              Key lifts
            </Text>
            <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
              Top set · 8 wk
            </Text>
          </View>
          {lifts.map((l) => (
            <Pressable
              key={l.name}
              onPress={() => onOpenExplore(l.target.scope, l.target.metric, { win: l.target.win })}
              className="flex-row items-center gap-3 border-b border-border py-3"
            >
              <View className="min-w-0 flex-1 gap-0.5">
                <Text
                  className="font-body-medium text-[14px] text-foreground"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {l.name}
                </Text>
                <Text
                  className="font-body text-[10px] uppercase tracking-[1.5px]"
                  style={{
                    color:
                      l.tone === 'up'
                        ? Colors.secondary
                        : l.tone === 'faint'
                          ? Colors.faint
                          : Colors.onSurfaceVariant,
                  }}
                >
                  {l.meta}
                </Text>
              </View>
              <View style={{ width: 84 }}>
                <Sparkline values={l.spark} />
              </View>
              <View style={{ width: 60 }} className="flex-row items-baseline justify-end gap-0.5">
                <Text
                  className="font-heading text-[20px] text-foreground"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {l.value}
                </Text>
                <Text className="font-body text-[9px] uppercase tracking-[1px] text-muted-foreground">
                  kg
                </Text>
              </View>
            </Pressable>
          ))}
          <TextLink tone="primary" className="mt-2" onPress={onOpenPicker}>
            All exercises →
          </TextLink>
        </View>
      ) : null}

      {/* C. Where does my training go? */}
      {balance.rows.length > 0 ? (
        <View className="mb-10">
          <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
            Where does my training go?
          </Text>
          <Text className="font-heading text-[24px] tracking-[-0.6px] text-foreground">
            Exercise tags · last 4 weeks
          </Text>
          <View className="mb-3 mt-1.5 flex-row items-center gap-3.5">
            <Text className="font-body text-[11px] text-muted-foreground">Sets per week</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full bg-primary" />
              <Text className="font-body text-[11px] text-muted-foreground">now</Text>
            </View>
            {balance.hasUsual ? (
              <View className="flex-row items-center gap-1.5">
                <View
                  className="h-2 w-2 rounded-full border-primary bg-background"
                  style={{ borderWidth: 1.5 }}
                />
                <Text className="font-body text-[11px] text-muted-foreground">your usual</Text>
              </View>
            ) : null}
          </View>
          {balance.rows.map((b) => (
            <Pressable
              key={b.tag}
              onPress={() => onOpenExplore(b.target.scope, b.target.metric, { win: b.target.win })}
              className="flex-row items-center gap-3 py-[7px]"
            >
              <Text style={{ width: 56 }} className="font-body text-[12px] text-foreground">
                {b.tag}
              </Text>
              <View className="relative h-4 flex-1">
                <View className="absolute inset-x-0 top-[7px] h-px bg-border" />
                <View
                  className="absolute top-[6px] h-[3px]"
                  style={{
                    left: `${b.loPct}%`,
                    width: `${b.spanPct}%`,
                    backgroundColor: 'rgba(103,63,138,0.22)',
                  }}
                />
                {b.usual != null ? (
                  <View
                    className="absolute top-[2px] h-[11px] w-[11px] rounded-full border-primary bg-background"
                    style={{ left: `${b.usualPct}%`, marginLeft: -5.5, borderWidth: 1.5 }}
                  />
                ) : null}
                <View
                  className="absolute top-[2px] h-[11px] w-[11px] rounded-full bg-primary"
                  style={{ left: `${b.nowPct}%`, marginLeft: -5.5 }}
                />
              </View>
              <Text
                style={{ width: 104, fontVariant: ['tabular-nums'] }}
                className="text-right font-body text-[11px] text-muted-foreground"
                numberOfLines={1}
              >
                {b.text}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* D. Is anything drifting? */}
      {signals.length > 0 ? (
        <View className="mb-8">
          <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
            Is anything drifting?
          </Text>
          <Text className="mb-3 font-heading text-[24px] tracking-[-0.6px] text-foreground">
            Needs attention
          </Text>
          {signals.map((s) => (
            <View key={s.kind} className="mb-4">
              <SignalCard signal={s} />
              <TextLink
                tone="primary"
                size={9}
                className="-mt-1.5 pl-5"
                onPress={() =>
                  onOpenExplore(s.target.scope, s.target.metric, {
                    win: s.target.win,
                    sel: s.target.sel ?? null,
                  })
                }
              >
                {s.link}
              </TextLink>
            </View>
          ))}
        </View>
      ) : (
        <Text className="mb-8 font-body text-[13px] leading-5 text-muted-foreground">
          Nothing needs attention this week.
        </Text>
      )}

      {/* E. Advanced metrics */}
      <View className="items-start gap-1">
        <TextLink onPress={onToggleAdv}>
          {advOpen ? 'Advanced metrics ▴' : 'Advanced metrics ▾'}
        </TextLink>
        {advOpen ? (
          <View className="mt-1 w-full">
            {adv.map((m) => (
              <MetricRow key={m.label} label={m.label} value={m.value} />
            ))}
            <Text className="mt-2.5 font-body text-[11px] leading-[17px] text-muted-foreground">
              Monotony and strain follow Foster (1998). ACWR is left out: there is no evidence it
              predicts injury or helps manage load (Impellizzeri et al., 2020).
            </Text>
          </View>
        ) : null}
      </View>

      {/* F. Footer */}
      <View className="mt-7 border-t border-border pt-4">
        <TextLink
          tone="primary"
          size={11}
          onPress={() => onOpenExplore({ type: 'all' }, 'volume', { win: 8 })}
        >
          Explore all your data →
        </TextLink>
      </View>
    </>
  );
}
