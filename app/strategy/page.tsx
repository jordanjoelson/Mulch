import { and, desc, eq, gt, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { accounts, cardAssignments, connections, transactions } from "@/db/schema";
import { money } from "@/lib/format";
import { findProduct, matchProduct, POINT_VALUES } from "@/lib/card-catalog";
import {
  recommendations,
  missedValue,
  categoryLabel,
  multiplierFor,
  type OwnedCard,
} from "@/lib/strategy";
import { PageHeader, SectionHead, Card, EmptyState, Th, Td } from "@/app/components/ui";
import { CardAssigner, type AssignableCard } from "@/app/components/card-assigner";

export const dynamic = "force-dynamic";

const WINDOW_DAYS = 90;

export default async function StrategyPage() {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - WINDOW_DAYS);
  const since = windowStart.toISOString().slice(0, 10);

  const rows = await db
    .select({
      accountId: accounts.accountId,
      name: accounts.name,
      officialName: accounts.officialName,
      mask: accounts.mask,
      subtype: accounts.subtype,
      creditLimit: accounts.creditLimit,
      institution: connections.institutionName,
      productId: cardAssignments.productId,
    })
    .from(accounts)
    .leftJoin(connections, eq(accounts.connectionId, connections.id))
    .leftJoin(cardAssignments, eq(cardAssignments.accountId, accounts.accountId));

  const cards = rows.filter(
    (a) => a.subtype === "credit card" || a.creditLimit != null,
  );

  // A card the user hasn't identified may still be recognisable from Plaid's
  // official_name. We act on that guess so the page works on first load, but
  // flag it as unconfirmed rather than passing it off as fact.
  const identified = cards.map((c) => {
    const assigned = findProduct(c.productId);
    const suggested = assigned
      ? null
      : matchProduct({
          name: c.name,
          officialName: c.officialName,
          institution: c.institution,
        });
    return { card: c, product: assigned ?? suggested, suggested: !assigned };
  });

  const assignable: AssignableCard[] = identified.map(
    ({ card, product, suggested }) => ({
      accountId: card.accountId,
      name: card.name,
      mask: card.mask,
      institution: card.institution,
      productId: product?.id ?? null,
      autoDetected: suggested && product != null,
    }),
  );

  // Only cards mapped to a catalog product can be reasoned about.
  const owned: OwnedCard[] = identified.flatMap(({ card, product }) => {
    if (!product) return [];
    return [
      {
        accountId: card.accountId,
        label: `${product.issuer} ${product.name}`,
        mask: card.mask,
        product,
      },
    ];
  });

  const unconfirmed = assignable.filter((c) => c.autoDetected).length;

  const spendByCategory = await db
    .select({
      category: transactions.category,
      total: sql<number>`sum(${transactions.amount})`.as("total"),
    })
    .from(transactions)
    .where(and(gt(transactions.amount, 0), gte(transactions.date, since)))
    .groupBy(transactions.category)
    .orderBy(desc(sql`total`));

  const txns = await db
    .select({
      accountId: transactions.accountId,
      category: transactions.category,
      amount: transactions.amount,
    })
    .from(transactions)
    .where(and(gt(transactions.amount, 0), gte(transactions.date, since)));

  const recs = recommendations(
    spendByCategory.flatMap((s) =>
      s.category ? [{ category: s.category, total: s.total }] : [],
    ),
    owned,
  );
  const missed = missedValue(
    txns.map((t) => ({
      accountId: t.accountId,
      category: t.category,
      amount: t.amount ?? 0,
    })),
    owned,
  );

  return (
    <>
      <PageHeader
        title="Strategy"
        subtitle="Which card to swipe where, and what the wrong card is costing you."
      />

      {owned.length > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[10px] border border-ink-faint bg-card p-5">
            <div className="eyebrow mb-2">Left on the table</div>
            <div
              className="font-mono text-2xl font-medium"
              style={{
                color:
                  missed.totalMissed > 0 ? "var(--color-bad)" : "var(--color-good)",
              }}
            >
              {money(missed.totalMissed)}
            </div>
            <div className="mt-1 text-xs text-ink-dim">
              last {WINDOW_DAYS} days, wrong-card cost
            </div>
          </div>
          <div className="rounded-[10px] border border-ink-faint bg-card p-5">
            <div className="eyebrow mb-2">Value earned</div>
            <div className="font-mono text-2xl font-medium">
              {money(missed.totalEarned)}
            </div>
            <div className="mt-1 text-xs text-ink-dim">
              at your own redemption rates
            </div>
          </div>
          <div className="rounded-[10px] border border-ink-faint bg-card p-5">
            <div className="eyebrow mb-2">Cards in play</div>
            <div className="font-mono text-2xl font-medium">{owned.length}</div>
            <div className="mt-1 text-xs text-ink-dim">
              {[...new Set(owned.map((c) => c.product.ecosystem))].join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* The mapping has to come first — nothing below it works until Plaid's
          "Plaid Credit Card" is identified as a real product. */}
      <div className="mb-10">
        <SectionHead
          title="Your cards"
          meta={
            unconfirmed > 0 ? (
              <>{unconfirmed} auto-detected · confirm below</>
            ) : (
              <>identify each card</>
            )
          }
        />
        {assignable.length === 0 ? (
          <EmptyState>No credit cards connected yet.</EmptyState>
        ) : (
          <Card>
            <CardAssigner cards={assignable} />
          </Card>
        )}
      </div>

      {owned.length === 0 ? (
        <EmptyState>
          Identify at least one card above to see where to swipe it.
        </EmptyState>
      ) : (
        <>
          <div className="mb-10">
            <SectionHead
              title="Where to swipe"
              meta={<>best card per category</>}
            />
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-ink-faint">
                      <Th>Category</Th>
                      <Th>Use this card</Th>
                      <Th className="text-right">Earn</Th>
                      <Th className="text-right">Value</Th>
                      <Th>Instead of</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {recs.map((r) => (
                      <tr
                        key={r.category}
                        className="border-b border-ink-faint last:border-b-0"
                      >
                        <Td className="font-medium">
                          {categoryLabel(r.category)}
                          <div className="font-mono text-[0.62rem] text-ink-dim">
                            {money(r.spend)} spent
                          </div>
                        </Td>
                        <Td>
                          <span className="font-medium">{r.best.label}</span>
                          {r.best.mask && (
                            <span className="ml-1.5 font-mono text-xs text-ink-dim">
                              ••{r.best.mask}
                            </span>
                          )}
                        </Td>
                        <Td className="text-right font-mono">
                          {multiplierFor(r.best.product, r.category)}x{" "}
                          <span className="text-ink-dim">
                            {r.best.product.currency}
                          </span>
                        </Td>
                        <Td className="text-right font-mono">
                          {r.bestValue.toFixed(1)}¢
                          <span className="text-ink-dim">/$</span>
                        </Td>
                        <Td className="text-ink-dim">
                          {r.runnerUp ? r.runnerUp.label : "—"}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="mb-10">
            <SectionHead
              title="Missed value"
              meta={<>what the wrong card cost</>}
            />
            {missed.rows.length === 0 ? (
              <EmptyState>
                No spend on identified cards in the last {WINDOW_DAYS} days.
              </EmptyState>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-ink-faint">
                        <Th>Category</Th>
                        <Th>You used</Th>
                        <Th>Should have used</Th>
                        <Th className="text-right">Earned</Th>
                        <Th className="text-right">Missed</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {missed.rows.map((r) => {
                        const optimal = r.missedValue < 0.005;
                        return (
                          <tr
                            key={r.category}
                            className="border-b border-ink-faint last:border-b-0"
                          >
                            <Td className="font-medium">
                              {categoryLabel(r.category)}
                              <div className="font-mono text-[0.62rem] text-ink-dim">
                                {money(r.spend)} spent
                              </div>
                            </Td>
                            <Td className="text-ink-dim">{r.usedCard.label}</Td>
                            <Td
                              className={optimal ? "text-ink-dim" : "font-medium"}
                            >
                              {optimal ? "— already optimal" : r.bestCard.label}
                            </Td>
                            <Td className="text-right font-mono">
                              {money(r.earnedValue)}
                            </Td>
                            <Td
                              className="text-right font-mono"
                              style={
                                optimal
                                  ? { color: "var(--color-good)" }
                                  : { color: "var(--color-bad)" }
                              }
                            >
                              {optimal ? "$0.00" : money(r.missedValue)}
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-ink-faint px-6 py-4">
                  <span className="eyebrow">
                    Valued at {POINT_VALUES.UR}¢/UR · {POINT_VALUES.MR}¢/MR ·{" "}
                    {POINT_VALUES.TYP}¢/TYP · {POINT_VALUES.C1}¢/C1 — every
                    recommendation moves with these assumptions
                  </span>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </>
  );
}
