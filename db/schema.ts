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
  // Credit card liabilities (Plaid Liabilities product).
  nextPaymentDueDate: text("next_payment_due_date"),
  minimumPayment: real("minimum_payment"),
  lastStatementBalance: real("last_statement_balance"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// Maps a connected account to a product in the card catalog. Plaid can't tell us
// that "Plaid Credit Card" is really a Sapphire Reserve, so the user says so once
// and every earn-rate calculation hangs off this.
export const cardAssignments = sqliteTable("card_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: text("account_id").notNull().unique(),
  productId: text("product_id").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// Where a card sits on the strategy tier list. A product with no row falls back
// to the engine's computed tier, so the board is never empty. `source` records
// who placed it — engine, you (drag), or the assistant.
export const cardTiers = sqliteTable("card_tiers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: text("product_id").notNull().unique(),
  tier: text("tier").notNull(),
  source: text("source").notNull().default("user"),
  note: text("note"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// One row per budgeted category. A category with no row is simply unbudgeted;
// clearing a limit deletes the row rather than storing a zero.
export const budgets = sqliteTable("budgets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull().unique(),
  monthlyLimit: real("monthly_limit").notNull(),
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
