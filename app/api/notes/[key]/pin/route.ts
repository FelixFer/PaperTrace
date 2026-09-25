import { sql } from "@/db";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const { pin } = await request.json();

  if (!pin || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN must be exactly 4 digits" },
      { status: 400 },
    );
  }

  const result =
    await sql`SELECT id FROM notes WHERE note_key = ${key} LIMIT 1`;
  if (result.length === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const pin_hash = await hash(pin, 10);

  await sql`
    UPDATE notes
    SET is_protected = TRUE, pin_hash = ${pin_hash}
    WHERE note_key = ${key}
  `;

  return NextResponse.json({ ok: true });
}
