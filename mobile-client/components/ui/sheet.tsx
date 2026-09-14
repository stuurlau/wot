import { Modal, Pressable, View } from 'react-native';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Sheet({ visible, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30" onPress={onClose} />
      <View className="absolute inset-x-0 bottom-0 max-h-[80%] rounded-t-3xl bg-background px-6 pt-5 pb-10">
        {children}
      </View>
    </Modal>
  );
}
