import { sql } from "@/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { key } = await request.json();

  if (!key || typeof key !== "string") {
    return NextResponse.json(
      { error: "Note key is required" },
      { status: 400 },
    );
  }

  const trimmed = key.trim();
  if (trimmed.length === 0 || trimmed.length > 64) {
    return NextResponse.json(
      { error: "Key must be between 1 and 64 characters" },
      { status: 400 },
    );
  }

  const existing =
    await sql`SELECT id FROM notes WHERE note_key = ${trimmed} LIMIT 1`;
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "This key is taken. Use the Open field above to access it." },
      { status: 409 },
    );
  }

  const result = await sql`
    INSERT INTO notes (note_key)
    VALUES (${trimmed})
    RETURNING id, note_key, created_at
  `;

  return NextResponse.json({ note: result[0] }, { status: 201 });
}
