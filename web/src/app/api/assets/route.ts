import { NextResponse } from "next/server";
import { getAllAssets } from "@/lib/db";

// Configure caching - revalidate every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const assets = getAllAssets();

    return NextResponse.json(assets, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching assets:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch assets",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
