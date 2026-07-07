import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { encrypt } from "@/lib/crypto";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { syncAccountsForConnection } from "@/lib/sync-accounts";
import { syncTransactionsForConnection } from "@/lib/sync-transactions";

export async function POST(request: Request) {
  const { public_token, institution_name } = await request.json();

  const exchange = await plaid.itemPublicTokenExchange({ public_token });
  const accessToken = exchange.data.access_token;
  const itemId = exchange.data.item_id;

  const [conn] = await db
    .insert(connections)
    .values({
      itemId,
      institutionName: institution_name ?? null,
      accessToken: encrypt(accessToken),
    })
    .onConflictDoUpdate({
      target: connections.itemId,
      set: { accessToken: encrypt(accessToken) },
    })
    .returning({ id: connections.id });

  await syncAccountsForConnection(conn.id);
  await syncTransactionsForConnection(conn.id);

  return NextResponse.json({ ok: true, item_id: itemId });
}
