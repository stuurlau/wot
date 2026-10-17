import { z } from 'zod';

// Fixed body-part tree: Region → Group → Muscle. Static in code, not the DB —
// the picker, validation and insights rollups all share this one definition.
// Free-text exercise tags (push · pull · legs · prehab) stay separate.
export type BodyPartNode = {
  id: string;
  label: string;
  children?: BodyPartNode[];
};

export const bodyPartTree: BodyPartNode[] = [
  {
    id: 'upper',
    label: 'Upper body',
    children: [
      {
        id: 'chest',
        label: 'Chest',
        children: [
          { id: 'upperchest', label: 'Upper chest' },
          { id: 'lowerchest', label: 'Mid & lower chest' },
        ],
      },
      {
        id: 'back',
        label: 'Back',
        children: [
          { id: 'lats', label: 'Lats' },
          { id: 'upperback', label: 'Upper back' },
          { id: 'lowerback', label: 'Lower back' },
        ],
      },
      {
        id: 'shoulders',
        label: 'Shoulders',
        children: [
          { id: 'frontdelt', label: 'Front delts' },
          { id: 'sidedelt', label: 'Side delts' },
          { id: 'reardelt', label: 'Rear delts' },
          { id: 'cuff', label: 'Rotator cuff' },
        ],
      },
      {
        id: 'arms',
        label: 'Arms',
        children: [
          { id: 'biceps', label: 'Biceps' },
          { id: 'triceps', label: 'Triceps' },
          { id: 'forearms', label: 'Forearms' },
        ],
      },
      { id: 'neck', label: 'Neck' },
    ],
  },
  {
    id: 'core',
    label: 'Core',
    children: [
      { id: 'abs', label: 'Abs' },
      { id: 'obliques', label: 'Obliques' },
      { id: 'deepcore', label: 'Deep core' },
    ],
  },
  {
    id: 'lower',
    label: 'Lower body',
    children: [
      {
        id: 'hips',
        label: 'Hips',
        children: [
          { id: 'glutes', label: 'Glutes' },
          { id: 'hipflexors', label: 'Hip flexors' },
          { id: 'adductors', label: 'Adductors' },
          { id: 'abductors', label: 'Abductors' },
        ],
      },
      {
        id: 'thighs',
        label: 'Thighs',
        children: [
          { id: 'quads', label: 'Quads' },
          { id: 'hamstrings', label: 'Hamstrings' },
        ],
      },
      {
        id: 'lowerleg',
        label: 'Lower legs',
        children: [
          { id: 'calves', label: 'Calves' },
          { id: 'shins', label: 'Shins' },
          { id: 'feet', label: 'Feet & ankles' },
        ],
      },
    ],
  },
];

// Human labels for the three depths.
export const bodyPartLevels = ['Region', 'Group', 'Muscle'] as const;

type IndexedBodyPart = {
  id: string;
  label: string;
  parentId: string | null;
  depth: number;
  children?: BodyPartNode[];
};

const bodyPartIndex = new Map<string, IndexedBodyPart>();
(function walk(nodes: BodyPartNode[], parentId: string | null, depth: number) {
  for (const node of nodes) {
    bodyPartIndex.set(node.id, {
      id: node.id,
      label: node.label,
      parentId,
      depth,
      children: node.children,
    });
    if (node.children) walk(node.children, node.id, depth + 1);
  }
})(bodyPartTree, null, 0);

export const bodyPartIds = [...bodyPartIndex.keys()];

// A stored body part is one of the fixed tree ids.
export const bodyPartIdSchema = z.enum(bodyPartIds as [string, ...string[]]);

// A selection: unique tree ids, at any level and mixable across levels (a
// coarse "Lower body" can sit alongside the specific muscles worked).
export const bodyPartsSchema = z
  .array(bodyPartIdSchema)
  .max(40)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'Body parts must be unique.',
  });

export type BodyPartId = z.infer<typeof bodyPartIdSchema>;

export function bodyPartLabel(id: string): string | null {
  return bodyPartIndex.get(id)?.label ?? null;
}

export function bodyPartDepth(id: string): number | null {
  return bodyPartIndex.get(id)?.depth ?? null;
}

export function bodyPartChildren(id: string | null): BodyPartNode[] {
  return id === null ? bodyPartTree : (bodyPartIndex.get(id)?.children ?? []);
}

// Root-first ancestors of a node (a region's ancestors = []).
export function bodyPartAncestors(id: string): string[] {
  const ancestors: string[] = [];
  let parent = bodyPartIndex.get(id)?.parentId ?? null;
  while (parent) {
    ancestors.unshift(parent);
    parent = bodyPartIndex.get(parent)?.parentId ?? null;
  }
  return ancestors;
}

// The top-level region a node rolls up into (a region is its own root).
export function bodyPartRoot(id: string): string | null {
  if (!bodyPartIndex.has(id)) return null;
  return bodyPartAncestors(id)[0] ?? id;
}

// Unique top-level regions for a selection, in tree order.
export function bodyPartRoots(ids: string[]): string[] {
  const roots = new Set<string>();
  for (const id of ids) {
    const root = bodyPartRoot(id);
    if (root) roots.add(root);
  }
  return bodyPartIds.filter((id) => roots.has(id));
}
