import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { turno_id, vehiculo_id, descripcion } = await req.json();

  if (!vehiculo_id) {
    return NextResponse.json(
      { error: "vehiculo_id requerido" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orden, error } = await supabase
    .from("ordenes")
    .insert({
      vehiculo_id,
      descripcion: descripcion || "Turno agendado",
      costo: 0,
      estado: "Pendiente",
      user_id: "e76fd163-b136-4ffe-b25e-773b9175f2e1",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Marcar el turno como que ya tiene orden creada → desaparece de agenda próxima
  if (turno_id) {
    await supabase
      .from("turnos")
      .update({ orden_creada: true })
      .eq("id", turno_id);
  }

  return NextResponse.json({ orden_id: orden.id });
}
