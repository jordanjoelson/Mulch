import {
  POINT_VALUES,
  findProduct,
  type CardProduct,
} from "@/lib/card-catalog";

// Categories that never earn rewards. Paying your card and moving money between
// accounts show up as "spend" in the transactions table, but recommending a card
// for them would be nonsense — and they're large, so leaving them in would swamp
// every total on the page.
const NON_EARNING = new Set([
  "LOAN_PAYMENTS",
  "TRANSFER_OUT",
  "TRANSFER_IN",
  "BANK_FEES",
  "INCOME",
]);

export function isEarning(category: string | null): category is string {
  return category != null && !NON_EARNING.has(category);
}

export function multiplierFor(product: CardProduct, category: string): number {
  return product.earn[category] ?? product.base;
}

// The unit everything is ranked by: cents of real value per dollar spent.
// Comparing raw multipliers would be a bug — a 4x Amex card and a 4x cash card
// are only equal if you believe MR are worth exactly 1c.
export function valuePerDollar(product: CardProduct, category: string): number {
  return multiplierFor(product, category) * POINT_VALUES[product.currency];
}

export type OwnedCard = {
  accountId: string;
  label: string;
  mask: string | null;
  product: CardProduct;
};

export type Recommendation = {
  category: string;
  spend: number;
  best: OwnedCard;
  bestValue: number; // cents per dollar
  runnerUp: OwnedCard | null;
};

// For each category you actually spend in, which of YOUR cards should you swipe?
export function recommendations(
  spendByCategory: { category: string; total: number }[],
  owned: OwnedCard[],
): Recommendation[] {
  if (owned.length === 0) return [];

  return spendByCategory
    .filter((s) => isEarning(s.category))
    .map(({ category, total }) => {
      const ranked = [...owned].sort(
        (a, b) =>
          valuePerDollar(b.product, category) -
          valuePerDollar(a.product, category),
      );
      return {
        category,
        spend: total,
        best: ranked[0],
        bestValue: valuePerDollar(ranked[0].product, category),
        runnerUp: ranked[1] ?? null,
      };
    })
    .sort((a, b) => b.spend - a.spend);
}

export type MissedRow = {
  category: string;
  spend: number;
  usedCard: OwnedCard;
  bestCard: OwnedCard;
  earnedValue: number; // dollars
  bestValue: number; // dollars
  missedValue: number; // dollars
};

export type MissedValue = {
  rows: MissedRow[];
  totalMissed: number;
  totalEarned: number;
};

// What did using the wrong card actually cost? Computed per transaction against
// the card it was really charged to, then grouped — this is the number that
// turns "you should get the Gold" into "you left $84 on the table last month".
export function missedValue(
  txns: { accountId: string; category: string | null; amount: number }[],
  owned: OwnedCard[],
): MissedValue {
  const byAccount = new Map(owned.map((c) => [c.accountId, c]));
  const grouped = new Map<string, MissedRow>();
  let totalMissed = 0;
  let totalEarned = 0;

  for (const t of txns) {
    if (!isEarning(t.category) || t.amount <= 0) continue;

    // Only transactions on a card we've identified can be judged.
    const used = byAccount.get(t.accountId);
    if (!used) continue;

    const category = t.category;
    const best = [...owned].sort(
      (a, b) =>
        valuePerDollar(b.product, category) -
        valuePerDollar(a.product, category),
    )[0];

    // cents-per-dollar -> dollars of value on this transaction
    const earned = (t.amount * valuePerDollar(used.product, category)) / 100;
    const potential = (t.amount * valuePerDollar(best.product, category)) / 100;
    const missed = Math.max(potential - earned, 0);

    totalEarned += earned;
    totalMissed += missed;

    const row = grouped.get(category);
    if (row) {
      row.spend += t.amount;
      row.earnedValue += earned;
      row.bestValue += potential;
      row.missedValue += missed;
    } else {
      grouped.set(category, {
        category,
        spend: t.amount,
        usedCard: used,
        bestCard: best,
        earnedValue: earned,
        bestValue: potential,
        missedValue: missed,
      });
    }
  }

  return {
    rows: [...grouped.values()].sort((a, b) => b.missedValue - a.missedValue),
    totalMissed,
    totalEarned,
  };
}

// Human-readable category ("FOOD_AND_DRINK" -> "Food and drink").
export function categoryLabel(category: string): string {
  const words = category.toLowerCase().split("_");
  return words[0][0].toUpperCase() + words[0].slice(1) + " " + words.slice(1).join(" ");
}

export { findProduct };
