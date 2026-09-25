import { sql } from "@/db";
import { TiptapEditor } from "@/components/editor/TiptapEditor";

export const dynamic = "force-dynamic";

export default async function ShareViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const result = await sql`
    SELECT * FROM notes WHERE read_only_token = ${token} LIMIT 1
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
    <div className="min-h-screen bg-canvas-soft">
      <header className="border-b border-hairline bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-3">
          <span className="text-sm text-ink-faint">Read-only view</span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <TiptapEditor
          initialContent={note.content_html}
          editable={false}
        />
      </main>
    </div>
  );
}
