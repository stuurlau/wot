import { useState } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Sheet({ visible, onClose, children }: SheetProps) {
  // Content taller than the cap must scroll instead of pushing actions (e.g.
  // the check-in Save button) out of reach. The cap is measured from the
  // keyboard-avoiding container so it stays correct while the keyboard is up;
  // the window height seeds it for the first frame.
  const windowHeight = useWindowDimensions().height;
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const maxHeight = (containerHeight ?? windowHeight) * 0.8;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Shrinks the container by the keyboard overlap so the bottom-anchored
          sheet lifts above the keyboard on both platforms (also inside Modals). */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <View
          style={{ flex: 1 }}
          onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
        >
          <Pressable className="flex-1 bg-black/30" onPress={onClose} />
          <View className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-background px-6 pt-5 pb-10">
            <ScrollView
              style={{ maxHeight }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
