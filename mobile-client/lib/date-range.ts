function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function recentDateRange(days: number): { from: string; to: string } {
  const from = new Date();
  from.setDate(from.getDate() - days);

  const to = new Date();
  to.setDate(to.getDate() + 1);

  return { from: dateKey(from), to: dateKey(to) };
}
