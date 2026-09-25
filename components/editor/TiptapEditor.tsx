"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { Toolbar } from "./Toolbar";
import { StatusBar } from "./StatusBar";

interface TiptapEditorProps {
  initialContent?: string;
  editable?: boolean;
  stickyTop?: number;
  onUpdate?: (data: {
    html: string;
    json: object;
    md: string;
  }) => void;
  onClear?: () => void;
}

export function TiptapEditor({
  initialContent = "",
  editable = true,
  stickyTop = 56,
  onUpdate,
  onClear,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      CharacterCount,
      Markdown,
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdate?.({
        html: editor.getHTML(),
        json: editor.getJSON(),
        md: editor.getMarkdown(),
      });
    },
  });

  if (!editor) return null;

  const words = editor.storage.characterCount.words();
  const chars = editor.storage.characterCount.characters();
  const readingTime = Math.ceil(words / 200);

  return (
    <div className="flex flex-col gap-3">
      {editable && (
        <div
          style={{ top: `${stickyTop}px` }}
          className="sticky z-10 -mx-4 -mt-4 mb-2 border-b border-hairline bg-surface/95 px-4 py-2 backdrop-blur-sm"
        >
          <Toolbar editor={editor} onClear={onClear} />
        </div>
      )}
      <div
        style={{ minHeight: "300px" }}
        className="rounded-lg bg-surface p-4 shadow-elevation-1"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent
          editor={editor}
          className="prose max-w-none min-h-75 focus:outline-none"
        />
      </div>
      <StatusBar words={words} chars={chars} readingTime={readingTime} />
    </div>
  );
}
