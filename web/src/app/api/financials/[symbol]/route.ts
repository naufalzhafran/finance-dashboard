import { NextRequest, NextResponse } from "next/server";
import { getFinancials } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  try {
    const { symbol } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as
      | "income"
      | "balance"
      | "cashflow"
      | null;
    const period = searchParams.get("period") as "annual" | "quarterly" | null;

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 },
      );
    }

    if (!type || !["income", "balance", "cashflow"].includes(type)) {
      return NextResponse.json(
        { error: "Valid type (income, balance, cashflow) is required" },
        { status: 400 },
      );
    }

    const data = getFinancials(
      decodeURIComponent(symbol),
      type,
      period || "annual",
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching financials:", error);
    return NextResponse.json(
      { error: "Failed to fetch financials" },
      { status: 500 },
    );
  }
}
