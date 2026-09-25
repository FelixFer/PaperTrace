"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link, Copy, Check, X } from "lucide-react";

interface ShareModalProps {
  noteKey: string;
  onClose: () => void;
}

export function ShareModal({ noteKey, onClose }: ShareModalProps) {
  const [urls, setUrls] = useState<{
    readOnlyUrl: string;
    editUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<"read" | "edit" | null>(null);

  async function generateTokens() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/notes/${encodeURIComponent(noteKey)}/share`,
        { method: "POST" },
      );
      if (res.ok) {
        setUrls(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, type: "read" | "edit") {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!urls) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div style={{ width: "100%", maxWidth: "420px" }} className="rounded-xl border border-hairline bg-surface p-6 shadow-elevation-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink">
              <Link size={18} />
              <h3 className="font-semibold">Share Note</h3>
            </div>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center text-ink-faint hover:text-ink">
              <X size={18} />
            </button>
          </div>
          <p className="mb-4 text-sm text-ink-muted">
            Generate shareable links for this note. You can create read-only or
            editable links.
          </p>
          <button
            onClick={generateTokens}
            disabled={loading}
            style={{ width: "100%" }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Share Links"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: "420px" }} className="rounded-xl border border-hairline bg-surface p-6 shadow-elevation-2">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink">
            <Link size={18} />
            <h3 className="font-semibold">Share Note</h3>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Read-Only Link */}
          <div className="rounded-lg border border-hairline p-3">
            <p className="mb-2 text-xs font-medium text-ink-muted uppercase tracking-wide">
              Read-Only
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                readOnly
                value={urls.readOnlyUrl}
                style={{ width: "100%", minWidth: 0 }}
                className="truncate rounded border border-hairline bg-canvas-soft px-2 py-1 text-xs text-ink"
              />
              <button
                onClick={() => copyToClipboard(urls.readOnlyUrl, "read")}
                className="shrink-0 rounded p-1.5 text-ink-muted hover:bg-canvas-soft hover:text-ink"
              >
                {copied === "read" ? (
                  <Check size={14} className="text-accent-green" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <div className="mt-3 flex justify-center">
              <QRCodeSVG value={urls.readOnlyUrl} size={100} />
            </div>
          </div>

          {/* Editable Link */}
          <div className="rounded-lg border border-hairline p-3">
            <p className="mb-2 text-xs font-medium text-ink-muted uppercase tracking-wide">
              Editable
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                readOnly
                value={urls.editUrl}
                style={{ width: "100%", minWidth: 0 }}
                className="truncate rounded border border-hairline bg-canvas-soft px-2 py-1 text-xs text-ink"
              />
              <button
                onClick={() => copyToClipboard(urls.editUrl, "edit")}
                className="shrink-0 rounded p-1.5 text-ink-muted hover:bg-canvas-soft hover:text-ink"
              >
                {copied === "edit" ? (
                  <Check size={14} className="text-accent-green" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <div className="mt-3 flex justify-center">
              <QRCodeSVG value={urls.editUrl} size={100} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
