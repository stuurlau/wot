import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RuledBackground } from '@/components/ruled-background';
import { cn } from '@/lib/utils';

/**
 * Root container for every screen: paints the app background color and the
 * ruled grid, applies safe-area insets, and lets the screen render its
 * content on top.
 */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <SafeAreaView className={cn('flex-1 bg-background', className)}>
      <RuledBackground />
      {children}
    </SafeAreaView>
  );
}
