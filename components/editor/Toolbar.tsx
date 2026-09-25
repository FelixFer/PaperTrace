"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  CodeSquare,
  Minus,
  Undo2,
  Redo2,
  Trash2,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor;
  onClear?: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
  shortcut?: string;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
  label,
  shortcut,
}: ToolbarButtonProps) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
          isActive
            ? "bg-primary text-on-primary"
            : "text-ink-muted hover:bg-canvas-soft hover:text-ink"
        } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 max-w-[200px] -translate-x-1/2 rounded-md bg-ink px-2.5 py-1 text-center text-xs font-medium text-on-primary opacity-0 shadow-elevation-1 transition-opacity duration-150 group-hover:opacity-100">
        {label}
        {shortcut && (
          <span className="ml-1.5 text-ink-faint">{shortcut}</span>
        )}
      </span>
    </div>
  );
}

function Separator() {
  return <div className="w-px h-5 bg-hairline mx-1" />;
}

export function Toolbar({ editor, onClear }: ToolbarProps) {
  const iconSize = 16;

  function handleClear() {
    if (!onClear) return;
    if (window.confirm("Clear all content? This cannot be undone.")) {
      editor.chain().focus().clearContent().run();
      onClear();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-hairline bg-surface px-3 py-2 shadow-elevation-0">
      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        label="Bold"
        shortcut="Ctrl+B"
      >
        <Bold size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        label="Italic"
        shortcut="Ctrl+I"
      >
        <Italic size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        label="Strikethrough"
        shortcut="Ctrl+Shift+X"
      >
        <Strikethrough size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        label="Inline Code"
        shortcut="Ctrl+E"
      >
        <Code size={iconSize} />
      </ToolbarButton>

      <Separator />

      {/* Headings */}
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        isActive={editor.isActive("heading", { level: 1 })}
        label="Heading 1"
        shortcut="Ctrl+Alt+1"
      >
        <Heading1 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        isActive={editor.isActive("heading", { level: 2 })}
        label="Heading 2"
        shortcut="Ctrl+Alt+2"
      >
        <Heading2 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        isActive={editor.isActive("heading", { level: 3 })}
        label="Heading 3"
        shortcut="Ctrl+Alt+3"
      >
        <Heading3 size={iconSize} />
      </ToolbarButton>

      <Separator />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        label="Bullet List"
        shortcut="Ctrl+Shift+8"
      >
        <List size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        label="Ordered List"
        shortcut="Ctrl+Shift+7"
      >
        <ListOrdered size={iconSize} />
      </ToolbarButton>

      <Separator />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        label="Blockquote"
        shortcut="Ctrl+Shift+B"
      >
        <Quote size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        label="Code Block"
        shortcut="Ctrl+Alt+C"
      >
        <CodeSquare size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        label="Horizontal Rule"
      >
        <Minus size={iconSize} />
      </ToolbarButton>

      <Separator />

      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        label="Undo"
        shortcut="Ctrl+Z"
      >
        <Undo2 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        label="Redo"
        shortcut="Ctrl+Shift+Z"
      >
        <Redo2 size={iconSize} />
      </ToolbarButton>

      {/* Clear */}
      <Separator />
      <ToolbarButton
        onClick={handleClear}
        label="Clear Document"
      >
        <Trash2 size={iconSize} className="text-red-500" />
      </ToolbarButton>
    </div>
  );
}
