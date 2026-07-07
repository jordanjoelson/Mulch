import { NextResponse } from "next/server";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { syncAccountsForConnection } from "@/lib/sync-accounts";
import { syncTransactionsForConnection } from "@/lib/sync-transactions";
import { syncLiabilitiesForConnection } from "@/lib/sync-liabilities";

// Re-sync accounts and transactions for every linked connection.
export async function POST() {
  const conns = await db.select({ id: connections.id }).from(connections);
  for (const c of conns) {
    await syncAccountsForConnection(c.id);
    await syncLiabilitiesForConnection(c.id);
    await syncTransactionsForConnection(c.id);
  }
  return NextResponse.json({ ok: true, connections: conns.length });
}
