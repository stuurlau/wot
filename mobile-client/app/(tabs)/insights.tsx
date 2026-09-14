import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceBars } from '@/components/insights/balance-bars';
import { LoadTrendChart } from '@/components/insights/load-trend-chart';
import { SignalCard } from '@/components/insights/signal-card';
import { StrengthProgression } from '@/components/insights/strength-progression';
import { AppHeader } from '@/components/app-header';
import {
  useDailyLogs,
  useExerciseHistory,
  usePainLogs,
  useTrainingSessions,
} from '@/hooks/api';
import { useLoadMetrics } from '@/hooks/use-load-metrics';
import { recentDateRange } from '@/lib/date-range';
import {
  buildWeeklyLoads,
  deriveSignals,
  loadVerdict,
  regionBalance,
  strengthProgression,
} from '@/lib/insights';
import { finishedSessions } from '@/lib/sessions';

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function InsightsScreen() {
  const sessionsRange = useMemo(() => recentDateRange(90), []);
  const historyRange = useMemo(() => recentDateRange(90), []);
  const logsRange = useMemo(() => recentDateRange(28), []);

  const sessionsQuery = useTrainingSessions({ ...sessionsRange, limit: 100 });
  const historyQuery = useExerciseHistory(historyRange);
  const dailyLogsQuery = useDailyLogs(logsRange);
  const painQuery = usePainLogs({ from: recentDateRange(30).from, limit: 100 });

  const sessions = useMemo(
    () => finishedSessions(sessionsQuery.data?.data ?? []),
    [sessionsQuery.data?.data],
  );
  const history = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);
  const dailyLogs = useMemo(() => dailyLogsQuery.data ?? [], [dailyLogsQuery.data]);
  const painLogs = useMemo(() => painQuery.data?.data ?? [], [painQuery.data?.data]);

  const metrics = useLoadMetrics(sessions, dailyLogs);

  const weeklyLoads = useMemo(() => buildWeeklyLoads(sessions), [sessions]);
  const verdict = useMemo(() => loadVerdict(weeklyLoads), [weeklyLoads]);
  const trends = useMemo(() => strengthProgression(history), [history]);
  const balance = useMemo(() => regionBalance(history), [history]);
  const signals = useMemo(
    () => deriveSignals({ sessions, exerciseHistory: history, painLogs, dailyLogs, todayKey: todayKey() }),
    [sessions, history, painLogs, dailyLogs],
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasLoad = weeklyLoads.some((w) => w.load > 0);
  const empty = !hasLoad && history.length === 0;

  return (
    <SafeAreaView className="flex-1">
      <AppHeader />
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}>
          <Text className="mb-6 font-heading text-[40px] leading-[38px] tracking-[-1.6px] text-foreground">
            Insights
          </Text>

          {sessionsQuery.isLoading && empty ? (
            <Text className="font-body text-[12px] text-muted-foreground">Loading…</Text>
          ) : null}

          {empty && !sessionsQuery.isLoading ? (
            <Text className="font-body text-[13px] leading-6 text-muted-foreground">
              Log a few sessions and patterns will start appearing here.
            </Text>
          ) : null}

          {!empty ? (
            <>
              <LoadTrendChart weeklyLoads={weeklyLoads} verdict={verdict} />
              <StrengthProgression trends={trends} />
              <BalanceBars shares={balance} />

              {signals.length > 0 ? (
                <View className="mb-8">
                  <Text className="mb-3 font-heading text-[24px] tracking-[-0.6px] text-foreground">
                    Needs attention
                  </Text>
                  {signals.map((signal) => (
                    <SignalCard key={signal.kind} signal={signal} />
                  ))}
                </View>
              ) : null}

              <Pressable onPress={() => setShowAdvanced((s) => !s)} className="mb-2 self-start">
                <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
                  Advanced metrics ▾
                </Text>
              </Pressable>
              {showAdvanced ? (
                <View className="mb-8">
                  <MetricRow label="Weekly load" value={String(Math.round(metrics.weeklyLoad))} />
                  <MetricRow label="Monotony" value={metrics.monotony.toFixed(2)} />
                  <MetricRow label="Strain" value={String(Math.round(metrics.strain))} />
                  <MetricRow label="ACWR" value={metrics.acwr.toFixed(2)} />
                </View>
              ) : null}
            </>
          ) : null}
        </ScrollView>
    </SafeAreaView>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border py-3">
      <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
        {label}
      </Text>
      <Text
        className="font-heading text-[20px] text-foreground"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
    </View>
  );
}