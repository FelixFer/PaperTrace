# PaperTrace Technical Architecture & Implementation Guide

## 1. Stack Overview

| Layer                  | Component                  | Description                                                           |
| ---------------------- | -------------------------- | --------------------------------------------------------------------- |
| **Frontend Framework** | Next.js 16 App Router      | React 19 fullstack framework with serverless API routes               |
| **WYSIWYG Engine**     | Tiptap v3 (ProseMirror)    | Headless rich text editor engine                                      |
| **Styling & Design**   | Tailwind CSS v4            | CSS-first utility framework with `@theme` design tokens               |
| **Database**           | Neon PostgreSQL            | Serverless PostgreSQL database with `@neondatabase/serverless` driver |
| **Security**           | `bcryptjs`                 | PIN hashing algorithm                                                 |
| **Icons**              | Lucide React               | Clean, light vector icon library                                      |
| **QR Code Engine**     | `qrcode.react`             | Client-side Canvas/SVG QR code generator                              |
| **Cron / TTL Prune**   | Vercel Cron                | Daily `GET /api/cron/prune` removes expired notes                     |

---

## 2. Key Code Implementation Blueprints

### A. Tiptap Configuration with Metadata Extensions (`components/editor/TiptapEditor.tsx`)

```typescript
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";

export function TiptapEditor({ initialContent, onUpdate }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      CharacterCount,
      Markdown,
    ],
    content: initialContent,
    editable: true,
    immediatelyRender: false, // Required under Next.js SSR
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      const md = editor.getMarkdown(); // Official v3 API
      onUpdate({ html, json, md });
    },
  });

  if (!editor) return null;

  const words = editor.storage.characterCount.words();
  const chars = editor.storage.characterCount.characters();
  const readingTime = Math.ceil(words / 200);

  return (
    <div className="paper-card">
      <EditorContent editor={editor} className="prose max-w-none" />
      <div className="editor-footer">
        <span>{words} words</span> • <span>{chars} characters</span> • <span>{readingTime} min read</span>
      </div>
    </div>
  );
}
```

### B. Debouncing Auto-Save Pattern (`hooks/useAutoSave.ts`)

```typescript
import { useEffect, useRef } from "react";

export function useAutoSave(
  data: any,
  onSave: (data: any) => void,
  delay = 1500,
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      onSave(data);
    }, delay);

    return () => clearTimeout(handler);
  }, [data, delay, onSave]);
}
```

### C. Client-Side Export Utility (`utils/export.ts`)

```typescript
export function downloadNoteFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### D. Burn-on-Read Self-Destruct Flow

Burn-on-read no longer deletes the row on the initial `GET`. The note stays alive while the user is reading, and is destroyed when the session ends.

`app/api/notes/[key]/burn/route.ts`:

```typescript
import { sql } from "@/db";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  await sql`DELETE FROM notes WHERE note_key = ${key}`;
  return NextResponse.json({ ok: true });
}
```

`components/editor/NoteEditor.tsx` fires the burn via `navigator.sendBeacon` (with a `fetch(..., { keepalive: true })` fallback) on `beforeunload`, `pagehide`, and `visibilitychange`, and also explicitly before navigating Home.
