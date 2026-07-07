import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, connections, transactions } from "@/db/schema";
import { ConnectBank } from "./connect-bank";
import { RefreshButton } from "./refresh-button";

export const dynamic = "force-dynamic";

function money(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// Green under 30%, amber under 70%, red above — standard credit-utilization bands.
function utilColor(pct: number) {
  if (pct < 30) return "#2e7d32";
  if (pct < 70) return "#ed6c02";
  return "#d32f2f";
}

// Days until a YYYY-MM-DD due date (negative = past due).
function daysUntil(dateStr: string) {
  const due = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

function dueLabel(days: number) {
  if (days < 0) return `overdue by ${-days}d`;
  if (days === 0) return "due today";
  return `due in ${days}d`;
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
    .limit(25);

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Mulch</h1>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <ConnectBank />
        <RefreshButton />
      </div>

      <h2>Accounts</h2>
      {rows.length === 0 ? (
        <p>No accounts yet. Connect a bank to get started.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rows.map((a) => {
            const util =
              a.type === "credit" &&
              a.creditLimit != null &&
              a.creditLimit > 0 &&
              a.currentBalance != null
                ? (a.currentBalance / a.creditLimit) * 100
                : null;
            return (
              <li
                key={a.id}
                style={{ padding: "0.5rem 0", borderBottom: "1px solid #eee" }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    {a.name} {a.mask ? `••${a.mask}` : ""}{" "}
                    <small style={{ color: "#888" }}>
                      {a.institution} · {a.subtype}
                    </small>
                  </span>
                  <span>
                    {money(a.currentBalance)}
                    {a.creditLimit != null && (
                      <small style={{ color: "#888" }}>
                        {" "}
                        / {money(a.creditLimit)}
                      </small>
                    )}
                  </span>
                </div>
                {util != null && (
                  <div style={{ marginTop: 4 }}>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "#eee",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(util, 100)}%`,
                          height: "100%",
                          background: utilColor(util),
                        }}
                      />
                    </div>
                    <small style={{ color: utilColor(util) }}>
                      {util.toFixed(0)}% utilization
                    </small>
                  </div>
                )}
                {a.nextPaymentDueDate && (
                  <small style={{ color: "#555" }}>
                    {a.nextPaymentDueDate} ·{" "}
                    <span
                      style={{
                        color:
                          daysUntil(a.nextPaymentDueDate) < 0
                            ? "#d32f2f"
                            : "#555",
                      }}
                    >
                      {dueLabel(daysUntil(a.nextPaymentDueDate))}
                    </span>
                    {a.minimumPayment != null &&
                      ` · min ${money(a.minimumPayment)}`}
                  </small>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <h2>Recent transactions</h2>
      {recentTxns.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {recentTxns.map((t) => (
            <li
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                {t.merchantName ?? t.name}{" "}
                <small style={{ color: "#888" }}>
                  {t.date} · {t.category}
                </small>
              </span>
              <span>{money(t.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
