// Payment/login URLs per card issuer. Plaid doesn't provide these, so we map
// them from the institution name (substring match, case-insensitive).
const ISSUER_LINKS: { match: string; url: string }[] = [
  { match: "chase", url: "https://www.chase.com/personal/credit-cards/login" },
  { match: "american express", url: "https://www.americanexpress.com/" },
  { match: "amex", url: "https://www.americanexpress.com/" },
  { match: "citi", url: "https://online.citi.com/" },
  { match: "capital one", url: "https://verified.capitalone.com/" },
  { match: "discover", url: "https://www.discover.com/" },
  { match: "bank of america", url: "https://www.bankofamerica.com/" },
  { match: "wells fargo", url: "https://www.wellsfargo.com/" },
  { match: "u.s. bank", url: "https://www.usbank.com/" },
  { match: "us bank", url: "https://www.usbank.com/" },
  { match: "barclay", url: "https://www.barclaycardus.com/" },
  { match: "synchrony", url: "https://www.synchrony.com/" },
  // Plaid sandbox banks, so the button is demonstrable before production.
  { match: "platypus", url: "https://sandbox.plaid.com/" },
  { match: "tartan", url: "https://sandbox.plaid.com/" },
];

export function issuerPayUrl(institutionName: string | null): string | null {
  if (!institutionName) return null;
  const name = institutionName.toLowerCase();
  return ISSUER_LINKS.find((i) => name.includes(i.match))?.url ?? null;
}
