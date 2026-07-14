# Card artwork

Drop a card image here and it is picked up automatically — no code change, no
config. Cards without artwork fall back to a generated gradient.

Accepted extensions, in priority order: `png`, `webp`, `avif`, `jpg`, `jpeg`,
`svg`.

## Name it after the product (preferred)

`<product-id>.<ext>`, using the id from `lib/card-catalog.ts`:

- `chase-sapphire-preferred.webp`
- `chase-ink-business-unlimited.webp`
- `capital-one-venture-business.webp`
- `capital-one-savor.avif`

Product art is shared: one file covers your own card, the strategy tier list, and
cards you don't even hold yet. This is almost always what you want — every
Sapphire Preferred looks the same.

## Name it after the account (override)

`<issuer>-<last four>.<ext>`, lowercase, non-alphanumerics collapsed to hyphens —
e.g. `first-platypus-bank-3333.png`. Derived by `cardSlug` in `lib/card-art.ts`.

An account file beats the product file, so use this only for a card that doesn't
look like its stock art (custom or metal designs).

## Sizing

Rendered at 108×68 on Cards and 104×66 on the tier list — standard card
proportions. Supply roughly that ratio, ideally at 2x, for crisp rendering.
