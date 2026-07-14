"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { budgets } from "@/db/schema";

const FIELD_PREFIX = "budget:";

// Saves the whole budget grid in one submit. Fields arrive as `budget:<category>`;
// a blank or zero limit means "unbudgeted", which removes the row.
export async function saveBudgets(formData: FormData) {
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith(FIELD_PREFIX)) continue;

    const category = key.slice(FIELD_PREFIX.length);
    const raw = String(value).trim();
    const limit = raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(limit) || limit < 0) continue;

    if (limit === 0) {
      await db.delete(budgets).where(eq(budgets.category, category));
      continue;
    }

    await db
      .insert(budgets)
      .values({ category, monthlyLimit: limit })
      .onConflictDoUpdate({
        target: budgets.category,
        set: { monthlyLimit: limit, updatedAt: sql`(current_timestamp)` },
      });
  }

  revalidatePath("/spending");
}
