"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    await fetch("/api/plaid/refresh", { method: "POST" });
    window.location.reload();
  }

  return (
    <button
      onClick={refresh}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-md border border-ink-faint px-4 py-2 font-mono text-[0.7rem] uppercase tracking-wide transition-colors hover:border-ink hover:bg-[rgba(25,25,24,0.03)] disabled:opacity-40"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Refreshing" : "Refresh"}
    </button>
  );
}
