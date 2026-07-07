import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { encrypt } from "@/lib/crypto";
import { db } from "@/db";
import { connections } from "@/db/schema";

export async function POST(request: Request) {
  const { public_token, institution_name } = await request.json();

  const exchange = await plaid.itemPublicTokenExchange({ public_token });
  const accessToken = exchange.data.access_token;
  const itemId = exchange.data.item_id;

  await db
    .insert(connections)
    .values({
      itemId,
      institutionName: institution_name ?? null,
      accessToken: encrypt(accessToken),
    })
    .onConflictDoNothing({ target: connections.itemId });

  return NextResponse.json({ ok: true, item_id: itemId });
}
