import { sql } from "@/db";
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const { pin } = await request.json();

  if (!pin || typeof pin !== "string") {
    return NextResponse.json({ error: "PIN is required" }, { status: 400 });
  }

  const result =
    await sql`SELECT id, pin_hash FROM notes WHERE note_key = ${key} LIMIT 1`;
  if (result.length === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const note = result[0];
  if (!note.pin_hash) {
    return NextResponse.json(
      { error: "Note is not PIN-protected" },
      { status: 400 },
    );
  }

  const valid = await compare(pin, note.pin_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 403 });
  }

  // Return full note content on successful verification
  const full =
    await sql`SELECT * FROM notes WHERE note_key = ${key} LIMIT 1`;
  return NextResponse.json({ note: full[0] });
}
