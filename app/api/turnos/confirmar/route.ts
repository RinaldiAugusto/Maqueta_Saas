import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const ADMIN_USER_ID = "e76fd163-b136-4ffe-b25e-773b9175f2e1";

export async function POST(req: Request) {
  const { turno_id } = await req.json();
  if (!turno_id)
    return NextResponse.json({ error: "turno_id requerido" }, { status: 400 });

  const supabase = await createClient();

  // Obtener datos del turno
  const { data: turno, error: turnoError } = await supabase
    .from("turnos")
    .select("*, servicios ( nombre ), vehiculos ( id )")
    .eq("id", turno_id)
    .single();

  if (turnoError || !turno)
    return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });

  const vehiculoId = (turno.vehiculos as any)?.id ?? turno.vehiculo_id;
  if (!vehiculoId)
    return NextResponse.json(
      { error: "Turno sin vehículo asignado" },
      { status: 400 },
    );

  const servicioNombre = (turno.servicios as any)?.nombre ?? "";
  const descripcion = [servicioNombre, turno.descripcion]
    .filter(Boolean)
    .join(" — ");

  // Crear orden en pendientes
  const { data: orden, error: ordenError } = await supabase
    .from("ordenes")
    .insert({
      vehiculo_id: vehiculoId,
      descripcion: descripcion || "Turno agendado",
      costo: 0,
      estado: "Pendiente",
      user_id: ADMIN_USER_ID,
    })
    .select("id")
    .single();

  if (ordenError)
    return NextResponse.json({ error: ordenError.message }, { status: 500 });

  // Marcar turno como confirmado y con orden creada
  await supabase
    .from("turnos")
    .update({
      estado: "Confirmado",
      estado_gestion: "confirmado",
      orden_creada: true,
    })
    .eq("id", turno_id);

  return NextResponse.json({ ok: true, orden_id: orden.id });
}
