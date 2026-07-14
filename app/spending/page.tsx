import { and, desc, gt, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgets, transactions } from "@/db/schema";
import { money } from "@/lib/format";
import { PageHeader, SectionHead, Card, EmptyState } from "@/app/components/ui";
import { SpendingBars } from "@/app/components/spending-bars";
import { BudgetTable, type BudgetRow } from "@/app/components/budget-table";

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

  // Budgets reset on the 1st, so they're measured against month-to-date spend —
  // a different window than the rolling 30-day bars above.
  const monthStart = new Date().toISOString().slice(0, 8) + "01";
  const monthSpend = await db
    .select({
      category: transactions.category,
      total: sql<number>`sum(${transactions.amount})`.as("total"),
    })
    .from(transactions)
    .where(and(gt(transactions.amount, 0), gte(transactions.date, monthStart)))
    .groupBy(transactions.category)
    .orderBy(desc(sql`total`));

  const saved = await db.select().from(budgets);
  const limits = new Map(saved.map((b) => [b.category, b.monthlyLimit]));

  // Every category with spend this month, plus any budgeted category that has
  // no spend yet — otherwise a budget you set would vanish from the grid.
  const spentByCategory = new Map<string, number>();
  for (const row of monthSpend) {
    if (row.category) spentByCategory.set(row.category, row.total);
  }
  for (const category of limits.keys()) {
    if (!spentByCategory.has(category)) spentByCategory.set(category, 0);
  }

  const rows: BudgetRow[] = [...spentByCategory.entries()]
    .map(([category, spent]) => ({
      category,
      spent,
      limit: limits.get(category) ?? null,
    }))
    .sort((a, b) => b.spent - a.spent);

  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long" });

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

          <div className="mt-10">
            <SectionHead
              title="Budget"
              meta={<>{monthLabel} · month to date</>}
            />
            {rows.length === 0 ? (
              <EmptyState>No categories to budget yet.</EmptyState>
            ) : (
              <Card>
                <BudgetTable rows={rows} />
              </Card>
            )}
          </div>
        </>
      )}
    </>
  );
}
