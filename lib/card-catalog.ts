// The reference database: what each card product actually earns.
//
// Plaid tells us the account and the transaction, but nothing about the card
// *product* — a Sapphire Reserve arrives as "Plaid Credit Card". So earn rates
// live here and are mapped onto an account by hand (see `cardAssignments`).
//
// Earn rates are keyed to Plaid's personal-finance-category taxonomy, which is
// what transactions actually carry. That mapping is the whole ballgame: a rate
// keyed to "dining" instead of FOOD_AND_DRINK could never be matched to spend.

// Cents per point. These are the assumption that every recommendation rests on:
// a 4x Amex card only beats a 2% cash card if you believe MR are worth >1c.
// Values here are conservative transfer-partner floors, not aspirational
// TPG-style valuations. Tune them and the engine's advice moves with them.
export const POINT_VALUES = {
  UR: 1.5, // Chase Ultimate Rewards
  MR: 1.5, // Amex Membership Rewards
  TYP: 1.2, // Citi ThankYou Points
  C1: 1.5, // Capital One miles
  CASH: 1.0, // cash back — 1c by definition
} as const;

export type Currency = keyof typeof POINT_VALUES;

export type CardProduct = {
  id: string;
  issuer: string;
  name: string;
  currency: Currency;
  annualFee: number;
  // Multiplier per Plaid category. Anything unlisted earns `base`.
  earn: Partial<Record<string, number>>;
  base: number;
  // Ecosystem the points belong to — the thing you "farm" (Chase Trifecta etc).
  ecosystem: string;
  notes?: string;
};

export const CARD_CATALOG: CardProduct[] = [
  // ---- Chase / Ultimate Rewards ----
  {
    id: "chase-freedom-unlimited",
    issuer: "Chase",
    name: "Freedom Unlimited",
    currency: "UR",
    annualFee: 0,
    base: 1.5,
    earn: { FOOD_AND_DRINK: 3, TRAVEL: 5 },
    ecosystem: "Chase Trifecta",
    notes: "1.5x everywhere — the catch-all leg of the trifecta.",
  },
  {
    id: "chase-freedom-flex",
    issuer: "Chase",
    name: "Freedom Flex",
    currency: "UR",
    annualFee: 0,
    base: 1,
    earn: { FOOD_AND_DRINK: 3, TRAVEL: 5 },
    ecosystem: "Chase Trifecta",
    notes: "5x rotating quarterly categories (activation required, not modeled).",
  },
  {
    id: "chase-sapphire-preferred",
    issuer: "Chase",
    name: "Sapphire Preferred",
    currency: "UR",
    annualFee: 95,
    base: 1,
    earn: { FOOD_AND_DRINK: 3, TRAVEL: 2 },
    ecosystem: "Chase Trifecta",
    notes: "Unlocks transfer partners for the whole Chase stack.",
  },
  {
    id: "chase-sapphire-reserve",
    issuer: "Chase",
    name: "Sapphire Reserve",
    currency: "UR",
    annualFee: 550,
    base: 1,
    earn: { FOOD_AND_DRINK: 3, TRAVEL: 3 },
    ecosystem: "Chase Trifecta",
  },
  {
    id: "chase-ink-business-cash",
    issuer: "Chase",
    name: "Ink Business Cash",
    currency: "UR",
    annualFee: 0,
    base: 1,
    earn: { GENERAL_SERVICES: 5, RENT_AND_UTILITIES: 2, FOOD_AND_DRINK: 2 },
    ecosystem: "Chase Trifecta",
  },

  // ---- Amex / Membership Rewards ----
  {
    id: "amex-gold",
    issuer: "American Express",
    name: "Gold",
    currency: "MR",
    annualFee: 325,
    base: 1,
    earn: { FOOD_AND_DRINK: 4, GENERAL_MERCHANDISE: 4, TRAVEL: 3 },
    ecosystem: "Amex Trifecta",
    notes: "4x dining and US supermarkets — the strongest everyday earn.",
  },
  {
    id: "amex-platinum",
    issuer: "American Express",
    name: "Platinum",
    currency: "MR",
    annualFee: 695,
    base: 1,
    earn: { TRAVEL: 5 },
    ecosystem: "Amex Trifecta",
  },
  {
    id: "amex-blue-cash-preferred",
    issuer: "American Express",
    name: "Blue Cash Preferred",
    currency: "CASH",
    annualFee: 95,
    base: 1,
    earn: { GENERAL_MERCHANDISE: 6, TRANSPORTATION: 3, RENT_AND_UTILITIES: 3 },
    ecosystem: "Amex Cash",
  },

  // ---- Citi / ThankYou ----
  {
    id: "citi-strata-premier",
    issuer: "Citi",
    name: "Strata Premier",
    currency: "TYP",
    annualFee: 95,
    base: 1,
    earn: {
      FOOD_AND_DRINK: 3,
      TRAVEL: 3,
      TRANSPORTATION: 3,
      RENT_AND_UTILITIES: 3,
    },
    ecosystem: "Citi Trifecta",
  },
  {
    id: "citi-double-cash",
    issuer: "Citi",
    name: "Double Cash",
    currency: "TYP",
    annualFee: 0,
    base: 2,
    ecosystem: "Citi Trifecta",
    earn: {},
    notes: "Flat 2x — the floor every other card must beat.",
  },
  {
    id: "citi-custom-cash",
    issuer: "Citi",
    name: "Custom Cash",
    currency: "TYP",
    annualFee: 0,
    base: 1,
    earn: { FOOD_AND_DRINK: 5 },
    ecosystem: "Citi Trifecta",
    notes: "5x on your top category each cycle (capped; modeled as dining).",
  },

  // ---- Capital One ----
  {
    id: "capital-one-venture-x",
    issuer: "Capital One",
    name: "Venture X",
    currency: "C1",
    annualFee: 395,
    base: 2,
    earn: { TRAVEL: 5 },
    ecosystem: "Capital One",
  },
  {
    id: "capital-one-savor",
    issuer: "Capital One",
    name: "Savor",
    currency: "CASH",
    annualFee: 0,
    base: 1,
    earn: { FOOD_AND_DRINK: 3, ENTERTAINMENT: 3, GENERAL_MERCHANDISE: 3 },
    ecosystem: "Capital One",
  },

  // ---- Generic ----
  {
    id: "generic-2-percent",
    issuer: "Other",
    name: "Flat 2% cash back",
    currency: "CASH",
    annualFee: 0,
    base: 2,
    earn: {},
    ecosystem: "Cash",
  },
  {
    id: "generic-1-percent",
    issuer: "Other",
    name: "Flat 1% cash back",
    currency: "CASH",
    annualFee: 0,
    base: 1,
    earn: {},
    ecosystem: "Cash",
  },
];

