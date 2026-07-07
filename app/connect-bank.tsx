"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

export function ConnectBank() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plaid/link-token", { method: "POST" })
      .then((res) => res.json())
      .then((data) => setLinkToken(data.link_token));
  }, []);

  const onSuccess = useCallback((publicToken: string) => {
    // Next piece: exchange this for an access token and save the connection.
    console.log("Plaid public token:", publicToken);
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank
    </button>
  );
}
