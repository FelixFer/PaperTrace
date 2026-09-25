import { sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await sql`SELECT version()`;
    return NextResponse.json({ status: "ok", postgres: result[0].version });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Database connection failed" },
      { status: 500 },
    );
  }
}
