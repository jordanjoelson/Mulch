"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cardTiers } from "@/db/schema";
import { findProduct } from "@/lib/card-catalog";
import { TIERS, type Tier } from "@/lib/tiers";

function isTier(value: string): value is Tier {
  return (TIERS as readonly string[]).includes(value);
}

// Drops a card into a tier. Persisting means the engine no longer overrides it —
// your placement is the answer from then on.
export async function placeCard(productId: string, tier: string) {
  if (!findProduct(productId) || !isTier(tier)) return;

  await db
    .insert(cardTiers)
    .values({ productId, tier, source: "user" })
    .onConflictDoUpdate({
      target: cardTiers.productId,
      set: { tier, source: "user", updatedAt: sql`(current_timestamp)` },
    });

  revalidatePath("/strategy");
}

// Hands the board back to the engine — drops every manual placement.
export async function resetTiers() {
  await db.delete(cardTiers);
  revalidatePath("/strategy");
}
