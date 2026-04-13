import { Text, View } from 'react-native';
import type { Session } from '@/types';
import { SessionHistoryCard } from './session-history-card';

type SessionHistoryListProps = {
  sessions: Session[];
  count?: number;
};

export function SessionHistoryList({ sessions, count = 3 }: SessionHistoryListProps) {
  const recent = sessions
    .slice()
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
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

      {recent.map((session) => (
        <SessionHistoryCard key={session.id} session={session} />
      ))}
    </View>
  );
}
