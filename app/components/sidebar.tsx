"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sprout,
  LayoutGrid,
  ArrowLeftRight,
  PieChart,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = { label: string; icon: LucideIcon; href: string };

// Transactions and Spending are everyday views up top; Cards is a separate
// card-management space; Settings last.
const items: NavItem[] = [
  { label: "Overview", icon: LayoutGrid, href: "/" },
  { label: "Transactions", icon: ArrowLeftRight, href: "/transactions" },
  { label: "Spending", icon: PieChart, href: "/spending" },
  { label: "Cards", icon: CreditCard, href: "/cards" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-panel px-5 py-7 text-white">
      <div className="mb-12 flex items-center gap-2 px-2">
        <Sprout className="h-5 w-5 text-accent" />
        <span className="text-[0.95rem] font-semibold tracking-tight">
          Mulch
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ label, icon: Icon, href }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "flex items-center gap-3 rounded-md bg-white/5 px-3 py-2 text-white"
                  : "flex items-center gap-3 rounded-md px-3 py-2 text-white/45 transition-colors hover:bg-white/5 hover:text-white/80"
              }
            >
              <Icon
                className={active ? "h-4 w-4 text-accent" : "h-4 w-4"}
                strokeWidth={2}
              />
              <span className="font-mono text-[0.7rem] uppercase tracking-wider">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="mb-1 font-mono text-[0.55rem] uppercase tracking-widest text-white/30">
          Environment
        </div>
        <div className="font-mono text-[0.65rem] text-white/60">
          Plaid · Sandbox
        </div>
      </div>
    </aside>
  );
}
