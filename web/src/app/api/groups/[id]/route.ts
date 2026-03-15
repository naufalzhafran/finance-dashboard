import { NextRequest, NextResponse } from "next/server";
import { updateGroup, deleteGroup } from "@/lib/api";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  try {
    const group = await updateGroup(Number(id), body);
    return NextResponse.json(group);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg.includes("404") ? 404 : 500;
    return NextResponse.json({ detail: msg }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteGroup(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg.includes("404") ? 404 : 500;
    return NextResponse.json({ detail: msg }, { status });
  }
}
