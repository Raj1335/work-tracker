import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { getSupabaseServer } from "@/lib/supabase";

const HEADERS = [
  "date",
  "category",
  "reference_number",
  "village",
  "recipient_name",
  "contact_number",
  "description",
  "deadline",
  "status",
  "created_at",
];

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const unauthorized = requireSession(req);
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data || []).map((r: any) => HEADERS.map((h) => csvEscape(r[h])).join(","));
  const csv = [HEADERS.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="work-tracker-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
