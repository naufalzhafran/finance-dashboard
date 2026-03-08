import { NextRequest, NextResponse } from "next/server";
import { getFundamentals } from "@/lib/api";

type RouteContext = { params: Promise<{ symbol: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { symbol } = await context.params;
    const data = await getFundamentals(symbol);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching fundamentals:", error);
    const is404 = error instanceof Error && error.message.includes("404");
    return NextResponse.json(
      { error: "Failed to fetch fundamentals", message: error instanceof Error ? error.message : "Unknown" },
      { status: is404 ? 404 : 500 },
    );
  }
}
