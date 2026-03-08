import { NextRequest, NextResponse } from "next/server";
import { getPrices } from "@/lib/api";

type RouteContext = { params: Promise<{ symbol: string }> };

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { symbol } = await context.params;
    const sp = request.nextUrl.searchParams;
    const start = sp.get("start") || undefined;
    const end = sp.get("end") || undefined;

    const data = await getPrices(symbol, start, end);

    return NextResponse.json(
      {
        asset: data.asset,
        latestPrice: data.latest_price,
        prices: data.prices,
        count: data.count,
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("Error fetching prices:", error);
    const is404 = error instanceof Error && error.message.includes("404");
    return NextResponse.json(
      { error: "Failed to fetch price data", message: error instanceof Error ? error.message : "Unknown" },
      { status: is404 ? 404 : 500 },
    );
  }
}
