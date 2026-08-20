import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { getSupabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const unauthorized = requireSession(req);
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireSession(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const record = {
    date: body.date || new Date().toISOString().slice(0, 10),
    category: body.category || "Other",
    reference_number: body.reference_number || "",
    village: body.village || "",
    recipient_name: body.recipient_name || "",
    contact_number: body.contact_number || "",
    description: body.description || "",
    deadline: body.deadline || null,
    status: body.status || "pending",
  };

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("entries").insert(record).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
