"use client";

import { Entry } from "@/lib/types";

function statusColor(status: string, deadline: string | null): string {
  if (status === "done") return "var(--green)";
  if (deadline && new Date(deadline) < new Date(new Date().toDateString())) return "var(--red)";
  if (status === "in-progress") return "var(--amber)";
  return "var(--text-muted)";
}

export default function EntryCard({ entry, onClick }: { entry: Entry; onClick: () => void }) {
  const color = statusColor(entry.status, entry.deadline);
  return (
    <div className="task-card rounded-lg p-3" onClick={onClick}>
      <div className="flex items-center gap-2 mb-1">
        <span className="status-dot" style={{ background: color }} />
        <span className="text-xs font-bold text-accent">{entry.reference_number || "—"}</span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
        >
          {entry.category}
        </span>
      </div>
      <p className="text-xs text-text-muted truncate">{entry.description || "no description"}</p>
      <div className="flex justify-between text-[10px] text-text-muted mt-1">
        <span>{entry.village || "—"}</span>
        <span>{entry.deadline ? `due ${entry.deadline}` : ""}</span>
      </div>
    </div>
  );
}
