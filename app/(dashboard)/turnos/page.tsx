import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import TurnosClient from "@/components/TurnosClient";

export default async function TurnosPage({
  searchParams,
}: {
  searchParams: Promise<{
    servicio?: string;
    q_confirmados?: string;
    q_denegados?: string;
  }>;
}) {
  const { servicio, q_confirmados, q_denegados } = await searchParams;
  const supabase = await createClient();

  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre")
    .order("nombre");

  const { data: vehiculos } = await supabase
    .from("vehiculos")
    .select("id, patente, marca, modelo, cliente_id")
    .order("patente");

  const { data: servicios } = await supabase
    .from("servicios")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  let turnosQuery = supabase
    .from("turnos")
    .select(
      `id, fecha, hora, descripcion, estado, estado_gestion, cliente_id, vehiculo_id, orden_creada,
      clientes ( nombre, telefono ),
      vehiculos ( id, patente, marca, modelo ),
      servicios ( id, nombre )`,
    )
    .order("fecha")
    .order("hora");

  if (servicio) turnosQuery = turnosQuery.eq("servicio_id", servicio);
  const { data: turnos } = await turnosQuery;

  const hoy = new Date().toISOString().split("T")[0];
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const mananaS = manana.toISOString().split("T")[0];

  const pendientes = (turnos || []).filter(
    (t) =>
      t.fecha >= hoy &&
      t.estado !== "Cancelado" &&
      t.estado_gestion === "pendiente",
  );
  const confirmados = (turnos || []).filter(
    (t) => t.estado_gestion === "confirmado",
  );
  const denegados = (turnos || []).filter(
    (t) => t.estado_gestion === "denegado",
  );

  const hoyCount = pendientes.filter((t) => t.fecha === hoy).length;
  const manCount = pendientes.filter((t) => t.fecha === mananaS).length;
  const compCount = confirmados.length;

  async function agregarTurno(formData: FormData) {
    "use server";
    const cliente_id = formData.get("cliente_id") as string;
    const vehiculo_id = formData.get("vehiculo_id") as string;
    const servicio_id = formData.get("servicio_id") as string;
    const fecha = formData.get("fecha") as string;
    const hora = formData.get("hora") as string;
    const descripcion = formData.get("descripcion") as string;
    const supabase = await createClient();
    await supabase.from("turnos").insert({
      cliente_id: cliente_id ? parseInt(cliente_id) : null,
      vehiculo_id: vehiculo_id ? parseInt(vehiculo_id) : null,
      servicio_id: servicio_id ? parseInt(servicio_id) : null,
      fecha,
      hora,
      descripcion: descripcion || null,
      estado: "Pendiente",
      estado_gestion: "pendiente",
    });
    revalidatePath("/turnos");
  }

  async function denegarTurno(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const supabase = await createClient();
    await supabase
      .from("turnos")
      .update({ estado: "Cancelado", estado_gestion: "denegado" })
      .eq("id", id);
    revalidatePath("/turnos");
  }

  async function eliminarTurno(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const supabase = await createClient();
    await supabase.from("turnos").delete().eq("id", id);
    revalidatePath("/turnos");
  }

  return (
    <TurnosClient
      clientes={clientes ?? []}
      vehiculos={vehiculos ?? []}
      servicios={servicios ?? []}
      pendientes={pendientes}
      confirmados={confirmados}
      denegados={denegados}
      hoyCount={hoyCount}
      manCount={manCount}
      compCount={compCount}
      servicioFiltro={servicio}
      qConfirmados={q_confirmados ?? ""}
      qDenegados={q_denegados ?? ""}
      agregarTurnoAction={agregarTurno}
      denegarTurnoAction={denegarTurno}
      eliminarTurnoAction={eliminarTurno}
    />
  );
}
