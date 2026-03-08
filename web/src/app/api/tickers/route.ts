import { NextRequest, NextResponse } from "next/server";
import { getTickers, addTicker } from "@/lib/api";

export async function GET() {
  const tickers = await getTickers();
  return NextResponse.json(tickers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const asset = await addTicker(body);
    return NextResponse.json(asset, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg.includes("409") ? 409 : msg.includes("404") ? 404 : 500;
    return NextResponse.json({ detail: msg }, { status });
  }
}
