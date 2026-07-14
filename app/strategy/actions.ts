"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cardAssignments } from "@/db/schema";
import { findProduct } from "@/lib/card-catalog";

// Tells the engine which real product a connected account is. Blank clears it,
// which drops the card back out of every recommendation.
export async function assignCard(formData: FormData) {
  const accountId = String(formData.get("accountId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!accountId) return;

  if (!productId) {
    await db
      .delete(cardAssignments)
      .where(eq(cardAssignments.accountId, accountId));
    revalidatePath("/strategy");
    return;
  }

  // Guard against a product id that isn't in the catalog — otherwise the account
  // maps to nothing and silently vanishes from the strategy tables.
  if (!findProduct(productId)) return;

  await db
    .insert(cardAssignments)
    .values({ accountId, productId })
    .onConflictDoUpdate({
      target: cardAssignments.accountId,
      set: { productId, updatedAt: sql`(current_timestamp)` },
    });

  revalidatePath("/strategy");
}
