"use client";

import { CARD_CATALOG } from "@/lib/card-catalog";
import { assignCard } from "@/app/strategy/actions";

export type AssignableCard = {
  accountId: string;
  name: string | null;
  mask: string | null;
  institution: string | null;
  productId: string | null;
  // True when productId is a guess from Plaid's official_name rather than a
  // choice the user made. The advice already uses it, so say so plainly.
  autoDetected: boolean;
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
            <div className="flex items-center gap-2">
              <span className="truncate text-[0.9rem] font-medium">
                {c.name}{" "}
                {c.mask && (
                  <span className="font-mono text-xs text-ink-dim">
                    ••{c.mask}
                  </span>
                )}
              </span>
              {c.autoDetected && (
                <span
                  title="Guessed from the account name your bank reports. Already used for advice — correct it if it's wrong."
                  className="shrink-0 rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-accent"
                >
                  auto
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
