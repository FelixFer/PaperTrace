import { sql } from "@/db";
import Link from "next/link";
import { NoteEditor } from "@/components/editor/NoteEditor";

export const dynamic = "force-dynamic";

export default async function NotePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  const result =
    await sql`SELECT * FROM notes WHERE note_key = ${key} LIMIT 1`;

  if (result.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-soft">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-ink">Note not found</h1>
          <p className="mb-4 text-ink-muted">
            The note &ldquo;{key}&rdquo; does not exist.
          </p>
          <Link
            href="/"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-active"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const note = result[0];

  // Check expiration
  if (note.expires_at && new Date(note.expires_at) < new Date()) {
    await sql`DELETE FROM notes WHERE id = ${note.id}`;
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-soft">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-ink">Note expired</h1>
          <p className="mb-4 text-ink-muted">
            This note has self-destructed.
          </p>
          <Link
            href="/"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-active"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const requiresPin = note.is_protected;

  return (
    <NoteEditor
      note={{
        note_key: note.note_key,
        content_html: note.content_html,
        content_json: note.content_json,
        is_protected: note.is_protected,
        ttl_mode: note.ttl_mode,
      }}
      requiresPin={requiresPin}
    />
  );
}
