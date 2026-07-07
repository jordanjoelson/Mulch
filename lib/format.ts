export function money(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// Green under 30%, amber under 70%, red above — standard credit-utilization bands.
export function utilColor(pct: number) {
  if (pct < 30) return "var(--color-good)";
  if (pct < 70) return "var(--color-warn)";
  return "var(--color-bad)";
}

// Days until a YYYY-MM-DD due date (negative = past due).
export function daysUntil(dateStr: string) {
  const due = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function dueLabel(days: number) {
  if (days < 0) return `overdue by ${-days}d`;
  if (days === 0) return "due today";
  return `due in ${days}d`;
}
