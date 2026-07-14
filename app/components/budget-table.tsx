"use client";

import { useFormStatus } from "react-dom";
import { money, utilColor } from "@/lib/format";
import { saveBudgets } from "@/app/spending/actions";
import { Th, Td } from "@/app/components/ui";

export type BudgetRow = {
  category: string;
  spent: number;
  limit: number | null;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent px-3.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save budget"}
    </button>
  );
}

export function BudgetTable({ rows }: { rows: BudgetRow[] }) {
  const budgeted = rows.reduce((s, r) => s + (r.limit ?? 0), 0);
  const spent = rows.reduce((s, r) => s + (r.limit == null ? 0 : r.spent), 0);
  const left = budgeted - spent;

  return (
    <form action={saveBudgets}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-ink-faint">
              <Th>Category</Th>
              <Th className="text-right">Budget</Th>
              <Th className="text-right">Spent</Th>
              <Th className="text-right">Left</Th>
              <Th className="w-40">Used</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              // An unbudgeted row still shows its spend, but no bar or remainder
              // to compare it against.
              const pct =
                r.limit && r.limit > 0 ? (r.spent / r.limit) * 100 : null;
              const remaining = r.limit == null ? null : r.limit - r.spent;

              return (
                <tr
                  key={r.category}
                  className="border-b border-ink-faint last:border-b-0"
                >
                  <Td className="font-medium">{r.category}</Td>
                  <Td className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <span className="font-mono text-ink-dim">$</span>
                      <input
                        type="number"
                        name={`budget:${r.category}`}
                        defaultValue={r.limit ?? ""}
                        min={0}
                        step="10"
                        placeholder="—"
                        aria-label={`Monthly budget for ${r.category}`}
                        className="w-24 rounded-md border border-ink-faint bg-transparent px-2 py-1 text-right font-mono text-[0.82rem] outline-none transition-colors focus:border-accent"
                      />
                    </span>
                  </Td>
                  <Td className="text-right font-mono">{money(r.spent)}</Td>
                  <Td
                    className="text-right font-mono"
                    style={
                      remaining != null && remaining < 0
                        ? { color: "var(--color-bad)" }
                        : undefined
                    }
                  >
                    {remaining == null ? "—" : money(remaining)}
                  </Td>
                  <Td>
                    {pct == null ? (
                      <span className="font-mono text-[0.62rem] text-ink-dim">
                        unbudgeted
                      </span>
                    ) : (
                      <span className="flex items-center gap-2.5">
                        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-faint">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: utilColor(pct),
                            }}
                          />
                        </span>
                        <span className="w-9 text-right font-mono text-[0.62rem] text-ink-dim">
                          {pct.toFixed(0)}%
                        </span>
                      </span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-ink-faint px-6 py-4">
        <span className="eyebrow">
          {money(budgeted)} budgeted · {money(spent)} spent ·{" "}
          <span style={left < 0 ? { color: "var(--color-bad)" } : undefined}>
            {money(left)} left
          </span>
        </span>
        <SaveButton />
      </div>
    </form>
  );
}
