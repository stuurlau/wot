import { Pressable, Text, View } from 'react-native';

import {
  bodyPartAncestors,
  bodyPartDepth,
  bodyPartLevels,
  bodyPartTree,
  type BodyPartNode,
} from '@wot/types';

type BodyPartPickerProps = {
  selected: string[];
  onToggle: (id: string) => void;
};

// How many selected nodes are strict descendants of this one — drives the
// "some parts selected" mark on a collapsed branch.
function countSelectedBelow(id: string, selected: Set<string>): number {
  let count = 0;
  for (const sel of selected) {
    if (bodyPartAncestors(sel).includes(id)) count += 1;
  }
  return count;
}

/**
 * Refining-chips body-part picker. Selections are free across levels: any
 * combination of regions, groups and muscles can be selected together, and
 * every selected branch opens the next level below it so it can be refined.
 */
export function BodyPartPicker({ selected, onToggle }: BodyPartPickerProps) {
  const selectedSet = new Set(selected);

  const levels: { title: string; nodes: BodyPartNode[] }[] = [
    { title: bodyPartLevels[0], nodes: bodyPartTree },
  ];
  const walk = (nodes: BodyPartNode[]) => {
    for (const node of nodes) {
      if (node.children?.length && selectedSet.has(node.id)) {
        const depth = bodyPartDepth(node.id) ?? 0;
        const childLevel = bodyPartLevels[Math.min(depth + 1, bodyPartLevels.length - 1)];
        levels.push({
          title: `${childLevel} · ${node.label.toLowerCase()}`,
          nodes: node.children,
        });
        walk(node.children);
      }
    }
  };
  walk(bodyPartTree);

  return (
    <View>
      {levels.map((level, i) => (
        <View key={level.title} className={i === 0 ? 'mb-2' : 'mb-3'}>
          <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
            {level.title}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {level.nodes.map((node) => {
              const isSelected = selectedSet.has(node.id);
              const below = isSelected ? 0 : countSelectedBelow(node.id, selectedSet);
              const partial = below > 0;
              const caret = node.children?.length ? (isSelected ? ' ▾' : ' ›') : '';
              return (
                <Pressable
                  key={node.id}
                  onPress={() => onToggle(node.id)}
                  className={
                    isSelected
                      ? 'rounded-full bg-primary px-3 py-1.5'
                      : partial
                        ? 'rounded-full bg-surface-container-highest px-3 py-1.5'
                        : 'rounded-full bg-surface-container-low px-3 py-1.5'
                  }
                >
                  <Text
                    className={
                      isSelected
                        ? 'font-body text-[11px] uppercase tracking-[2px] text-primary-foreground'
                        : partial
                          ? 'font-body text-[11px] uppercase tracking-[2px] text-foreground'
                          : 'font-body text-[11px] uppercase tracking-[2px] text-muted-foreground'
                    }
                  >
                    {node.label}
                    {partial ? ` · ${below}` : ''}
                    {caret}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
