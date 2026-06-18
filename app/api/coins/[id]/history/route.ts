import { NextResponse } from "next/server";

import { fetchMarketHistory } from "@/lib/coingecko";
import { oneYearHistoryStartDate } from "@/lib/historyDate";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const currency = searchParams.get("currency") ?? "eur";

  if (!from || !to) {
    return NextResponse.json(
      { error: "Les paramètres from et to sont requis." },
      { status: 400 }
    );
  }

  const fromTimestamp = Date.parse(`${from}T00:00:00.000Z`) / 1000;
  const toTimestamp = Date.parse(`${to}T23:59:59.999Z`) / 1000;

  if (!Number.isFinite(fromTimestamp) || !Number.isFinite(toTimestamp)) {
    return NextResponse.json({ error: "Dates invalides." }, { status: 400 });
  }

  const oneYearAgoTimestamp =
    Date.parse(`${oneYearHistoryStartDate()}T00:00:00.000Z`) / 1000;
  const boundedFromTimestamp = Math.max(fromTimestamp, oneYearAgoTimestamp);

  try {
    const prices = await fetchMarketHistory({
      coinId: id,
      currency,
      from: Math.floor(boundedFromTimestamp),
      to: Math.ceil(toTimestamp)
    });

    return NextResponse.json({ prices });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de récupérer l'historique."
      },
      { status: 502 }
    );
  }
}
