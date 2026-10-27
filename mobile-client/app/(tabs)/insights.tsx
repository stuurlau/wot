import { useEffect, useMemo, useRef } from 'react';
import { ScrollView } from 'react-native';
import { Screen } from '@/components/screen';

import { AppHeader } from '@/components/app-header';
import { InsightsExplore } from '@/components/insights/explore';
import { InsightsGlance } from '@/components/insights/glance';
import { InsightsScopeSheet } from '@/components/insights/scope-sheet';
import {
  useDailyLogs,
  useExerciseHistory,
  useExerciseTags,
  usePainLogs,
} from '@/hooks/api';
import { recentDateRange } from '@/lib/date-range';
import {
  availableMetrics,
  buildInsightsData,
  dataMaturity,
  defaultMetric,
  parseScopeKey,
  scopeKey,
  todayDayNumber,
  type MetricKey,
  type Scope,
} from '@/lib/insights';
import { useInsightsStore } from '@/stores/insights-store';

// Insights needs deep history: the explorer compares up to a 1-year range
// against the previous period, and "your usual" baselines use everything
// older than the recent window.
const HISTORY_DAYS = 730;

export default function InsightsScreen() {
  const range = useMemo(() => recentDateRange(HISTORY_DAYS), []);
  const historyQuery = useExerciseHistory(range);
  const tagsQuery = useExerciseTags();
  const dailyLogsQuery = useDailyLogs(range);
  const painQuery = usePainLogs({ from: range.from, to: range.to, limit: 100 });

  const store = useInsightsStore();
  const { view, scope, metric, win, cmp, sel, sheetOpen, advOpen } = store;

  const D = useMemo(
    () =>
      buildInsightsData(
        historyQuery.data ?? [],
        tagsQuery.data ?? [],
        dailyLogsQuery.data ?? [],
        painQuery.data?.data ?? [],
        todayDayNumber(),
      ),
    [historyQuery.data, tagsQuery.data, dailyLogsQuery.data, painQuery.data?.data],
  );
  const stage = useMemo(() => dataMaturity(D), [D]);

  // The scroll resets to the top whenever the view or scope changes.
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [view, scope]);

  const openExplore = (
    nextScope: Scope,
    nextMetric: MetricKey,
    extra?: { win?: 4 | 8 | 12 | 26 | 52; sel?: number | null },
  ) => store.openExplore(nextScope, nextMetric, extra);

  const setScope = (nextScope: Scope) => {
    const ok = availableMetrics(D, nextScope);
    store.setScope(nextScope, ok.includes(metric) ? metric : defaultMetric(D, nextScope));
  };

  const pickScope = (key: string) => setScope(parseScopeKey(key));

  const loading = historyQuery.isLoading && stage === 'empty';

  return (
    <Screen>
      <AppHeader />
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}
      >
        {view === 'glance' ? (
          <InsightsGlance
            D={D}
            stage={stage}
            loading={loading}
            sessionCount={D.sessions.length}
            advOpen={advOpen}
            onToggleAdv={store.toggleAdv}
            onOpenExplore={openExplore}
            onOpenPicker={store.openPicker}
          />
        ) : (
          <InsightsExplore
            D={D}
            scope={scope}
            metric={metric}
            win={win}
            cmp={cmp}
            sel={sel}
            onBack={store.backToGlance}
            onSetScope={setScope}
            onSetMetric={store.setMetric}
            onSetWin={store.setWin}
            onSetCmp={store.setCmp}
            onSetSel={store.setSel}
            onOpenSheet={() => store.setSheetOpen(true)}
          />
        )}
      </ScrollView>
      <InsightsScopeSheet
        visible={sheetOpen}
        onClose={() => store.setSheetOpen(false)}
        D={D}
        scopeKey={scopeKey(scope)}
        onPick={pickScope}
      />
    </Screen>
  );
}
