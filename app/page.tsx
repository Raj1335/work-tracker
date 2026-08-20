"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Download } from "lucide-react";
import LockGate from "@/components/LockGate";
import EntryFormModal from "@/components/EntryFormModal";
import DetailModal from "@/components/DetailModal";
import EntryCard from "@/components/EntryCard";
import { Entry } from "@/lib/types";

type View = "dashboard" | "entries";

export default function Home() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/entries");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const d = await res.json();
      setEntries(d.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  if (authed === null) return null;
  if (!authed) return <LockGate onUnlock={() => setAuthed(true)} />;

  const total = entries.length;
  const pending = entries.filter((e) => e.status === "pending").length;
  const delivered = entries.filter((e) => e.status === "done").length;
  const today = new Date().toDateString();
  const overdue = entries.filter(
    (e) => e.status !== "done" && e.deadline && new Date(e.deadline) < new Date(today)
  ).length;

  // Dashboard: hide "done" entries by default so backlog is what you see.
  const dashboardEntries = [...entries]
    .filter((e) => e.status !== "done")
    .sort((a, b) => {
      const aOverdue = a.deadline && new Date(a.deadline) < new Date(today);
      const bOverdue = b.deadline && new Date(b.deadline) < new Date(today);
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="w-full border-b" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between px-3 h-12">
          <span className="font-sans text-sm font-bold tracking-wide">WORK TRACKER</span>
          <a
            href="/api/export"
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded"
            style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
          >
            <Download size={14} /> Export
          </a>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-3 py-4 sm:px-4 sm:py-6 pb-32 flex-1">
        {view === "dashboard" && (
          <section>
            <h1 className="text-lg font-bold mb-4">Dashboard</h1>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="stat-card">
                <p className="text-[11px] text-text-muted">Total</p>
                <p className="text-2xl font-bold mt-1">{total}</p>
              </div>
              <div className="stat-card">
                <p className="text-[11px] text-text-muted">Pending</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "var(--amber)" }}>{pending}</p>
              </div>
              <div className="stat-card">
                <p className="text-[11px] text-text-muted">Delivered</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "var(--green)" }}>{delivered}</p>
              </div>
              <div className="stat-card">
                <p className="text-[11px] text-text-muted">Overdue</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "var(--red)" }}>{overdue}</p>
              </div>
            </div>
            <div className="space-y-3">
              {dashboardEntries.length === 0 && !loading && (
                <p className="text-center text-sm text-text-muted py-12">
                  {total === 0 ? "no entries yet — tap + to add one" : "nothing pending 🎉"}
                </p>
              )}
              {dashboardEntries.map((e) => (
                <EntryCard key={e.id} entry={e} onClick={() => setDetail(e)} />
              ))}
            </div>
          </section>
        )}

        {view === "entries" && (
          <section>
            <h1 className="text-lg font-bold mb-4">All Entries</h1>
            <div className="space-y-3">
              {entries.length === 0 && !loading && (
                <p className="text-center text-sm text-text-muted py-12">no entries yet</p>
              )}
              {entries.map((e) => (
                <EntryCard key={e.id} entry={e} onClick={() => setDetail(e)} />
              ))}
            </div>
          </section>
        )}
      </main>

      <button className="fab" aria-label="New entry" onClick={() => setShowForm(true)}>
        <Plus size={28} />
      </button>

      <nav className="w-full border-t fixed inset-x-0 bottom-0 z-20" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="max-w-5xl mx-auto flex">
          <button
            className="flex-1 px-2 py-2 text-[11px] sm:text-xs text-center"
            style={view === "dashboard" ? { color: "var(--text)", borderTop: "2px solid var(--accent)" } : { color: "var(--text-muted)" }}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>
          <button
            className="flex-1 px-2 py-2 text-[11px] sm:text-xs text-center"
            style={view === "entries" ? { color: "var(--text)", borderTop: "2px solid var(--accent)" } : { color: "var(--text-muted)" }}
            onClick={() => setView("entries")}
          >
            Entries
          </button>
        </div>
      </nav>

      {showForm && <EntryFormModal onClose={() => setShowForm(false)} onSaved={load} />}
      {detail && <DetailModal entry={detail} onClose={() => setDetail(null)} onChanged={load} />}
    </div>
  );
}
