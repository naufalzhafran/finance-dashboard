import { NextRequest, NextResponse } from "next/server";
import { getFundamentals, getAssetBySymbol } from "@/lib/db";

type RouteContext = {
  params: Promise<{ symbol: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { symbol } = await context.params;

    const asset = getAssetBySymbol(symbol);
    if (!asset) {
      return NextResponse.json(
        { error: `Asset ${symbol} not found` },
        { status: 404 },
      );
    }

    const fundamentals = getFundamentals(symbol);

    return NextResponse.json({
      asset,
      fundamentals: fundamentals || null,
    });
  } catch (error) {
    console.error("Error fetching fundamentals:", error);
    return NextResponse.json(
      { error: "Failed to fetch fundamentals data" },
      { status: 500 },
    );
  }
}
