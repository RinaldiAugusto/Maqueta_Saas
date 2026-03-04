import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const HORAS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];
const MAX_POR_HORA = 3;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get("fecha");
  if (!fecha)
    return NextResponse.json({ error: "fecha requerida" }, { status: 400 });

  const supabase = await createClient();

  const { data: turnos } = await supabase
    .from("turnos")
    .select("hora")
    .eq("fecha", fecha)
    .neq("estado", "Cancelado")
    .neq("estado_gestion", "denegado");

  // Contar cuántos turnos hay por hora
  const conteo: Record<string, number> = {};
  for (const t of turnos ?? []) {
    const h = t.hora?.slice(0, 5);
    if (h) conteo[h] = (conteo[h] ?? 0) + 1;
  }

  const disponibilidad = HORAS.map((hora) => ({
    hora,
    ocupados: conteo[hora] ?? 0,
    disponibles: MAX_POR_HORA - (conteo[hora] ?? 0),
    lleno: (conteo[hora] ?? 0) >= MAX_POR_HORA,
  }));

  return NextResponse.json({ disponibilidad });
}
