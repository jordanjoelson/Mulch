import Link from "next/link";
import { and, desc, eq, gt, gte, sql } from "drizzle-orm";
import { ExternalLink, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { accounts, connections, transactions } from "@/db/schema";
import { issuerPayUrl } from "@/lib/issuer-links";
import { money, utilColor, daysUntil, dueLabel } from "@/lib/format";
import {
  PageHeader,
  SectionHead,
  Card,
  EmptyState,
  Th,
  Td,
} from "@/app/components/ui";
import { SpendingBars } from "@/app/components/spending-bars";

export const dynamic = "force-dynamic";

function ViewAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-ink-dim transition-colors hover:text-ink"
    >
      View all <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

export default async function Home() {
  const rows = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      type: accounts.type,
      subtype: accounts.subtype,
      mask: accounts.mask,
      currentBalance: accounts.currentBalance,
      creditLimit: accounts.creditLimit,
      nextPaymentDueDate: accounts.nextPaymentDueDate,
      minimumPayment: accounts.minimumPayment,
      institution: connections.institutionName,
    })
    .from(accounts)
    .leftJoin(connections, eq(accounts.connectionId, connections.id));

  const recentTxns = await db
    .select({
      id: transactions.id,
      name: transactions.name,
      merchantName: transactions.merchantName,
      amount: transactions.amount,
      date: transactions.date,
      category: transactions.category,
    })
    .from(transactions)
    .orderBy(desc(transactions.date))
    .limit(8);

  // Spending (positive amounts = money out) by category, last 30 days.
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

  // ── Summary tiles ──
  const cashRows = rows.filter((a) => a.type === "depository");
  const cash = cashRows.reduce((s, a) => s + (a.currentBalance ?? 0), 0);
  const creditRows = rows.filter((a) => a.type === "credit");
  const creditUsed = creditRows.reduce((s, a) => s + (a.currentBalance ?? 0), 0);
  const creditLimit = creditRows.reduce((s, a) => s + (a.creditLimit ?? 0), 0);
  const overallUtil = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : null;

  if (rows.length === 0) {
    return (
      <>
        <PageHeader
          title="Overview"
          subtitle="Accounts, spending, and card activity at a glance."
        />
        <EmptyState>No accounts yet. Connect a bank to get started.</EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Accounts, spending, and card activity at a glance."
      />

      {/* Summary bento — Cash hero (spans both rows) + Credit/Utilization stack */}
      <div className="mb-10 grid grid-cols-1 overflow-hidden rounded-[10px] border border-ink-faint bg-card sm:grid-cols-2 sm:grid-rows-2">
        {/* Cash — hero cell */}
        <div className="p-6 transition-colors hover:bg-[rgba(25,25,24,0.025)] sm:row-span-2 sm:flex sm:flex-col sm:justify-center">
          <div className="eyebrow mb-2">Cash</div>
          <div className="font-mono text-3xl font-medium">{money(cash)}</div>
          <div className="mt-1 text-xs text-ink-dim">
            across {cashRows.length} account{cashRows.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Credit used */}
        <div className="border-t border-ink-faint p-5 transition-colors hover:bg-[rgba(25,25,24,0.025)] sm:border-t-0 sm:border-l">
          <div className="eyebrow mb-2">Credit used</div>
          <div className="font-mono text-2xl font-medium">{money(creditUsed)}</div>
          <div className="mt-1 text-xs text-ink-dim">
            of {money(creditLimit)} limit
          </div>
        </div>

        {/* Utilization */}
        <div className="border-t border-ink-faint p-5 transition-colors hover:bg-[rgba(25,25,24,0.025)] sm:border-l">
          <div className="eyebrow mb-2">Utilization</div>
          <div
            className="font-mono text-2xl font-medium"
            style={
              overallUtil == null ? undefined : { color: utilColor(overallUtil) }
            }
          >
            {overallUtil == null ? "—" : `${overallUtil.toFixed(0)}%`}
          </div>
          {overallUtil != null && (
            <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-ink-faint">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(overallUtil, 100)}%`,
                  background: utilColor(overallUtil),
                }}
              />
            </div>
          )}
          <div className="mt-1 text-xs text-ink-dim">
            {creditRows.length} card{creditRows.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* Accounts */}
      <SectionHead title="Accounts" meta={`${rows.length} total`} />
      <Card className="mb-10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[rgba(25,25,24,0.02)]">
                <Th>Account</Th>
                <Th>Institution</Th>
                <Th className="text-right">Balance</Th>
                <Th>Utilization</Th>
                <Th>Due</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const util =
                  a.type === "credit" &&
                  a.creditLimit != null &&
                  a.creditLimit > 0 &&
                  a.currentBalance != null
                    ? (a.currentBalance / a.creditLimit) * 100
                    : null;
                const payUrl =
                  a.type === "credit" ? issuerPayUrl(a.institution) : null;
                const days = a.nextPaymentDueDate
                  ? daysUntil(a.nextPaymentDueDate)
                  : null;
                return (
                  <tr key={a.id} className="border-t border-ink-faint align-middle">
                    <Td>
                      <div className="font-medium">
                        {a.name}{" "}
                        {a.mask && (
                          <span className="font-mono text-xs text-ink-dim">
                            ••{a.mask}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-dim">{a.subtype}</div>
                    </Td>
                    <Td className="text-ink-dim">{a.institution}</Td>
                    <Td className="text-right font-mono">
                      {money(a.currentBalance)}
                      {a.creditLimit != null && (
                        <span className="text-ink-dim"> / {money(a.creditLimit)}</span>
                      )}
                    </Td>
                    <Td>
                      {util == null ? (
                        <span className="text-ink-dim">—</span>
                      ) : (
                        <div className="w-28">
                          <div className="h-1.5 overflow-hidden rounded-full bg-ink-faint">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(util, 100)}%`,
                                background: utilColor(util),
                              }}
                            />
                          </div>
                          <span
                            className="mt-1 block font-mono text-[0.6rem]"
                            style={{ color: utilColor(util) }}
                          >
                            {util.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </Td>
                    <Td>
                      {days == null ? (
                        <span className="text-ink-dim">—</span>
                      ) : (
                        <div className="text-xs">
                          <div style={{ color: days < 0 ? "var(--color-bad)" : undefined }}>
                            {dueLabel(days)}
                          </div>
                          {a.minimumPayment != null && (
                            <div className="text-ink-dim">
                              min {money(a.minimumPayment)}
                            </div>
                          )}
                        </div>
                      )}
                    </Td>
                    <Td className="text-right">
                      {payUrl ? (
                        <a
                          href={payUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded border border-ink-faint px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wide transition-colors hover:border-ink hover:bg-[rgba(25,25,24,0.03)]"
                        >
                          Pay
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-ink-dim">—</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Spending snapshot */}
      <SectionHead
        title="Spending by category"
        meta={
          spending.length > 5 ? <ViewAll href="/spending" /> : "last 30 days"
        }
      />
      <Card className="mb-10 p-6">
        {spending.length === 0 ? (
          <p className="text-sm text-ink-dim">No spending yet.</p>
        ) : (
          <SpendingBars rows={spending.slice(0, 5)} />
        )}
      </Card>

      {/* Recent transactions preview */}
      <SectionHead title="Recent transactions" meta={<ViewAll href="/transactions" />} />
      <Card>
        {recentTxns.length === 0 ? (
          <p className="px-6 py-8 text-sm text-ink-dim">No transactions yet.</p>
        ) : (
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
                {recentTxns.map((t) => (
                  <tr key={t.id} className="border-t border-ink-faint">
                    <Td className="font-medium">{t.merchantName ?? t.name}</Td>
                    <Td className="text-ink-dim">{t.category}</Td>
                    <Td className="font-mono text-ink-dim">{t.date}</Td>
                    <Td className="text-right font-mono">{money(t.amount)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
