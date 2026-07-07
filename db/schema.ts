import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// One row per linked bank (a Plaid "Item").
export const connections = sqliteTable("connections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: text("item_id").notNull().unique(),
  institutionName: text("institution_name"),
  accessToken: text("access_token").notNull(), // encrypted at rest
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
