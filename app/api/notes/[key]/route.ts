import { sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  const result =
    await sql`SELECT * FROM notes WHERE note_key = ${key} LIMIT 1`;
  if (result.length === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const note = result[0];

  // Check expiration
  if (note.expires_at && new Date(note.expires_at) < new Date()) {
    await sql`DELETE FROM notes WHERE id = ${note.id}`;
    return NextResponse.json({ error: "Note has expired" }, { status: 410 });
  }

  // Burn-on-read: delete after serving
  if (note.ttl_mode === "burn_on_read") {
    await sql`DELETE FROM notes WHERE id = ${note.id}`;
  }

  // Strip content + secrets if PIN-protected and not verified
  if (note.is_protected) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content_html, content_json, pin_hash, ...safe } = note;
    return NextResponse.json({ note: safe, requiresPin: true });
  }

  return NextResponse.json({ note });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const { content_html, content_json, content_md } = await request.json();

  const result = await sql`
    UPDATE notes
    SET content_html = COALESCE(${content_html}, content_html),
        content_json = COALESCE(${content_json}::jsonb, content_json),
        content_md = COALESCE(${content_md}, content_md)
    WHERE note_key = ${key}
    RETURNING id, note_key, updated_at
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ note: result[0] });
}
