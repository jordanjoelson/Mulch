"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Plus } from "lucide-react";

export function ConnectBank() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plaid/link-token", { method: "POST" })
      .then((res) => res.json())
      .then((data) => setLinkToken(data.link_token));
  }, []);

  const onSuccess = useCallback(async (publicToken: string, metadata: { institution?: { name?: string } | null }) => {
    await fetch("/api/plaid/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        public_token: publicToken,
        institution_name: metadata.institution?.name ?? null,
      }),
    });
    window.location.reload();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 font-mono text-[0.7rem] uppercase tracking-wide text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Connect a bank
      <Plus className="h-3.5 w-3.5" />
    </button>
  );
}
