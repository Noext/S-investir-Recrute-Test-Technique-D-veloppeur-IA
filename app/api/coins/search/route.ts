import { NextResponse } from "next/server";

import { searchCoins } from "@/lib/coingecko";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  try {
    const coins = await searchCoins(query);
    return NextResponse.json({ coins });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de rechercher les crypto-monnaies."
      },
      { status: 502 }
    );
  }
}
