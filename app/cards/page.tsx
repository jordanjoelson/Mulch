import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db } from "@/db";
import { accounts, connections } from "@/db/schema";
import { issuerPayUrl } from "@/lib/issuer-links";
import { cardSlug, cardArtSrc, cardGradients } from "@/lib/card-art";
import { money, utilColor, daysUntil, dueLabel } from "@/lib/format";
import { PageHeader, Card, EmptyState } from "@/app/components/ui";
import { CardArt } from "@/app/components/card-art";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const rows = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      subtype: accounts.subtype,
      mask: accounts.mask,
      currentBalance: accounts.currentBalance,
      creditLimit: accounts.creditLimit,
      nextPaymentDueDate: accounts.nextPaymentDueDate,
      minimumPayment: accounts.minimumPayment,
      lastStatementBalance: accounts.lastStatementBalance,
      institution: connections.institutionName,
    })
    .from(accounts)
    .leftJoin(connections, eq(accounts.connectionId, connections.id));

  const cards = rows.filter((a) => a.subtype === "credit card" || a.creditLimit != null);

  const gradients = cardGradients(
    cards.map((c) => cardSlug(c.institution, c.name, c.mask)),
  );

  return (
    <>
      <PageHeader
        title="Cards"
        subtitle="Manage your credit cards — utilization, due dates, and payments."
      />
      {cards.length === 0 ? (
        <EmptyState>No credit cards connected yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {cards.map((c) => {
            const util =
              c.creditLimit != null &&
              c.creditLimit > 0 &&
              c.currentBalance != null
                ? (c.currentBalance / c.creditLimit) * 100
                : null;
            const payUrl = issuerPayUrl(c.institution);
            const days = c.nextPaymentDueDate
              ? daysUntil(c.nextPaymentDueDate)
              : null;
            const slug = cardSlug(c.institution, c.name, c.mask);
            return (
              <Card key={c.id} className="p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <CardArt
                      src={cardArtSrc(slug)}
                      gradient={gradients.get(slug)!}
                      mask={c.mask}
                      alt={c.name ?? "Card"}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {c.name}{" "}
                        {c.mask && (
                          <span className="font-mono text-xs text-ink-dim">
                            ••{c.mask}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-ink-dim">
                        {c.institution}
                      </div>
                    </div>
                  </div>
                  {payUrl && (
                    <a
                      href={payUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded border border-ink-faint px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wide transition-colors hover:border-ink hover:bg-[rgba(25,25,24,0.03)]"
                    >
                      Pay
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="mb-1 flex items-baseline justify-between">
                  <span className="font-mono text-xl font-medium">
                    {money(c.currentBalance)}
                  </span>
                  <span className="font-mono text-xs text-ink-dim">
                    of {money(c.creditLimit)}
                  </span>
                </div>

                {util != null && (
                  <>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-faint">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(util, 100)}%`,
                          background: utilColor(util),
                        }}
                      />
                    </div>
                    <div
                      className="mt-1 font-mono text-[0.62rem]"
                      style={{ color: utilColor(util) }}
                    >
                      {util.toFixed(0)}% utilization
                    </div>
                  </>
                )}

                <div className="mt-4 flex gap-6 border-t border-ink-faint pt-3 text-xs">
                  <div>
                    <div className="eyebrow mb-0.5">Due</div>
                    <div style={{ color: days != null && days < 0 ? "var(--color-bad)" : undefined }}>
                      {days == null ? "—" : dueLabel(days)}
                    </div>
                  </div>
                  <div>
                    <div className="eyebrow mb-0.5">Min payment</div>
                    <div className="font-mono">{money(c.minimumPayment)}</div>
                  </div>
                  <div>
                    <div className="eyebrow mb-0.5">Statement</div>
                    <div className="font-mono">{money(c.lastStatementBalance)}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
