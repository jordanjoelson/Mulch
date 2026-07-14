# Mulch

**Most personal finance apps treat your money like a diet. Mulch treats it like chess.**

You know the drill. You open a budgeting app, it shows you a pie chart, it tells you that you spent $340 on takeout, and it makes you feel vaguely bad. So you either drown in the detail or you "keep it simple" to avoid drowning. Both are the same move: retreat.

Here's the thing nobody tells you. Once you have more than two credit cards, this stops being a discipline problem and becomes a **strategy** problem. Which card for groceries. Which one for flights. Which points are you even farming. What's the due date on the one you opened for the bonus and then shoved in a drawer.

That's not a pie chart. That's a board.

## Get it together

Mulch is a home for people who'd rather **play the game than feel bad about it**.

Not "spend less." Not "here's a chart of your shame." Just: you're already spending the money — are you playing the right card?

Because there is a right card. Dining on your 1.5x when the 4x is in the same wallet costs you real money, quietly, every single month. Multiply by a few years and it's a flight to Tokyo you didn't take.

## What it does today

- **Strategy** — the point of all this. Tells you which of *your* cards to swipe in each category, then does the math on what the wrong card already cost you. Real transactions, real numbers, no vibes.
- **Cards** — every card in one place. Balances, utilization, minimums, and the due date you were absolutely about to forget.
- **Spending** — where it went, by category. Plus a budget you can actually edit.
- **Overview** — the whole board at a glance.

## What's coming

- Ecosystem tracking. Stop collecting cards like Pokémon and start **farming one currency** — the Chase Trifecta, the Amex stack, whatever you're building.
- Signup bonus progress. $4,000 in 3 months is a deadline, not a suggestion.
- A card database deep enough to always point you somewhere smart.
- An assistant that knows your actual cards and your actual spend.

## The honest part

This is early. It's a local-first personal project — your data lives in a SQLite file on your machine, not in someone's warehouse.

Point values are **assumptions**, not gospel. Mulch says so out loud, right under the numbers, and lets you tune them. Any app that tells you your points are worth exactly 2.1¢ and won't explain why is selling you something.

Also: it will never, ever tell you to skip the coffee.

## Run it

```bash
npm install
npm run db:migrate
npm run dev
```

Then connect a bank. Plaid sandbox works out of the box, so you can poke at it without handing over anything real.

**Stack:** Next.js · SQLite + Drizzle · Plaid · Tailwind

---

*Mulch. Because the money's already spent — you may as well win with it.*
