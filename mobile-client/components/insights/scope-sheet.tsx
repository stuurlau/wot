import { Pressable, Text, View } from 'react-native';

import { ChipGroup } from '@/components/insights/chip-group';
import { Sheet } from '@/components/ui/sheet';
import { Colors } from '@/constants/theme';
import { scopeSheetExercises, type InsightsData } from '@/lib/insights';

// "Show data for" bottom sheet: everything / exercise tag / exercise.
export function InsightsScopeSheet({
  visible,
  onClose,
  D,
  scopeKey,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  D: InsightsData;
  scopeKey: string;
  onPick: (key: string) => void;
}) {
  const exercises = scopeSheetExercises(D);

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="mb-4 font-heading text-[24px] tracking-[-0.6px] text-foreground">
        Show data for
      </Text>

      <SheetField label="Everything">
        <ChipGroup
          options={[{ key: 'all', label: 'All training' }]}
          value={scopeKey}
          onChange={onPick}
          size="sm"
        />
      </SheetField>

      {D.tags.length > 0 ? (
        <SheetField label="Exercise tag">
          <ChipGroup
            options={D.tags.map((t) => ({ key: `t:${t}`, label: t }))}
            value={scopeKey}
            onChange={onPick}
            size="sm"
          />
        </SheetField>
      ) : null}

      <SheetField label="Exercise">
        <View>
          {exercises.map((e) => {
            const selected = scopeKey === `e:${e.name}`;
            return (
              <Pressable
                key={e.name}
                onPress={() => onPick(`e:${e.name}`)}
                className="flex-row items-center gap-3 border-b border-border py-3"
              >
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text
                    className="font-body-medium text-[14px]"
                    style={{ color: selected ? Colors.primary : Colors.onSurface }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {e.name}
                  </Text>
                  <Text className="font-body text-[11px] text-muted-foreground">{e.meta}</Text>
                </View>
                <Text className="font-body text-[12px] text-primary">→</Text>
              </Pressable>
            );
          })}
        </View>
      </SheetField>
    </Sheet>
  );
}

function SheetField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="mb-2 font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
        {label}
      </Text>
      {children}
    </View>
  );
}
