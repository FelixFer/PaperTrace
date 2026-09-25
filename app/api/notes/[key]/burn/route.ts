import { sql } from "@/db";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  try {
    await sql`DELETE FROM notes WHERE note_key = ${key}`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to burn note" }, { status: 500 });
  }
}
