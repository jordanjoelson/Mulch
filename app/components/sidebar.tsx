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
// card-management space.
const items: NavItem[] = [
  { label: "Overview", icon: LayoutGrid, href: "/" },
  { label: "Transactions", icon: ArrowLeftRight, href: "/transactions" },
  { label: "Spending", icon: PieChart, href: "/spending" },
  { label: "Cards", icon: CreditCard, href: "/cards" },
];

// Settings is a destination you reach for rarely, so it sits apart at the foot
// of the rail rather than in the everyday list.
const footerItems: NavItem[] = [
  { label: "Settings", icon: Settings, href: "/settings" },
];

function NavLink({ label, icon: Icon, href }: NavItem) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
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
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-panel px-5 py-7 text-white">
      <div className="mb-12 flex items-center gap-2 px-2">
        <Sprout className="h-5 w-5 text-accent" />
        <span className="text-[0.95rem] font-semibold tracking-tight">
          Mulch
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <nav className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3">
        {footerItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}
