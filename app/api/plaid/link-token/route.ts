import { NextResponse } from "next/server";
import { CountryCode, Products } from "plaid";
import { plaid } from "@/lib/plaid";

export async function POST() {
  // OAuth banks (Chase, Amex, ...) redirect back to this URL after login, so it
  // must be sent here AND registered in the Plaid dashboard. Env-driven: unset on
  // plain localhost (non-OAuth still works), your tunnel today, your deploy later.
  const redirectUri = process.env.PLAID_REDIRECT_URI;

  const response = await plaid.linkTokenCreate({
    user: { client_user_id: "mulch-local-user" },
    client_name: "Mulch",
    products: [Products.Transactions, Products.Liabilities],
    country_codes: [CountryCode.Us],
    language: "en",
    ...(redirectUri ? { redirect_uri: redirectUri } : {}),
  });

  return NextResponse.json({ link_token: response.data.link_token });
}
