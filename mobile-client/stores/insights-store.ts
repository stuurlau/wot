import { create } from 'zustand';

import type { CompareMode, MetricKey, RangeWeeks, Scope } from '@/lib/insights';

// UI state for the Insights tab (glance ↔ explorer). Lives in a store so the
// tab bar can reset the view: tapping the Insights tab while exploring returns
// to the glance (docs/20261015_insights_glance_explorer_redesign.md).
type InsightsViewState = {
  view: 'glance' | 'explore';
  scope: Scope;
  metric: MetricKey;
  win: RangeWeeks;
  cmp: CompareMode;
  // Selected week (absolute week number); null = current week.
  sel: number | null;
  sheetOpen: boolean;
  advOpen: boolean;
};

type InsightsViewActions = {
  // Open the explorer on a scope + metric; callers pass an already-validated
  // metric (see availableMetrics/defaultMetric in lib/insights).
  openExplore: (
    scope: Scope,
    metric: MetricKey,
    extra?: { win?: RangeWeeks; sel?: number | null; sheetOpen?: boolean },
  ) => void;
  setScope: (scope: Scope, metric: MetricKey) => void;
  setMetric: (metric: MetricKey) => void;
  setWin: (win: RangeWeeks) => void;
  setCmp: (cmp: CompareMode) => void;
  setSel: (sel: number | null) => void;
  setSheetOpen: (open: boolean) => void;
  toggleAdv: () => void;
  // "All exercises →": explorer with the scope sheet open, keeping the
  // current scope/metric.
  openPicker: () => void;
  backToGlance: () => void;
};

const initialState: InsightsViewState = {
  view: 'glance',
  scope: { type: 'all' },
  metric: 'volume',
  win: 8,
  cmp: 'avg',
  sel: null,
  sheetOpen: false,
  advOpen: false,
};

export const useInsightsStore = create<InsightsViewState & InsightsViewActions>((set) => ({
  ...initialState,
  openExplore: (scope, metric, extra) =>
    set({
      view: 'explore',
      scope,
      metric,
      win: extra?.win ?? 8,
      sel: extra?.sel ?? null,
      sheetOpen: extra?.sheetOpen ?? false,
    }),
  setScope: (scope, metric) => set({ scope, metric, sheetOpen: false, sel: null }),
  setMetric: (metric) => set({ metric, sel: null }),
  setWin: (win) => set({ win }),
  setCmp: (cmp) => set({ cmp }),
  setSel: (sel) => set({ sel }),
  setSheetOpen: (sheetOpen) => set({ sheetOpen }),
  toggleAdv: () => set((s) => ({ advOpen: !s.advOpen })),
  openPicker: () => set({ view: 'explore', sheetOpen: true, sel: null }),
  backToGlance: () => set({ view: 'glance', sheetOpen: false }),
}));
