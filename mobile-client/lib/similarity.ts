// Fuzzy exercise-name matching for the "rename similar exercises" flow.
// Trigram Dice coefficient over normalized names: tolerant of typos, case,
// spacing and word order. Runs fully client-side over the user's cached
// exercise names (see `useExerciseNames`), so the suggestion keeps working
// on a flaky connection.

export const NAME_SIMILARITY_THRESHOLD = 0.5;

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

function trigrams(value: string): Set<string> {
  const padded = ` ${value} `;
  const grams = new Set<string>();
  for (let i = 0; i + 3 <= padded.length; i++) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

export function nameSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;
  const ta = trigrams(na);
  const tb = trigrams(nb);
  let overlap = 0;
  for (const gram of ta) {
    if (tb.has(gram)) overlap++;
  }
  return (2 * overlap) / (ta.size + tb.size);
}

/** Names from `names` that fuzzy-match `query`, best match first. */
export function findSimilarNames(query: string, names: string[]): string[] {
  return names
    .filter((name) => nameSimilarity(query, name) >= NAME_SIMILARITY_THRESHOLD)
    .sort((a, b) => nameSimilarity(query, b) - nameSimilarity(query, a) || a.localeCompare(b));
}
