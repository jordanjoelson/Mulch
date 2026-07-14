import fs from "node:fs";
import path from "node:path";

const ART_DIR = path.join(process.cwd(), "public", "cards");
const EXTENSIONS = ["png", "webp", "avif", "jpg", "jpeg", "svg"];

// Card art is dropped in by hand (Plaid doesn't supply it), so a card is keyed
// by issuer + last four: "chase-sapphire-4242" -> public/cards/chase-sapphire-4242.png
export function cardSlug(
  institution: string | null,
  name: string | null,
  mask: string | null,
) {
  const base = [institution ?? name ?? "card", mask ?? ""]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "card";
}

// Returns the public path of the card's artwork, or null if none has been added
// yet — in which case the UI falls back to a gradient.
export function cardArtSrc(slug: string): string | null {
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(ART_DIR, `${slug}.${ext}`))) {
      return `/cards/${slug}.${ext}`;
    }
  }
  return null;
}

/**
 * Artwork for a card, resolved product-first.
 *
 * A cover belongs to the *product* — every Sapphire Preferred looks the same, so
 * one `chase-sapphire-preferred.webp` serves your account, the tier list, and any
 * card you don't even hold. The account-level file (issuer-1234.png) still wins
 * when present, which is what you'd want for a custom or metal-art card.
 */
export function artFor(
  productId: string | null,
  accountSlug: string | null,
): string | null {
  const accountArt = accountSlug ? cardArtSrc(accountSlug) : null;
  if (accountArt) return accountArt;
  return productId ? cardArtSrc(productId) : null;
}

// Muted, on-brand fallbacks. Kept dark so a card still reads as a card, and so
// real artwork dropped in later doesn't look out of place next to them.
const GRADIENTS = [
  "linear-gradient(135deg, #3c3a35 0%, #191918 100%)",
  "linear-gradient(135deg, #24303f 0%, #191918 100%)",
  "linear-gradient(135deg, #1f3a2e 0%, #191918 100%)",
  "linear-gradient(135deg, #3a2f1a 0%, #191918 100%)",
  "linear-gradient(135deg, #33262e 0%, #191918 100%)",
  "linear-gradient(135deg, #2b3340 0%, #191918 100%)",
];

// FNV-1a rather than the usual `hash * 31 + c`: with a 6-colour palette, 31 % 6
// is 1, which degrades the hash into a digit sum and hands two cards at the same
// issuer the same gradient whenever their last four differ by a multiple of six.
function hash(slug: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return Math.abs(h);
}

// Assigns a gradient per card. Hashing the slug keeps a card's colour stable
// across renders (a random pick would reshuffle on every load), but two hashes
// can still land on the same colour — which looks like a bug when the cards sit
// side by side. So collisions walk to the next free slot, making the palette
// distinct on screen for up to GRADIENTS.length cards.
export function cardGradients(slugs: string[]): Map<string, string> {
  const taken = new Set<number>();
  const result = new Map<string, string>();

  for (const slug of slugs) {
    let index = hash(slug) % GRADIENTS.length;
    for (let step = 0; step < GRADIENTS.length && taken.has(index); step++) {
      index = (index + 1) % GRADIENTS.length;
    }
    taken.add(index);
    result.set(slug, GRADIENTS[index]);
  }

  return result;
}
