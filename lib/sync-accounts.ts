import { plaid } from "@/lib/plaid";
import { decrypt } from "@/lib/crypto";
import { db } from "@/db";
import { accounts, connections } from "@/db/schema";
import { eq } from "drizzle-orm";

// Fetch accounts for one connection from Plaid and upsert them.
export async function syncAccountsForConnection(connectionId: number) {
  const [conn] = await db
    .select()
    .from(connections)
    .where(eq(connections.id, connectionId));
  if (!conn) return;

  const res = await plaid.accountsGet({
    access_token: decrypt(conn.accessToken),
  });

  for (const a of res.data.accounts) {
    const values = {
      connectionId,
      accountId: a.account_id,
      name: a.name,
      officialName: a.official_name ?? null,
      type: a.type,
      subtype: a.subtype ?? null,
      mask: a.mask ?? null,
      currentBalance: a.balances.current ?? null,
      availableBalance: a.balances.available ?? null,
      creditLimit: a.balances.limit ?? null,
      updatedAt: new Date().toISOString(),
    };

    await db
      .insert(accounts)
      .values(values)
      .onConflictDoUpdate({ target: accounts.accountId, set: values });
  }
}

// Sync every linked connection.
export async function syncAllAccounts() {
  const conns = await db.select({ id: connections.id }).from(connections);
  for (const c of conns) {
    await syncAccountsForConnection(c.id);
  }
}
