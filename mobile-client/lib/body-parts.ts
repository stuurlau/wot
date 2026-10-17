import { bodyPartLabel } from '@wot/types';

// Body parts are stored as tree ids; the UI shows human labels. An id that is
// no longer in the tree (or legacy data) falls back to the raw id.
export function bodyPartLabelText(id: string): string {
  return bodyPartLabel(id) ?? id;
}

export function bodyPartsLabelText(ids: string[]): string {
  return ids.map(bodyPartLabelText).join(' · ');
}
