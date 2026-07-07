"use client";

import { useState } from "react";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    await fetch("/api/plaid/refresh", { method: "POST" });
    window.location.reload();
  }

  return (
    <button onClick={refresh} disabled={loading}>
      {loading ? "Refreshing…" : "Refresh"}
    </button>
  );
}
