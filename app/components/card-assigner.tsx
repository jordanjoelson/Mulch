"use client";

import { CARD_CATALOG } from "@/lib/card-catalog";
import { assignCard } from "@/app/strategy/actions";

export type AssignableCard = {
  accountId: string;
  name: string | null;
  mask: string | null;
  institution: string | null;
  productId: string | null;
};

// Grouping by issuer keeps a 15-card <select> navigable, and mirrors how people
// think about cards ("my Chase ones").
const ISSUERS = [...new Set(CARD_CATALOG.map((p) => p.issuer))];

export function CardAssigner({ cards }: { cards: AssignableCard[] }) {
  return (
    <ul className="flex flex-col">
      {cards.map((c) => (
        <li
          key={c.accountId}
          className="flex items-center justify-between gap-4 border-t border-ink-faint px-6 py-4 first:border-t-0"
        >
          <div className="min-w-0">
            <div className="truncate text-[0.9rem] font-medium">
              {c.name}{" "}
              {c.mask && (
                <span className="font-mono text-xs text-ink-dim">
                  ••{c.mask}
                </span>
              )}
            </div>
            <div className="truncate text-xs text-ink-dim">{c.institution}</div>
          </div>

          <form action={assignCard} className="shrink-0">
            <input type="hidden" name="accountId" value={c.accountId} />
            <select
              name="productId"
              defaultValue={c.productId ?? ""}
              // Submitting on change keeps this to one interaction — a Save
              // button per row would be a lot of clicks for a set-once mapping.
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="rounded-md border border-ink-faint bg-card px-2.5 py-1.5 text-[0.8rem] outline-none transition-colors focus:border-accent"
            >
              <option value="">— not set —</option>
              {ISSUERS.map((issuer) => (
                <optgroup key={issuer} label={issuer}>
                  {CARD_CATALOG.filter((p) => p.issuer === issuer).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </form>
        </li>
      ))}
    </ul>
  );
}
