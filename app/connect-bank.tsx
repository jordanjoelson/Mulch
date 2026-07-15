"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Plus } from "lucide-react";

// The link_token has to outlive the redirect to the bank and back, so it's
// stashed here rather than held only in memory.
const TOKEN_KEY = "plaid_link_token";

// True when this page load is the return leg of a bank's OAuth flow, which Plaid
// signals with an oauth_state_id query param. SSR-safe: false on the server.
function isOAuthReturn(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.search.includes("oauth_state_id")
  );
}

export function ConnectBank() {
  // On the OAuth return leg, reuse the token stashed before the redirect and hand
  // Plaid the full URL. These read client-only APIs, so they live in lazy
  // initializers (guarded for SSR) rather than an effect.
  const [receivedRedirectUri] = useState<string | undefined>(() =>
    isOAuthReturn() ? window.location.href : undefined,
  );
  const [linkToken, setLinkToken] = useState<string | null>(() =>
    isOAuthReturn() ? localStorage.getItem(TOKEN_KEY) : null,
  );

  useEffect(() => {
    // The OAuth return already has its token; only a fresh start mints one.
    if (receivedRedirectUri) return;
    fetch("/api/plaid/link-token", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setLinkToken(data.link_token);
        localStorage.setItem(TOKEN_KEY, data.link_token);
      });
  }, [receivedRedirectUri]);

  const onSuccess = useCallback(
    async (publicToken: string, metadata: { institution?: { name?: string } | null }) => {
      localStorage.removeItem(TOKEN_KEY);
      await fetch("/api/plaid/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_token: publicToken,
          institution_name: metadata.institution?.name ?? null,
        }),
      });
      // Land on a clean URL so a refresh doesn't re-trigger the OAuth branch.
      window.location.href = "/";
    },
    [],
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    receivedRedirectUri,
    onSuccess,
  });

  // On the OAuth return leg there's no button to click — resume automatically.
  useEffect(() => {
    if (receivedRedirectUri && ready) open();
  }, [receivedRedirectUri, ready, open]);

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
