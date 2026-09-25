"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";

interface PinSetupModalProps {
  onClose: () => void;
  onConfirm: (pin: string) => void;
}

export function PinSetupModal({ onClose, onConfirm }: PinSetupModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!pin || pin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    onConfirm(pin);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ width: "100%", maxWidth: "320px" }}
        className="rounded-xl border border-hairline bg-surface p-6 shadow-elevation-2"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink">
            <Lock size={18} />
            <h3 className="font-semibold">Set PIN</h3>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-sm text-ink-muted">
          Choose a 4-digit PIN to protect this note.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            style={{ width: "100%" }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-active"
          >
            Protect Note
          </button>
        </form>
      </div>
    </div>
  );
}
