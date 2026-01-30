import { NextRequest, NextResponse } from "next/server";
import { getPriceHistory, getAssetBySymbol, getLatestPrice } from "@/lib/db";

type RouteContext = {
  params: Promise<{ symbol: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { symbol } = await context.params;
    const searchParams = request.nextUrl.searchParams;

    // Default to 1 year of data if not specified
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const defaultStart = oneYearAgo.toISOString().split("T")[0];

    const startDate = searchParams.get("start") || defaultStart;
    const endDate = searchParams.get("end") || undefined;

    const asset = getAssetBySymbol(symbol);
    if (!asset) {
      return NextResponse.json(
        { error: `Asset ${symbol} not found` },
        { status: 404 },
      );
    }

    const prices = getPriceHistory(symbol, startDate, endDate);
    const latestPrice = getLatestPrice(symbol);

    return NextResponse.json({
      asset,
      latestPrice,
      prices,
      count: prices.length,
    });
  } catch (error) {
    console.error("Error fetching prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch price data" },
      { status: 500 },
    );
  }
}
