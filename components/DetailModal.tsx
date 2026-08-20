"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Entry } from "@/lib/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-text-muted">{label}</span>
      <span className="text-right">{value || "—"}</span>
    </div>
  );
}

export default function DetailModal({
  entry,
  onClose,
  onChanged,
}: {
  entry: Entry;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [status, setStatus] = useState(entry.status);
  const [busy, setBusy] = useState(false);

  async function updateStatus() {
    setBusy(true);
    try {
      const res = await fetch(`/api/entries/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        onChanged();
        onClose();
      }
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!confirm("Delete this entry? This can't be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
      if (res.ok) {
        onChanged();
        onClose();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-accent">{entry.reference_number || "No reference"}</h2>
          <button onClick={onClose} className="text-text-muted">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3 text-xs">
          <Row label="Type" value={entry.category} />
          <Row label="Village" value={entry.village} />
          <Row label="Recipient" value={entry.recipient_name} />
          <Row label="Contact" value={entry.contact_number} />
          <Row label="Description" value={entry.description} />
          <Row label="Date" value={entry.date} />
          <Row label="Deadline" value={entry.deadline || ""} />
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Entry["status"])}
              className="px-2 py-1 text-xs rounded"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Delivered</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={updateStatus}
            disabled={busy}
            className="px-4 py-2 text-xs rounded font-medium disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Update Status
          </button>
          <button
            onClick={del}
            disabled={busy}
            className="px-4 py-2 text-xs rounded disabled:opacity-50"
            style={{ background: "var(--red)", color: "#fff" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
