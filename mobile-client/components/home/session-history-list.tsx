import { Text, View } from 'react-native';
import type { TrainingSession } from '@wot/types';
import { SessionHistoryCard } from './session-history-card';

type SessionHistoryListProps = {
  sessions: TrainingSession[];
  count?: number;
};

export function SessionHistoryList({ sessions, count = 3 }: SessionHistoryListProps) {
  const recent = sessions
    .slice()
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
    .slice(0, count);

  return (
    <View className="mb-12">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="font-heading text-[28px] tracking-[-0.8px] text-foreground">
          Sequence History
        </Text>
        <Text className="font-body text-[9px] tracking-[3px] uppercase text-muted-foreground">
          N={recent.length} Recent
        </Text>
      </View>

      {recent.length > 0 ? (
        recent.map((session) => <SessionHistoryCard key={session.id} session={session} />)
      ) : (
        <Text className="font-body text-[12px] leading-5 text-muted-foreground">
          No training sessions logged in this period.
        </Text>
      )}
    </View>
  );
}
