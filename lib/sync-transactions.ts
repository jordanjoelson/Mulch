import { eq } from "drizzle-orm";
import type { Transaction } from "plaid";
import { plaid } from "@/lib/plaid";
import { decrypt } from "@/lib/crypto";
import { db } from "@/db";
import { connections, transactions } from "@/db/schema";

function toRow(t: Transaction) {
  return {
    transactionId: t.transaction_id,
    accountId: t.account_id,
    name: t.name,
    merchantName: t.merchant_name ?? null,
    amount: t.amount,
    date: t.date,
    category: t.personal_finance_category?.primary ?? null,
    pending: t.pending,
  };
}

// Pull incremental transaction changes for one connection and apply them.
export async function syncTransactionsForConnection(connectionId: number) {
  const [conn] = await db
    .select()
    .from(connections)
    .where(eq(connections.id, connectionId));
  if (!conn) return;

  const accessToken = decrypt(conn.accessToken);
  let cursor = conn.transactionCursor ?? undefined;
  let hasMore = true;

  while (hasMore) {
    const res = await plaid.transactionsSync({
      access_token: accessToken,
      cursor,
    });
    const data = res.data;

    for (const t of [...data.added, ...data.modified]) {
      const row = toRow(t);
      await db
        .insert(transactions)
        .values(row)
        .onConflictDoUpdate({ target: transactions.transactionId, set: row });
    }

    for (const t of data.removed) {
      if (t.transaction_id) {
        await db
          .delete(transactions)
          .where(eq(transactions.transactionId, t.transaction_id));
      }
    }

    cursor = data.next_cursor;
    hasMore = data.has_more;
  }

  await db
    .update(connections)
    .set({ transactionCursor: cursor })
    .where(eq(connections.id, connectionId));
}
