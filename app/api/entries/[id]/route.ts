import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import { getSupabaseServer } from "@/lib/supabase";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireSession(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // Never let the client overwrite id/created_at.
  const { id, created_at, ...updates } = body;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("entries")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireSession(req);
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseServer();
  const { error } = await supabase.from("entries").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
