"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { money } from "@/lib/format";
import { TIERS, type Tier, type TierSource } from "@/lib/tiers";
import { placeCard, resetTiers } from "@/app/strategy/tier-actions";

export type TierCard = {
  productId: string;
  issuer: string;
  name: string;
  currency: string;
  annualFee: number;
  netValue: number;
  owned: boolean;
  tier: Tier;
  source: TierSource;
  art: string | null;
  gradient: string;
};

// Matches the classic tier-list palette: S hot, D cool.
const TIER_COLORS: Record<Tier, string> = {
  S: "#fa8082",
  A: "#fbb17f",
  B: "#fcd987",
  C: "#fdfd80",
  D: "#bff780",
};

function CardChip({ card }: { card: TierCard }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", card.productId)}
      className="group relative w-[104px] cursor-grab active:cursor-grabbing"
      title={`${card.issuer} ${card.name} — ${money(card.netValue)}/yr net${
        card.annualFee ? ` (after $${card.annualFee} fee)` : ""
      }`}
    >
      <div
        className="relative h-[66px] w-full overflow-hidden rounded-md shadow-sm ring-1 ring-white/10 transition-transform group-hover:-translate-y-0.5"
        style={card.art ? undefined : { background: card.gradient }}
      >
        {card.art ? (
          <Image
            src={card.art}
            alt={`${card.issuer} ${card.name}`}
            fill
            sizes="104px"
            className="object-cover"
          />
        ) : (
          <span className="absolute left-2 top-2 h-3 w-4 rounded-[2px] bg-white/25" />
        )}
        {card.owned && (
          <span className="absolute right-1 top-1 rounded bg-accent px-1 font-mono text-[0.45rem] uppercase tracking-wider text-[#191918]">
            owned
          </span>
        )}
      </div>
      <div className="mt-1 leading-tight">
        <div className="truncate text-[0.66rem] font-medium text-white/85">
          {card.name}
        </div>
        <div
          className="font-mono text-[0.58rem]"
          style={{
            color: card.netValue > 0 ? "#7bd88f" : "#ff8f8f",
          }}
        >
          {card.netValue >= 0 ? "+" : ""}
          {money(card.netValue)}/yr
        </div>
      </div>
    </div>
  );
}

export function TierBoard({ cards }: { cards: TierCard[] }) {
  const [pending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState<Tier | null>(null);

  function drop(e: React.DragEvent, tier: Tier) {
    e.preventDefault();
    setDragOver(null);
    const productId = e.dataTransfer.getData("text/plain");
    if (!productId) return;
    startTransition(() => placeCard(productId, tier));
  }

  const manual = cards.filter((c) => c.source !== "engine").length;

  return (
    <div className={pending ? "opacity-60 transition-opacity" : undefined}>
      <div className="overflow-hidden rounded-[10px] border border-ink-faint">
        {TIERS.map((tier) => {
          const row = cards.filter((c) => c.tier === tier);
          return (
            <div
              key={tier}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(tier);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => drop(e, tier)}
              className="flex min-h-[92px] border-b border-black/40 last:border-b-0"
            >
              <div
                className="flex w-16 shrink-0 items-center justify-center font-semibold text-[#191918]"
                style={{ background: TIER_COLORS[tier] }}
              >
                {tier}
              </div>
              <div
                className={`flex flex-1 flex-wrap content-start items-start gap-2.5 p-2.5 transition-colors ${
                  dragOver === tier ? "bg-white/10" : "bg-panel"
                }`}
              >
                {row.map((card) => (
                  <CardChip key={card.productId} card={card} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <span className="eyebrow">
          Ranked by what each card would add to your wallet, per year, after its
          fee — drag to override
        </span>
        {manual > 0 && (
          <button
            type="button"
            onClick={() => startTransition(() => resetTiers())}
            className="shrink-0 rounded-md border border-ink-faint px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider transition-colors hover:border-ink"
          >
            Reset to engine
          </button>
        )}
      </div>
    </div>
  );
}
