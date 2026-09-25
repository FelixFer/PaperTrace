"use client";

import { useState } from "react";
import { Download, FileText, FileCode, FileType } from "lucide-react";
import { downloadNoteFile } from "@/utils/export";

interface ExportMenuProps {
  noteKey: string;
  getText: () => string;
  getHtml: () => string;
  getMarkdown: () => string;
}

export function ExportMenu({
  noteKey,
  getText,
  getHtml,
  getMarkdown,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);

  function exportFile(format: "txt" | "md" | "html") {
    const safeKey = noteKey.replace(/[^a-zA-Z0-9-_]/g, "_");
    switch (format) {
      case "txt":
        downloadNoteFile(getText(), `${safeKey}.txt`, "text/plain");
        break;
      case "md":
        downloadNoteFile(getMarkdown(), `${safeKey}.md`, "text/markdown");
        break;
      case "html":
        downloadNoteFile(getHtml(), `${safeKey}.html`, "text/html");
        break;
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink transition-colors hover:bg-canvas-soft"
      >
        <Download size={14} />
        Export
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-48 max-w-[calc(100vw-2rem)] rounded-lg border border-hairline bg-surface py-1 shadow-elevation-2">
          <button
            onClick={() => exportFile("txt")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas-soft"
          >
            <FileText size={14} className="text-ink-muted" />
            Plain Text (.txt)
          </button>
          <button
            onClick={() => exportFile("md")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas-soft"
          >
            <FileCode size={14} className="text-ink-muted" />
            Markdown (.md)
          </button>
          <button
            onClick={() => exportFile("html")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas-soft"
          >
            <FileType size={14} className="text-ink-muted" />
            HTML (.html)
          </button>
        </div>
      )}
    </div>
  );
}
