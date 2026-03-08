import { NextRequest, NextResponse } from "next/server";
import { removeTicker } from "@/lib/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  try {
    const result = await removeTicker(symbol);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg.includes("404") ? 404 : 500;
    return NextResponse.json({ detail: msg }, { status });
  }
}
