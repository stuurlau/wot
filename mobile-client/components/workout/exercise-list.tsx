import type { ReactElement, ReactNode } from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { NestableDraggableFlatList, NestableScrollContainer } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';

import type { TrainingSessionDetail } from '@/lib/api';

type Exercise = TrainingSessionDetail['exercises'][number];

export type ExerciseListProps = {
  exercises: Exercise[];
  onReorder: (ids: string[]) => void;
  /** `drag` starts a reorder drag; undefined where dragging is unsupported (web). */
  renderItem: (item: Exercise, drag: (() => void) | undefined, isActive: boolean) => ReactElement;
  empty: ReactNode;
  footer: ReactNode;
};

// Blocks carry their own vertical rhythm; the footer pads the bottom.
export const exerciseListContentStyle = { paddingHorizontal: 24 };

// The workout screen's scroller + drag-reorder list (long-press a name).
// KeyboardAvoidingView + the nestable pair replaces KeyboardAwareScrollView
// here: draggable lists need the outer scroller to be the library's
// container (see docs/20260926_keyboard_handling.md). Trade-off: focused
// inputs are lifted above the keyboard but no longer auto-scrolled into
// view. Web has no drag support — see exercise-list.web.tsx.
export function ExerciseList({ exercises, onReorder, renderItem, empty, footer }: ExerciseListProps) {
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <NestableScrollContainer
        style={{ flex: 1 }}
        contentContainerStyle={exerciseListContentStyle}
        keyboardShouldPersistTaps="handled"
      >
        {exercises.length === 0 ? (
          empty
        ) : (
          <NestableDraggableFlatList
            data={exercises}
            keyExtractor={(exercise) => exercise.id}
            onDragBegin={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            onDragEnd={({ data, from, to }) => {
              if (from !== to) onReorder(data.map((exercise) => exercise.id));
            }}
            renderItem={({ item, drag, isActive }) => renderItem(item, drag, isActive)}
          />
        )}
        {footer}
      </NestableScrollContainer>
    </KeyboardAvoidingView>
  );
}
