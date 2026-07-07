import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// One row per linked bank (a Plaid "Item").
export const connections = sqliteTable("connections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: text("item_id").notNull().unique(),
  institutionName: text("institution_name"),
  accessToken: text("access_token").notNull(), // encrypted at rest
  transactionCursor: text("transaction_cursor"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// One row per account under a linked bank (card, checking, savings, ...).
export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  connectionId: integer("connection_id")
    .notNull()
    .references(() => connections.id),
  accountId: text("account_id").notNull().unique(),
  name: text("name"),
  officialName: text("official_name"),
  type: text("type"),
  subtype: text("subtype"),
  mask: text("mask"),
  currentBalance: real("current_balance"),
  availableBalance: real("available_balance"),
  creditLimit: real("credit_limit"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// One row per transaction, kept in sync via Plaid's /transactions/sync.
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  transactionId: text("transaction_id").notNull().unique(),
  accountId: text("account_id").notNull(),
  name: text("name"),
  merchantName: text("merchant_name"),
  amount: real("amount"),
  date: text("date"),
  category: text("category"),
  pending: integer("pending", { mode: "boolean" }),
});
