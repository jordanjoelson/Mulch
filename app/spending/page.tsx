import { and, desc, gt, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { money } from "@/lib/format";
import { PageHeader, Card, EmptyState } from "@/app/components/ui";
import { SpendingBars } from "@/app/components/spending-bars";

export const dynamic = "force-dynamic";

export default async function SpendingPage() {
  const since = new Date(Date.now() - 30 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const spending = await db
    .select({
      category: transactions.category,
      total: sql<number>`sum(${transactions.amount})`.as("total"),
    })
    .from(transactions)
    .where(and(gt(transactions.amount, 0), gte(transactions.date, since)))
    .groupBy(transactions.category)
    .orderBy(desc(sql`total`));

  const total = spending.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <PageHeader
        title="Spending"
        subtitle="Where your money went over the last 30 days."
      />
      {spending.length === 0 ? (
        <EmptyState>No spending yet.</EmptyState>
      ) : (
        <>
          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-medium">{money(total)}</span>
            <span className="eyebrow">total · {spending.length} categories</span>
          </div>
          <Card className="p-6">
            <SpendingBars rows={spending} />
          </Card>
        </>
      )}
    </>
  );
}
