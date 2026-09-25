"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function OpenKeyForm() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      const res = await fetch(`/api/notes/${encodeURIComponent(trimmed)}`);
      if (res.status === 404) {
        setError("Note key not found. Please check your key or create a new note below.");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" aria-busy={loading}>
      <h2 className="text-lg font-semibold text-ink">Open Existing Note</h2>
      <input
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Enter your note key"
        style={{ width: "100%" }}
        className="rounded-md border border-hairline bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={loading}
        style={{ width: "100%" }}
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active disabled:opacity-50"
      >
        <Search size={14} />
        {loading ? "Opening..." : "Open"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
