import { Text, View } from 'react-native';
import type { Session } from '@/types';
import { SessionHistoryCard } from './session-history-card';
import { Fonts, Colors } from '@/constants/theme';

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
      {/* Section header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text
          style={{
            fontFamily: Fonts.headingBold,
            fontSize: 22,
            letterSpacing: -0.8,
            color: Colors.onSurface,
          }}
        >
          Sequence History
        </Text>
        <Text
          style={{
            fontFamily: Fonts.body,
            fontSize: 9,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: Colors.onSurfaceVariant,
          }}
        >
          N={recent.length} Recent
        </Text>
      </View>

      {/* Session list */}
      {recent.map((session) => (
        <SessionHistoryCard key={session.id} session={session} />
      ))}
    </View>
  );
}
