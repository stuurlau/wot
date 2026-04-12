import { Text, View } from 'react-native';
import type { Session } from '@/types';
import { Fonts, Colors } from '@/constants/theme';

type SessionHistoryCardProps = {
  session: Session;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDay(d: Date): { dayName: string; dateStr: string } {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return { dayName: days[d.getDay()], dateStr: `${month}.${day}` };
}

export function SessionHistoryCard({ session }: SessionHistoryCardProps) {
  const { dayName, dateStr } = formatDay(session.startedAt);

  return (
    <View className="flex-row items-center justify-between py-4">
      {/* Left: date column */}
      <View className="items-center mr-4 pr-4" style={{ borderRightWidth: 1, borderRightColor: Colors.border }}>
        <Text
          style={{
            fontFamily: Fonts.body,
            fontSize: 10,
            letterSpacing: 3,
            color: Colors.onSurface,
          }}
        >
          {dayName}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.body,
            fontSize: 9,
            color: Colors.onSurfaceVariant,
            fontVariant: ['tabular-nums'],
            marginTop: 2,
          }}
        >
          {dateStr}
        </Text>
      </View>

      {/* Middle: title + type */}
      <View className="flex-1 mr-4">
        <Text
          style={{
            fontFamily: Fonts.headingBold,
            fontSize: 16,
            letterSpacing: -0.3,
            color: Colors.onSurface,
          }}
          numberOfLines={1}
        >
          {session.title || session.type}
        </Text>
        <Text
          className="mt-1"
          style={{
            fontFamily: Fonts.body,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: Colors.onSurfaceVariant,
          }}
        >
          {session.type} / sRPE: {session.srpe}
        </Text>
      </View>

      {/* Right: duration */}
      <View>
        <Text
          style={{
            fontFamily: Fonts.body,
            fontSize: 8,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: Colors.onSurfaceVariant,
            marginBottom: 2,
          }}
        >
          Duration
        </Text>
        <Text
          style={{
            fontFamily: Fonts.headingSemiBold,
            fontSize: 13,
            fontVariant: ['tabular-nums'],
            color: Colors.onSurface,
          }}
        >
          {formatDuration(session.duration)}
        </Text>
      </View>
    </View>
  );
}
