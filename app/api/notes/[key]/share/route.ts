import { sql } from "@/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  const result =
    await sql`SELECT id, read_only_token, edit_token FROM notes WHERE note_key = ${key} LIMIT 1`;
  if (result.length === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const note = result[0];

  // Reuse existing tokens if already generated
  const readOnlyToken = note.read_only_token || randomUUID();
  const editToken = note.edit_token || randomUUID();

  await sql`
    UPDATE notes
    SET read_only_token = ${readOnlyToken},
        edit_token = ${editToken}
    WHERE note_key = ${key}
  `;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return NextResponse.json({
    readOnlyUrl: `${baseUrl}/share/v/${readOnlyToken}`,
    editUrl: `${baseUrl}/share/e/${editToken}`,
  });
}
