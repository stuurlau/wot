import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { Sheet } from '@/components/ui/sheet';
import { FinishSheet } from '@/components/workout/finish-sheet';
import { trainingSessionKeys, useDeleteTrainingSession } from '@/hooks/api';
import { trainingSessions, type TrainingSessionWithLoad } from '@/lib/api';
import { useActiveSessionStore } from '@/stores/active-session-store';

type UnfinishedSessionSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** The orphaned session (duration 0, not in the active-session store). */
  session: TrainingSessionWithLoad | null;
};

/**
 * Recovery prompt for workouts that were started but never finished (e.g. the
 * app was closed mid-workout). Offered on app open from the Today tab: resume
 * keeps logging, finish rates it so it lands in History, discard deletes it.
 */
export function UnfinishedSessionSheet({ visible, onClose, session }: UnfinishedSessionSheetProps) {
  const queryClient = useQueryClient();
  const startActive = useActiveSessionStore((s) => s.start);
  const deleteSession = useDeleteTrainingSession();

  const [finishVisible, setFinishVisible] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = session?.id ?? null;
  useEffect(() => {
    setConfirmDiscard(false);
    setError(null);
  }, [sessionId]);

  // Delayed open of the finish sheet, cleared on unmount.
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (finishTimer.current) clearTimeout(finishTimer.current);
    };
  }, []);

  if (!session) return null;

  const resume = () => {
    startActive(session.id, new Date(session.startedAt).getTime());
    onClose();
    router.push('/workout');
  };

  const finish = async () => {
    setError(null);
    try {
      // Prefetch the detail so the finish sheet opens with a duration
      // suggestion based on the sets that were actually logged.
      await queryClient.ensureQueryData({
        queryKey: trainingSessionKeys.detail(session.id),
        queryFn: () => trainingSessions.get(session.id),
      });
    } catch {
      setError("Couldn't load the workout. Check your connection and try again.");
      return;
    }
    // Close this sheet before opening the finish sheet: two stacked Modals
    // render unreliably on Android (the second can appear behind the first),
    // which made "Finish workout" look like the prompt just reappeared. The
    // delay lets the slide-out finish before the next sheet slides in.
    onClose();
    finishTimer.current = setTimeout(() => setFinishVisible(true), 300);
  };

  const discard = () => {
    if (!confirmDiscard) {
      setConfirmDiscard(true);
      setTimeout(() => setConfirmDiscard(false), 3000);
      return;
    }
    deleteSession.mutate(session.id, {
      onSuccess: onClose,
      onError: () => setError("Couldn't discard. Check your connection and try again."),
    });
  };

  const label = session.title ?? session.type.charAt(0).toUpperCase() + session.type.slice(1);
  const started = new Date(session.startedAt);
  const when = `${started.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })} · ${started.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <>
      <Sheet visible={visible} onClose={onClose}>
        <Text className="mb-1 font-heading text-[24px] tracking-[-0.6px] text-foreground">
          Unfinished workout
        </Text>
        <Text className="mb-5 font-body text-[13px] leading-5 text-muted-foreground">
          {label} · {when} was never finished. Rate it to add it to your log — or resume or
          discard it.
        </Text>

        <Pressable
          onPress={() => void finish()}
          className="mb-3 items-center rounded-2xl bg-primary px-6 py-4 active:opacity-80"
        >
          <Text className="font-body-bold text-[11px] uppercase tracking-[3px] text-primary-foreground">
            Finish workout
          </Text>
        </Pressable>

        <View className="flex-row items-center justify-between">
          <Pressable onPress={resume} hitSlop={8} className="py-2">
            <Text className="font-body text-[10px] uppercase tracking-[3px] text-muted-foreground">
              Resume instead
            </Text>
          </Pressable>
          <Pressable onPress={discard} hitSlop={8} className="py-2" disabled={deleteSession.isPending}>
            <Text className="font-body text-[10px] uppercase tracking-[3px] text-destructive">
              {deleteSession.isPending
                ? 'Discarding…'
                : confirmDiscard
                  ? 'Tap again to discard'
                  : 'Discard'}
            </Text>
          </Pressable>
        </View>

        {error ? (
          <Text className="mt-3 font-body text-[12px] text-destructive">{error}</Text>
        ) : null}
      </Sheet>

      <FinishSheet
        visible={finishVisible}
        onClose={() => setFinishVisible(false)}
        sessionId={session.id}
        backOnSave={false}
      />
    </>
  );
}
