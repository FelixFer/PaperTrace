"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { ExportMenu } from "@/components/editor/ExportMenu";
import { ShareModal } from "@/components/modals/ShareModal";
import { PinSetupModal } from "@/components/modals/PinSetupModal";
import { TtlDropdown } from "@/components/modals/TtlDropdown";
import {
  Shield,
  Share2,
  Settings,
  ArrowLeft,
  Check,
  Lock,
  Flame,
} from "lucide-react";

interface NoteData {
  note_key: string;
  content_html: string;
  content_json: object;
  is_protected: boolean;
  ttl_mode: string;
}

interface NoteEditorProps {
  note: NoteData;
  requiresPin?: boolean;
}

export function NoteEditor({ note, requiresPin = false }: NoteEditorProps) {
  const router = useRouter();
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [noteData, setNoteData] = useState(note);
  const [unlocked, setUnlocked] = useState(!requiresPin);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const burnedRef = useRef(false);

  const editorRef = useRef<{
    getHtml: () => string;
    getJson: () => object;
    getMd: () => string;
    getText: () => string;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{
    content_html: string;
    content_json: string;
    content_md: string;
  } | null>(null);

  const flushSave = useCallback(async () => {
    const content = pendingRef.current;
    if (!content) return;
    pendingRef.current = null;
    setSaved("saving");
    try {
      await fetch(`/api/notes/${encodeURIComponent(noteData.note_key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      setSaved("saved");
      setTimeout(() => setSaved("idle"), 2000);
    } catch {
      setSaved("idle");
    }
  }, [noteData.note_key]);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushSave, 1500);
  }, [flushSave]);

  const handleClear = useCallback(() => {
    pendingRef.current = {
      content_html: "",
      content_json: JSON.stringify({ type: "doc", content: [] }),
      content_md: "",
    };
    editorRef.current = {
      getHtml: () => "",
      getJson: () => ({ type: "doc", content: [] }),
      getMd: () => "",
      getText: () => "",
    };
    setNoteData((prev) => ({
      ...prev,
      content_html: "",
      content_json: { type: "doc", content: [] },
    }));
    scheduleSave();
  }, [scheduleSave]);

  const handleEditorUpdate = useCallback(
    (data: { html: string; json: object; md: string }) => {
      pendingRef.current = {
        content_html: data.html,
        content_json: JSON.stringify(data.json),
        content_md: data.md,
      };
      editorRef.current = {
        getHtml: () => data.html,
        getJson: () => data.json,
        getMd: () => data.md,
        getText: () => data.html.replace(/<[^>]+>/g, ""),
      };
      setNoteData((prev) => ({
        ...prev,
        content_html: data.html,
        content_json: data.json,
      }));
      scheduleSave();
    },
    [scheduleSave],
  );

  async function handlePinVerify(e: React.FormEvent) {
    e.preventDefault();
    setPinError("");
    if (!pin || pin.length !== 4) {
      setPinError("PIN must be exactly 4 digits.");
      return;
    }
    setPinLoading(true);
    const res = await fetch(
      `/api/notes/${encodeURIComponent(noteData.note_key)}/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      },
    );
    if (res.ok) {
      const data = await res.json();
      setNoteData(data.note);
      setUnlocked(true);
    } else {
      setPinError("Invalid PIN. Please try again.");
    }
    setPinLoading(false);
  }

  async function handleSetPin(pin: string) {
    await fetch(`/api/notes/${encodeURIComponent(noteData.note_key)}/pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    setNoteData((prev) => ({ ...prev, is_protected: true }));
    setShowPinModal(false);
  }

  async function handleTtlUpdate(mode: string) {
    const res = await fetch(
      `/api/notes/${encodeURIComponent(noteData.note_key)}/settings`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ttl_mode: mode }),
      },
    );
    if (res.ok) {
      setNoteData((prev) => ({ ...prev, ttl_mode: mode }));
    }
  }

  // Burn-on-read: delete when the user leaves/closes the page.
  const burnNote = useCallback(() => {
    if (burnedRef.current || !noteData.note_key) return;
    burnedRef.current = true;
    const url = `/api/notes/${encodeURIComponent(noteData.note_key)}/burn`;
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, "");
        return;
      }
    } catch {
      // Fall through to fetch.
    }
    try {
      fetch(url, { method: "POST", keepalive: true });
    } catch {
      // Best-effort burn.
    }
  }, [noteData.note_key]);

  useEffect(() => {
    if (noteData.ttl_mode !== "burn_on_read") return;

    const onBeforeUnload = () => burnNote();
    const onPageHide = () => burnNote();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") burnNote();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [noteData.ttl_mode, burnNote]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas-soft">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-hairline bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => {
                if (noteData.ttl_mode === "burn_on_read") {
                  burnNote();
                }
                router.push("/");
              }}
              className="flex shrink-0 items-center gap-1 text-sm text-ink-muted hover:text-ink"
            >
              <ArrowLeft size={14} />
              Home
            </button>
            <span className="truncate text-sm font-medium text-ink">
              {noteData.note_key}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-ink-faint">
              {saved === "saved" && (
                <>
                  <Check size={12} className="text-accent-green" />
                  Saved
                </>
              )}
              {saved === "saving" && "Saving..."}
              {saved === "idle" && "Ready"}
            </span>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg p-2 text-ink-muted hover:bg-canvas-soft hover:text-ink"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Settings panel */}
      {showSettings && (
        <div className="border-b border-hairline bg-surface">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-4 px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-ink-muted" />
              <span className="text-sm text-ink-muted">PIN:</span>
              {noteData.is_protected ? (
                <span className="text-sm text-accent-green">Protected</span>
              ) : (
                <button
                  onClick={() => setShowPinModal(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Set PIN
                </button>
              )}
            </div>

            <div className="h-4 w-px bg-hairline" />

            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">Expires:</span>
              <TtlDropdown
                currentMode={noteData.ttl_mode}
                onUpdate={handleTtlUpdate}
              />
            </div>

            <div className="h-4 w-px bg-hairline" />

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>
      )}

      {/* Burn-on-read warning */}
      {unlocked && noteData.ttl_mode === "burn_on_read" && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 text-sm text-red-700">
            <Flame size={14} className="shrink-0" />
            <span className="break-words">
              Burn-on-read: this note will be destroyed when you close or leave
              this page.
            </span>
          </div>
        </div>
      )}

      {/* Editor */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {unlocked ? (
          <TiptapEditor
            initialContent={noteData.content_html}
            onUpdate={handleEditorUpdate}
            onClear={handleClear}
          />
        ) : (
          <div
            style={{ width: "100%", maxWidth: "320px" }}
            className="mx-auto rounded-xl border border-hairline bg-surface p-6 shadow-elevation-1"
          >
            <div className="mb-4 flex items-center gap-2 text-ink">
              <Lock size={18} />
              <h3 className="font-semibold">PIN Required</h3>
            </div>
            <form onSubmit={handlePinVerify} className="flex flex-col gap-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="4-digit PIN"
                autoFocus
                style={{ width: "100%" }}
                className="rounded-md border border-hairline bg-surface px-3 py-2 text-center text-lg tracking-[0.3em] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {pinError && <p className="text-sm text-red-600">{pinError}</p>}
              <button
                type="submit"
                disabled={pinLoading}
                style={{ width: "100%" }}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:opacity-50"
              >
                {pinLoading ? "Verifying..." : "Unlock"}
              </button>
            </form>
          </div>
        )}

        {unlocked && (
          <div className="mt-4 flex justify-end">
            <ExportMenu
              noteKey={noteData.note_key}
              getText={() => editorRef.current?.getText() || ""}
              getHtml={() => editorRef.current?.getHtml() || ""}
              getMarkdown={() => editorRef.current?.getMd() || ""}
            />
          </div>
        )}
      </main>

      {showShareModal && (
        <ShareModal
          noteKey={noteData.note_key}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showPinModal && (
        <PinSetupModal
          onClose={() => setShowPinModal(false)}
          onConfirm={handleSetPin}
        />
      )}
    </div>
  );
}
