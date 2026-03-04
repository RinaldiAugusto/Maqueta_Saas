import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, estado } = await req.json();
  const supabase = await createClient();
  await supabase.from("turnos").update({ estado }).eq("id", id);
  return NextResponse.json({ ok: true });
}
