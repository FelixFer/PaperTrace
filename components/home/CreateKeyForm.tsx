"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";

function generateKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "nk-";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function CreateKeyForm() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleGenerate() {
    setKey(generateKey());
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = key.trim();
    if (!trimmed) {
      setError("Please enter a note key.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: trimmed }),
      });
      if (res.status === 409) {
        // Key already exists — open it instead of blocking the user.
        router.push(`/note/${encodeURIComponent(trimmed)}`);
        return;
      }
      if (res.ok) {
        router.push(`/note/${encodeURIComponent(trimmed)}`);
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-ink">Create New Note</h2>
      <input
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Choose a key (e.g. my-notes)"
        style={{ width: "100%" }}
        className="rounded-md border border-hairline bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={handleGenerate}
          title="Generate random key"
          style={{ width: "100%" }}
          className="flex items-center justify-center gap-1 rounded-full border border-hairline bg-surface px-4 py-2.5 text-sm text-ink transition-colors hover:bg-canvas-soft"
        >
          <RefreshCw size={14} />
          Random
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%" }}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:opacity-50"
        >
          <Plus size={14} />
          Create
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
