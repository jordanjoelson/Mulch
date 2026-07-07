import { money } from "@/lib/format";

export type SpendRow = { category: string | null; total: number };

export function SpendingBars({ rows }: { rows: SpendRow[] }) {
  const max = rows[0]?.total ?? 0;
  const total = rows.reduce((s, r) => s + r.total, 0);

  return (
    <ul className="flex flex-col">
      {rows.map((s, i) => {
        const pctOfMax = max > 0 ? (s.total / max) * 100 : 0;
        const pctOfTotal = total > 0 ? (s.total / total) * 100 : 0;
        return (
          <li
            key={s.category ?? "uncategorized"}
            className="border-t border-ink-faint py-3.5 first:border-t-0"
          >
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="flex items-baseline gap-2.5">
                <span className="font-mono text-[0.62rem] text-ink-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.9rem] font-medium">
                  {s.category ?? "Uncategorized"}
                </span>
              </span>
              <span className="font-mono text-[0.9rem]">{money(s.total)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-faint">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${pctOfMax}%` }}
                />
              </div>
              <span className="w-9 text-right font-mono text-[0.62rem] text-ink-dim">
                {pctOfTotal.toFixed(0)}%
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
