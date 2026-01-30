import { NextResponse } from "next/server";
import { getAllAssets } from "@/lib/db";

export async function GET() {
  try {
    const assets = getAllAssets();
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets. Make sure the database exists." },
      { status: 500 },
    );
  }
}
