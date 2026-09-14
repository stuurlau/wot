import Constants from 'expo-constants';
import { Text, View } from 'react-native';

export function VersionFooter() {
  return (
    <View
      className="items-center px-6 py-1.5"
      style={{ borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)' }}
    >
      <Text className="font-body text-[8px] uppercase tracking-[2px] text-[#a3a09c]">
        WOT v{Constants.expoConfig?.version ?? '0.0.0'}
      </Text>
    </View>
  );
}
