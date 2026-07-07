import { eq } from "drizzle-orm";
import { plaid } from "@/lib/plaid";
import { decrypt } from "@/lib/crypto";
import { db } from "@/db";
import { accounts, connections } from "@/db/schema";

// Pull credit-card liabilities (due date, minimum, statement balance) for one connection.
export async function syncLiabilitiesForConnection(connectionId: number) {
  const [conn] = await db
    .select()
    .from(connections)
    .where(eq(connections.id, connectionId));
  if (!conn) return;

  let res;
  try {
    res = await plaid.liabilitiesGet({ access_token: decrypt(conn.accessToken) });
  } catch {
    // Institution may not support Liabilities; leave fields as-is.
    return;
  }

  for (const card of res.data.liabilities.credit ?? []) {
    if (!card.account_id) continue;
    await db
      .update(accounts)
      .set({
        nextPaymentDueDate: card.next_payment_due_date ?? null,
        minimumPayment: card.minimum_payment_amount ?? null,
        lastStatementBalance: card.last_statement_balance ?? null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(accounts.accountId, card.account_id));
  }
}
