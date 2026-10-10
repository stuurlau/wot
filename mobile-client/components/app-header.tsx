import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export function AppHeader() {
  return (
    <View>
      <View className="items-center justify-center px-6 pb-3 pt-4">
        <Image
          source={require('@/assets/images/wot-logo.svg')}
          style={{ width: 132, height: 40 }}
          contentFit="contain"
        />
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={12}
          accessibilityLabel="Settings"
          className="absolute right-6 top-4"
        >
          <IconSymbol name="gearshape.fill" size={20} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>
    </View>
  );
}
