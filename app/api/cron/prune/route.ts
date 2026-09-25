import { sql } from "@/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sql`
      DELETE FROM notes
      WHERE expires_at IS NOT NULL AND expires_at < NOW()
      RETURNING id
    `;
    return NextResponse.json({ pruned: result.length });
  } catch {
    return NextResponse.json({ error: "Prune failed" }, { status: 500 });
  }
}
