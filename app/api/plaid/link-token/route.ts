import { NextResponse } from "next/server";
import { CountryCode, Products } from "plaid";
import { plaid } from "@/lib/plaid";

export async function POST() {
  const response = await plaid.linkTokenCreate({
    user: { client_user_id: "mulch-local-user" },
    client_name: "Mulch",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  });

  return NextResponse.json({ link_token: response.data.link_token });
}
