import { Text, View } from 'react-native';
import type { Session } from '@wot/types';

type SessionHistoryCardProps = {
  session: Session;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDay(dateTime: string): { dayName: string; dateStr: string } {
  const d = new Date(dateTime);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return { dayName: days[d.getDay()], dateStr: `${month}.${day}` };
}

export function SessionHistoryCard({ session }: SessionHistoryCardProps) {
  const { dayName, dateStr } = formatDay(session.startedAt);

  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="items-center mr-4 pr-4 border-r border-border">
        <Text className="font-body text-[10px] tracking-[3px] text-foreground">
          {dayName}
        </Text>
        <Text
          className="mt-0.5 font-body text-[9px] text-muted-foreground"
          style={{
            fontVariant: ['tabular-nums'],
          }}
        >
          {dateStr}
        </Text>
      </View>

      <View className="flex-1 mr-4">
        <Text className="font-heading text-[26px] leading-[28px] tracking-[-0.8px] text-foreground" numberOfLines={1}>
          {session.title || session.type}
        </Text>
        <Text className="mt-1 font-body text-[9px] tracking-[2px] uppercase text-muted-foreground">
          {session.type} / sRPE: {session.srpe}
        </Text>
      </View>

      <View>
        <Text className="mb-0.5 font-body text-[8px] tracking-[3px] uppercase text-muted-foreground">
          Duration
        </Text>
        <Text
          className="font-heading text-[14px] text-foreground"
          style={{
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatDuration(session.duration)}
        </Text>
      </View>
    </View>
  );
}
