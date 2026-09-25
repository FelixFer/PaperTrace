import { sql } from "@/db";
import { NoteEditor } from "@/components/editor/NoteEditor";

export const dynamic = "force-dynamic";

export default async function ShareEditPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const result = await sql`
    SELECT * FROM notes WHERE edit_token = ${token} LIMIT 1
  `;

  if (result.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-soft">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-ink">Link not found</h1>
          <p className="text-ink-muted">
            This share link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  const note = result[0];

  return (
    <NoteEditor
      note={{
        note_key: note.note_key,
        content_html: note.content_html,
        content_json: note.content_json,
        is_protected: false,
        ttl_mode: note.ttl_mode,
      }}
    />
  );
}
