import { sql } from "@/db";
import { NextResponse } from "next/server";

const TTL_MAP: Record<string, string> = {
  never: "NULL",
  "1d": "NOW() + INTERVAL '1 day'",
  "7d": "NOW() + INTERVAL '7 days'",
  "30d": "NOW() + INTERVAL '30 days'",
  burn_on_read: "NULL",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const { ttl_mode } = await request.json();

  if (!ttl_mode || !(ttl_mode in TTL_MAP)) {
    return NextResponse.json(
      { error: "Invalid TTL mode. Must be: never, 1d, 7d, 30d, burn_on_read" },
      { status: 400 },
    );
  }

  const result = await sql`
    UPDATE notes
    SET ttl_mode = ${ttl_mode},
        expires_at = CASE
          WHEN ${ttl_mode} = 'never' THEN NULL
          WHEN ${ttl_mode} = 'burn_on_read' THEN NULL
          WHEN ${ttl_mode} = '1d' THEN NOW() + INTERVAL '1 day'
          WHEN ${ttl_mode} = '7d' THEN NOW() + INTERVAL '7 days'
          WHEN ${ttl_mode} = '30d' THEN NOW() + INTERVAL '30 days'
        END
    WHERE note_key = ${key}
    RETURNING id, note_key, ttl_mode, expires_at
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ note: result[0] });
}
