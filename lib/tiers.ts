import { CARD_CATALOG, type CardProduct } from "@/lib/card-catalog";
import { isEarning, valuePerDollar } from "@/lib/strategy";

export const TIERS = ["S", "A", "B", "C", "D"] as const;
export type Tier = (typeof TIERS)[number];

// Who put a card in a tier. The engine seeds the board, you can override by
// dragging, and the assistant will write here too once it exists — same table,
// three authors, `user` always wins.
export type TierSource = "engine" | "user" | "agent";

export type ScoredCard = {
  product: CardProduct;
  owned: boolean;
  // Extra rewards per year this card would add to your CURRENT wallet, in dollars.
  annualGain: number;
  // annualGain minus the annual fee — the number that actually decides the tier.
  netValue: number;
  tier: Tier;
};

// A 90-day window annualized. Not a full year of history, so it's an estimate —
// but it's an estimate built from what you really spent, not a generic profile.
const ANNUALIZE = 365 / 90;

// Tier cutoffs in net dollars per year. Deliberately blunt and easy to tune:
// the point is a defensible starting board, not false precision.
const CUTOFFS: [Tier, number][] = [
  ["S", 300],
  ["A", 150],
  ["B", 50],
  ["C", 0],
];

function tierFor(netValue: number): Tier {
  for (const [tier, floor] of CUTOFFS) {
    if (netValue >= floor) return tier;
  }
  return "D"; // negative value — the fee costs more than the card earns you
}

/**
 * Scores a card by what it would ADD to the wallet you already hold.
 *
 * Marginal, not absolute, and that distinction is the whole point: a 4x dining
 * card is worth very little if you already carry a 4x dining card. Scoring cards
 * in isolation would stack your S tier with five cards that all do the same job —
 * which is exactly the card-sprawl trap the app exists to prevent.
 *
 * An owned card is scored against the wallet *without itself*, so its number
 * answers "what is this card actually pulling its weight for?"
 */
export function scoreCards(
  spendByCategory: { category: string; total: number }[],
  ownedProducts: CardProduct[],
): ScoredCard[] {
  const spend = spendByCategory.filter((s) => isEarning(s.category));
  const ownedIds = new Set(ownedProducts.map((p) => p.id));

  return CARD_CATALOG.map((product) => {
    const owned = ownedIds.has(product.id);

    // The wallet this card is judged against — never including itself.
    const baseline = ownedProducts.filter((p) => p.id !== product.id);

    let annualGain = 0;
    for (const { category, total } of spend) {
      const annualSpend = total * ANNUALIZE;
      const baselineValue = baseline.length
        ? Math.max(...baseline.map((p) => valuePerDollar(p, category)))
        : 0;
      const cardValue = valuePerDollar(product, category);
      // Only count categories where this card actually beats what you hold.
      const gain = Math.max(cardValue - baselineValue, 0);
      annualGain += (annualSpend * gain) / 100;
    }

    const netValue = annualGain - product.annualFee;

    return { product, owned, annualGain, netValue, tier: tierFor(netValue) };
  }).sort((a, b) => b.netValue - a.netValue);
}
