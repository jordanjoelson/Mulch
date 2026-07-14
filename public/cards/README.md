# Card artwork

Drop a card image here and it is picked up automatically — no code change, no
config. Cards without artwork fall back to a generated gradient.

**Naming:** `<issuer>-<last four>.<ext>`, lowercase, non-alphanumerics collapsed
to hyphens. Accepted extensions, in priority order: `png`, `webp`, `jpg`,
`jpeg`, `svg`.

Slugs for the cards currently connected:

- `first-platypus-bank-3333.png` — First Platypus Bank / Plaid Credit Card
- `first-platypus-bank-9999.png` — First Platypus Bank / Plaid Business Credit Card

The slug is derived in `lib/card-art.ts` (`cardSlug`), so if an issuer or mask
changes, the expected filename changes with it.

Images are rendered at 108×68 (standard card proportions), so supply roughly
that aspect ratio — ideally at 2x (216×136) for crisp rendering.
