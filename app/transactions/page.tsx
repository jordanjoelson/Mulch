import { desc } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { money } from "@/lib/format";
import { PageHeader, Card, EmptyState, Th, Td } from "@/app/components/ui";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const txns = await db
    .select({
      id: transactions.id,
      name: transactions.name,
      merchantName: transactions.merchantName,
      amount: transactions.amount,
      date: transactions.date,
      category: transactions.category,
      pending: transactions.pending,
    })
    .from(transactions)
    .orderBy(desc(transactions.date))
    .limit(200);

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle={`Latest ${txns.length} transactions across all accounts.`}
      />
      {txns.length === 0 ? (
        <EmptyState>No transactions yet.</EmptyState>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[rgba(25,25,24,0.02)]">
                  <Th>Merchant</Th>
                  <Th>Category</Th>
                  <Th>Date</Th>
                  <Th className="text-right">Amount</Th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id} className="border-t border-ink-faint">
                    <Td className="font-medium">
                      {t.merchantName ?? t.name}
                      {t.pending && (
                        <span className="ml-2 rounded border border-ink-faint px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide text-ink-dim">
                          pending
                        </span>
                      )}
                    </Td>
                    <Td className="text-ink-dim">{t.category}</Td>
                    <Td className="font-mono text-ink-dim">{t.date}</Td>
                    <Td className="text-right font-mono">{money(t.amount)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
