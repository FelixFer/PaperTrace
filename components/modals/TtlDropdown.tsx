"use client";

import { useState } from "react";
import { Clock, ChevronDown, Trash2 } from "lucide-react";

const TTL_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "1d", label: "1 Day" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "burn_on_read", label: "Burn on Read" },
];

interface TtlDropdownProps {
  currentMode: string;
  onUpdate: (mode: string) => Promise<void>;
}

export function TtlDropdown({ currentMode, onUpdate }: TtlDropdownProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSelect(mode: string) {
    setLoading(true);
    await onUpdate(mode);
    setLoading(false);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink transition-colors hover:bg-canvas-soft disabled:opacity-50"
      >
        <Clock size={14} className="text-ink-muted" />
        <span>
          {TTL_OPTIONS.find((o) => o.value === currentMode)?.label || currentMode}
        </span>
        <ChevronDown size={14} className="text-ink-faint" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-56 max-w-[calc(100vw-2rem)] rounded-lg border border-hairline bg-surface py-1 shadow-elevation-2">
          {TTL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-canvas-soft ${
                currentMode === opt.value
                  ? "font-medium text-primary"
                  : "text-ink"
              } ${opt.value === "burn_on_read" ? "text-red-600" : ""}`}
            >
              {opt.value === "burn_on_read" && <Trash2 size={14} />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
