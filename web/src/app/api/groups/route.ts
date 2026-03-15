import { NextRequest, NextResponse } from "next/server";
import { getGroups, createGroup } from "@/lib/api";

export async function GET() {
  const groups = await getGroups();
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const group = await createGroup(body);
    return NextResponse.json(group, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ detail: msg }, { status: 500 });
  }
}
