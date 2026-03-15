import { NextResponse } from "next/server";
import { getAssets } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const assets = await getAssets();
    return NextResponse.json(assets, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
