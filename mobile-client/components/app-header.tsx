import { View } from 'react-native';
import { Image } from 'expo-image';

export function AppHeader() {
  return (
    <View className="border-b border-black/5">
      <View className="items-center px-6 pb-3 pt-4">
        <Image
          source={require('@/assets/images/wot-logo.svg')}
          style={{ width: 132, height: 40 }}
          contentFit="contain"
        />
      </View>
    </View>
  );
}
