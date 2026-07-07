import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, connections } from "@/db/schema";
import { ConnectBank } from "./connect-bank";

export const dynamic = "force-dynamic";

function money(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
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
      institution: connections.institutionName,
    })
    .from(accounts)
    .leftJoin(connections, eq(accounts.connectionId, connections.id));

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Mulch</h1>
      <ConnectBank />

      <h2>Accounts</h2>
      {rows.length === 0 ? (
        <p>No accounts yet. Connect a bank to get started.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rows.map((a) => (
            <li
              key={a.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee",
              }}
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
                  <small style={{ color: "#888" }}> / {money(a.creditLimit)}</small>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
