import { Pressable, Text } from 'react-native';

import { cn } from '@/lib/utils';

// Text link used across Insights (Explore →, All exercises →, …). Primary tone
// is the brand purple; default is a quiet muted label.
export function TextLink({
  children,
  onPress,
  tone = 'default',
  size = 13,
  className,
}: {
  children: React.ReactNode;
  onPress: () => void;
  tone?: 'default' | 'primary';
  size?: number;
  className?: string;
}) {
  return (
    <Pressable onPress={onPress} className={cn('self-start', className)} hitSlop={6}>
      <Text
        className={cn('font-body-medium', tone === 'primary' ? 'text-primary' : 'text-muted-foreground')}
        style={{ fontSize: size, lineHeight: size + 7 }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
