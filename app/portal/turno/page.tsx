import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PortalTurnoForm from "@/components/PortalTurnoForm";

export default async function PortalTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nombre, vehiculos ( id, patente, marca, modelo )")
    .eq("auth_id", user.id)
    .single();

  if (!cliente) redirect("/portal/sin-cuenta");

  const { data: servicios } = await supabase
    .from("servicios")
    .select("id, nombre, descripcion, precio_base, duracion_min")
    .eq("activo", true)
    .order("nombre");

  const vehiculos = (cliente.vehiculos as any[]) || [];

  const hoy = new Date().toISOString().split("T")[0];
  const vehiculoIds = vehiculos.map((v: any) => v.id);
  const { data: turnosExistentes } =
    vehiculoIds.length > 0
      ? await supabase
          .from("turnos")
          .select("id, fecha, hora, estado, descripcion, servicios ( nombre )")
          .in("vehiculo_id", vehiculoIds)
          .gte("fecha", hoy)
          .neq("estado", "Cancelado")
          .order("fecha")
      : { data: [] };

  async function solicitarTurno(formData: FormData) {
    "use server";
    const vehiculo_id = formData.get("vehiculo_id") as string;
    const servicio_id = formData.get("servicio_id") as string;
    const fecha = formData.get("fecha") as string;
    const hora = formData.get("hora") as string;
    const descripcion = formData.get("descripcion") as string;

    if (!vehiculo_id || !servicio_id || !fecha || !hora)
      redirect("/portal/turno?error=Completá todos los campos obligatorios");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/portal/login");

    const { data: clienteData } = await supabase
      .from("clientes")
      .select("id")
      .eq("auth_id", user.id)
      .single();
    if (!clienteData) redirect("/portal/sin-cuenta");

    // Verificar disponibilidad
    const { data: turnosEnHora } = await supabase
      .from("turnos")
      .select("id")
      .eq("fecha", fecha)
      .eq("hora", hora)
      .neq("estado", "Cancelado")
      .neq("estado_gestion", "denegado");

    if ((turnosEnHora?.length ?? 0) >= 3)
      redirect(
        "/portal/turno?error=Ese horario ya no tiene disponibilidad. Elegí otro.",
      );

    const { error } = await supabase.from("turnos").insert({
      cliente_id: clienteData.id,
      vehiculo_id: parseInt(vehiculo_id),
      servicio_id: parseInt(servicio_id),
      fecha,
      hora,
      descripcion: descripcion || null,
      estado: "Pendiente",
      estado_gestion: "pendiente",
      origen: "portal", // ← turno solicitado desde el portal del cliente
    });

    if (error)
      redirect(`/portal/turno?error=${encodeURIComponent(error.message)}`);
    redirect("/portal/turno?ok=1");
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#1a1f2e",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <nav
        className="border-b px-6 py-4 flex items-center gap-4"
        style={{ background: "#202637", borderColor: "#2e3650" }}
      >
        <Link
          href="/portal"
          className="btn-animate btn-ghost text-xs font-semibold flex items-center gap-1.5"
          style={{ color: "#6b7899", textDecoration: "none" }}
        >
          ← Volver
        </Link>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #4f8ef7, #3b7de8)" }}
          >
            ▦
          </div>
          <span className="text-white font-extrabold text-sm">
            Portal del Cliente
          </span>
        </div>
      </nav>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1
            className="text-xl font-extrabold"
            style={{ color: "#ffffff", letterSpacing: "-0.3px" }}
          >
            Solicitar Turno
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7899" }}>
            Elegí el servicio, el vehículo y la fecha
          </p>
        </div>

        {ok && (
          <div
            className="mb-5 p-4 rounded-xl text-sm font-semibold"
            style={{
              background: "rgba(52,211,153,0.08)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            ✓ Turno solicitado correctamente. El taller lo confirmará a la
            brevedad.
          </div>
        )}
        {error && (
          <div
            className="mb-5 p-4 rounded-xl text-sm font-semibold"
            style={{
              background: "rgba(248,113,113,0.08)",
              color: "#f87171",
              border: "1px solid rgba(248,113,113,0.2)",
            }}
          >
            ✕ {error}
          </div>
        )}

        <PortalTurnoForm
          servicios={servicios ?? []}
          vehiculos={vehiculos}
          turnosExistentes={turnosExistentes ?? []}
          solicitarTurnoAction={solicitarTurno}
        />
      </div>
    </div>
  );
}
