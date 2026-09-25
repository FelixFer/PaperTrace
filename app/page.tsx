"use client";

import { TiptapEditor } from "@/components/editor/TiptapEditor";

export default function Playground() {
  return (
    <div className="min-h-screen bg-canvas-soft p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold text-ink tracking-tight">
          PaperTrace — Editor Playground
        </h1>
        <p className="mb-6 text-sm text-ink-faint">
          Phase 3 smoke test. Edit below — toolbar, counts, and formatting should all work.
        </p>
        <TiptapEditor
          initialContent="<h2>Welcome to PaperTrace</h2><p>Start typing to test the editor. The toolbar above lets you format text, and the status bar below tracks words and reading time.</p><blockquote><p>This is a blockquote — perfect for notes within notes.</p></blockquote><ul><li>Bullet list item one</li><li>Bullet list item two</li></ul>"
          onUpdate={(data) => {
            console.log("Editor update:", data);
          }}
        />
      </div>
    </div>
  );
}
