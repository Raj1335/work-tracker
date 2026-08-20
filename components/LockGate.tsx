"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export default function LockGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onUnlock();
      } else if (res.status === 429) {
        setError("Too many attempts. Wait a few minutes.");
      } else {
        setError("Wrong password.");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={18} className="text-accent" />
          <h1 className="font-sans text-sm font-bold tracking-wide">WORK TRACKER</h1>
        </div>
        <p className="text-xs text-text-muted mb-6">Enter your password to continue.</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password…"
          className="w-full px-3 py-2.5 text-sm rounded mb-3"
        />
        {error && <p className="text-xs text-red mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-2.5 text-xs rounded font-sans font-medium disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {loading ? "checking…" : "→ enter"}
        </button>
      </form>
    </div>
  );
}
