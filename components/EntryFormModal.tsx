"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CATEGORIES } from "@/lib/types";

export default function EntryFormModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: CATEGORIES[0],
    reference_number: "",
    village: "",
    recipient_name: "",
    contact_number: "",
    description: "",
    deadline: "",
    status: "pending",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, deadline: form.deadline || null }),
      });
      if (res.ok) {
        onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  const fieldCls = "w-full px-2 py-1.5 text-xs rounded";
  const labelCls = "block text-xs mb-1 text-text-muted";

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-sm font-bold">New Entry</h2>
          <button onClick={onClose} className="text-text-muted">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={fieldCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select className={fieldCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Reference No.</label>
              <input className={fieldCls} placeholder="e.g. EM123456789IN" value={form.reference_number} onChange={(e) => set("reference_number", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Village</label>
              <input className={fieldCls} placeholder="Village name" value={form.village} onChange={(e) => set("village", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Recipient/Sender</label>
              <input className={fieldCls} placeholder="Recipient/Sender name" value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Contact No.</label>
              <input className={fieldCls} placeholder="Phone number" value={form.contact_number} onChange={(e) => set("contact_number", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <input className={fieldCls} placeholder="Short description" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Deadline</label>
              <input type="date" className={fieldCls} value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={fieldCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Delivered</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs rounded font-sans font-medium disabled:opacity-50"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {saving ? "saving…" : "Save Entry"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs rounded bg-surface-3 text-text-muted">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
