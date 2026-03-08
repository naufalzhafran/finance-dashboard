import { NextRequest, NextResponse } from "next/server";
import { getFinancialsIncome, getFinancialsBalance, getFinancialsCashflow } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  try {
    const { symbol } = await params;
    const sp = request.nextUrl.searchParams;
    const type = sp.get("type") as "income" | "balance" | "cashflow" | null;
    const period = (sp.get("period") || "annual") as "annual" | "quarterly";

    if (!type || !["income", "balance", "cashflow"].includes(type)) {
      return NextResponse.json({ error: "Valid type (income, balance, cashflow) is required" }, { status: 400 });
    }

    let data;
    if (type === "income") data = await getFinancialsIncome(symbol, period);
    else if (type === "balance") data = await getFinancialsBalance(symbol, period);
    else data = await getFinancialsCashflow(symbol, period);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching financials:", error);
    return NextResponse.json({ error: "Failed to fetch financials" }, { status: 500 });
  }
}
