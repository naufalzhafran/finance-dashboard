import { NextRequest, NextResponse } from "next/server";
import { getPriceHistory, getAssetBySymbol, getLatestPrice } from "@/lib/db";

type RouteContext = {
  params: Promise<{ symbol: string }>;
};

// Configure dynamic caching
export const dynamic = "force-dynamic";

/**
 * GET /api/prices/[symbol]
 * Fetch price history for a specific asset symbol.
 *
 * Query Parameters:
 * - start: Start date (YYYY-MM-DD), defaults to 1 year ago
 * - end: End date (YYYY-MM-DD), defaults to today
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { symbol } = await context.params;
    const searchParams = request.nextUrl.searchParams;

    // Validate symbol
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json(
        {
          error: "Invalid symbol",
          message: "Symbol parameter is required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    // Default to 1 year of data if not specified
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const defaultStart = oneYearAgo.toISOString().split("T")[0];

    const startDate = searchParams.get("start") || defaultStart;
    const endDate = searchParams.get("end") || undefined;

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return NextResponse.json(
        {
          error: "Invalid start date format",
          message: "Start date must be in YYYY-MM-DD format",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    if (endDate && !dateRegex.test(endDate)) {
      return NextResponse.json(
        {
          error: "Invalid end date format",
          message: "End date must be in YYYY-MM-DD format",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    const asset = getAssetBySymbol(symbol);
    if (!asset) {
      return NextResponse.json(
        {
          error: "Asset not found",
          message: `Asset with symbol '${symbol}' was not found`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    const prices = getPriceHistory(symbol, startDate, endDate);
    const latestPrice = getLatestPrice(symbol);

    return NextResponse.json(
      {
        asset,
        latestPrice,
        prices,
        count: prices.length,
      },
      {
        headers: {
          // Cache for 1 minute, allow stale for 5 minutes
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching prices:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch price data",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
