# PaperTrace Technical Architecture & Implementation Guide

## 1. Stack Overview

| Layer                  | Component             | Description                                                           |
| ---------------------- | --------------------- | --------------------------------------------------------------------- |
| **Frontend Framework** | Next.js 14 App Router | React-based fullstack framework with Edge API routes                  |
| **WYSIWYG Engine**     | Tiptap (ProseMirror)  | Headless rich text editor engine                                      |
| **Styling & Design**   | Tailwind CSS          | Utility-first framework configured with Notion Notebook tokens        |
| **Database**           | Neon PostgreSQL       | Serverless PostgreSQL database with `@neondatabase/serverless` driver |
| **Security**           | `bcryptjs`            | PIN hashing algorithm                                                 |
| **Icons**              | Lucide React          | Clean, light vector icon library                                      |
| **QR Code Engine**     | `qrcode.react`        | Client-side Canvas/SVG QR code generator                              |

---

## 2. Key Code Implementation Blueprints

### A. Tiptap Configuration with Metadata Extensions (`components/editor/TiptapEditor.tsx`)

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import Markdown from 'tiptap-markdown';

export function TiptapEditor({ initialContent, onUpdate }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount,
      Markdown,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      const md = editor.storage.markdown.getMarkdown();
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

### D. Burn-on-Read API Fetch Flow (`app/api/notes/[key]/route.ts`)

```typescript
import { sql } from "@/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { key: string } },
) {
  const { key } = params;

  // 1. Fetch note record
  const result = await sql`SELECT * FROM notes WHERE note_key = ${key} LIMIT 1`;
  if (result.length === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const note = result[0];

  // 2. Handle Expiration Check
  if (note.expires_at && new Date(note.expires_at) < new Date()) {
    await sql`DELETE FROM notes WHERE id = ${note.id}`;
    return NextResponse.json({ error: "Note has expired" }, { status: 410 });
  }

  // 3. Handle Burn-on-Read Self-Destruct
  if (note.ttl_mode === "burn_on_read") {
    await sql`DELETE FROM notes WHERE id = ${note.id}`;
  }

  return NextResponse.json({ note });
}
```
