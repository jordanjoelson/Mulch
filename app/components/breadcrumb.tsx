"use client";

import { usePathname } from "next/navigation";

const names: Record<string, string> = {
  "": "Overview",
  transactions: "Transactions",
  spending: "Spending",
  cards: "Cards",
  settings: "Settings",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const seg = pathname.split("/")[1] ?? "";
  const label = names[seg] ?? "Overview";
  return <div className="eyebrow">Mulch / {label}</div>;
}
