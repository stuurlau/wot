import { Fragment } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { exerciseListContentStyle, type ExerciseListProps } from '@/components/workout/exercise-list';

// Web: react-native-draggable-flatlist calls findNodeHandle, which
// react-native-web doesn't support (crashes on layout). Plain list, no drag
// reorder — order changes on web are not supported.
export function ExerciseList({ exercises, renderItem, empty, footer }: ExerciseListProps) {
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={exerciseListContentStyle}
      keyboardShouldPersistTaps="handled"
    >
      {exercises.length === 0
        ? empty
        : exercises.map((item) => <Fragment key={item.id}>{renderItem(item, undefined, false)}</Fragment>)}
      {footer}
    </KeyboardAwareScrollView>
  );
}