export function findProduct(id: string | null): CardProduct | null {
  if (!id) return null;
  return CARD_CATALOG.find((p) => p.id === id) ?? null;
}

// Issuers write their own name in a dozen ways ("AMEX", "American Express Co").
const ISSUER_ALIASES: Record<string, string[]> = {
  Chase: ["chase", "jpmorgan", "jp morgan"],
  "American Express": ["american express", "amex"],
  Citi: ["citi", "citibank"],
  "Capital One": ["capital one", "capitalone"],
  Other: [],
};

function normalize(value: string | null): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Guesses which catalog product an account is, from what Plaid gives us.
 *
 * Plaid returns `official_name` — in production that's the issuer's real product
 * string ("Chase Sapphire Reserve Visa Signature"), so it's usually enough. It is
 * nullable though, and issuers are inconsistent ("CREDIT CARD"), so this is a
 * suggestion the user confirms, never a silent decision.
 *
 * Deliberately strict: the issuer must match AND every word of the product name
 * must appear. A loose match that turns a Freedom Flex into a Sapphire Reserve
 * would quietly corrupt every recommendation downstream — the one failure mode
 * nobody would ever catch. No match is much cheaper than a wrong match.
 */
export function matchProduct(account: {
  name: string | null;
  officialName: string | null;
  institution: string | null;
}): CardProduct | null {
  const haystack = normalize(
    [account.officialName, account.name, account.institution].join(" "),
  );
  if (!haystack) return null;

  let best: CardProduct | null = null;
  let bestScore = 0;

  for (const product of CARD_CATALOG) {
    // The generic fallbacks describe no real product, so they can't be detected.
    if (product.issuer === "Other") continue;

    const issuerHit = (ISSUER_ALIASES[product.issuer] ?? []).some((alias) =>
      haystack.includes(alias),
    );
    if (!issuerHit) continue;

    const words = normalize(product.name).split(" ");
    if (!words.every((word) => haystack.includes(word))) continue;

    // Prefer the most specific product: "sapphire reserve" (2 words) should win
    // over a hypothetical "sapphire" (1 word) when both match.
    if (words.length > bestScore) {
      best = product;
      bestScore = words.length;
    }
  }

  return best;
}
