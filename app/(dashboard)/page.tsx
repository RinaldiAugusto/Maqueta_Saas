import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import KanbanColapsable from "@/components/KanbanColapsable";
import DashboardFormConCalendario from "@/components/DashboardFormConCalendario";

type VehiculoRelacion = {
  patente: string;
  marca: string;
  modelo: string;
} | null;

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: vehiculos } = await supabase
    .from("vehiculos")
    .select("id, patente, marca, modelo");

  const { data: servicios } = await supabase
    .from("servicios")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  const { data: ordenesRaw } = await supabase
    .from("ordenes")
    .select(
      `id, descripcion, costo, estado, vehiculo_id, pagado, pagado_por_cliente, monto_cobrado, metodo_pago, created_at, vehiculos ( patente, marca, modelo )`,
    )
    .order("created_at", { ascending: false });

  const hoy = new Date().toISOString().split("T")[0];
  const { data: turnosData } = await supabase
    .from("turnos")
    .select("id")
    .gte("fecha", hoy)
    .neq("estado", "Cancelado");
  const turnosProximos = turnosData?.length ?? 0;

  const todasLasOrdenes =
    ordenesRaw?.map((o) => {
      const e = o.estado?.trim();
      let estadoLimpio = "Pendiente";
      if (e === "En Curso" || e === "En curso") estadoLimpio = "En Curso";
      if (e === "Finalizado" || e === "Terminado") estadoLimpio = "Finalizado";
      const v = o.vehiculos as unknown as VehiculoRelacion;
      return {
        ...o,
        estadoLimpio,
        vehiculoData: v,
        pagado_por_cliente: o.pagado_por_cliente ?? false,
      };
    }) || [];

  const pendientes = todasLasOrdenes.filter(
    (o) => o.estadoLimpio === "Pendiente",
  );
  const enCurso = todasLasOrdenes.filter((o) => o.estadoLimpio === "En Curso");
  const historial = todasLasOrdenes.filter(
    (o) => o.estadoLimpio === "Finalizado",
  );

  const ahora = new Date();
  const inicioMes = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    1,
  ).toISOString();
  const balanceMes = (ordenesRaw || [])
    .filter((o) => o.pagado === true && o.created_at >= inicioMes)
    .reduce((acc, o) => acc + (Number(o.monto_cobrado ?? o.costo) || 0), 0);
  const cuentasPorCobrar = (ordenesRaw || [])
    .filter((o) => o.pagado !== true)
    .reduce((acc, o) => acc + (Number(o.costo) || 0), 0);
  const nombreMes = ahora.toLocaleDateString("es-AR", { month: "long" });

  async function agregarOrden(formData: FormData) {
    "use server";
    const vehiculo_id = formData.get("vehiculo_id") as string;
    const servicio_id = formData.get("servicio_id") as string;
    const descripcion = formData.get("descripcion") as string;
    const costo = formData.get("costo") as string;
    const supabase = await createClient();

    let descFinal = descripcion || "";
    if (servicio_id) {
      const { data: servicio } = await supabase
        .from("servicios")
        .select("nombre")
        .eq("id", servicio_id)
        .single();
      if (servicio)
        descFinal = descripcion
          ? `${servicio.nombre} — ${descripcion}`
          : servicio.nombre;
    }

    await supabase.from("ordenes").insert({
      vehiculo_id: parseInt(vehiculo_id),
      descripcion: descFinal || "Sin descripción",
      costo: parseInt(costo) || 0,
      user_id: "e76fd163-b136-4ffe-b25e-773b9175f2e1",
      estado: "Pendiente",
    });
    revalidatePath("/");
  }

  async function moverEstado(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const estadoActual = formData.get("estado");
    const nuevoEstado =
      estadoActual === "Pendiente" ? "En Curso" : "Finalizado";
    const supabase = await createClient();
    await supabase.from("ordenes").update({ estado: nuevoEstado }).eq("id", id);
    revalidatePath("/");
  }

  async function eliminarOrden(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const supabase = await createClient();
    await supabase.from("ordenes").delete().eq("id", id);
    revalidatePath("/");
  }

  return (
    <div
      className="p-6 md:p-8"
      style={{
        background: "#1a1f2e",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* TOPBAR sin lupita */}
        <div
          className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-5 border-b"
          style={{ borderColor: "#2e3650" }}
        >
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: "#ffffff", letterSpacing: "-0.3px" }}
            >
              Gestión Operativa
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#6b7899" }}>
              Control total de reparaciones y facturación
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-lg text-xs font-semibold border"
            style={{
              background: "#252b3b",
              borderColor: "#374060",
              color: "#a8b4cc",
            }}
          >
            ▸ Panel activo
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div
            className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "rgba(52,211,153,0.08)", color: "#34d399" }}
            >
              $
            </div>
            <div>
              <p
                className="text-xs font-semibold uppercase"
                style={{
                  color: "#6b7899",
                  letterSpacing: "1px",
                  fontSize: "9.5px",
                }}
              >
                Cobrado en {nombreMes}
              </p>
              <p
                className="text-lg font-extrabold tracking-tight"
                style={{ color: "#34d399", letterSpacing: "-0.5px" }}
              >
                ${new Intl.NumberFormat("es-AR").format(balanceMes)}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24" }}
            >
              ◷
            </div>
            <div>
              <p
                className="text-xs font-semibold uppercase"
                style={{
                  color: "#6b7899",
                  letterSpacing: "1px",
                  fontSize: "9.5px",
                }}
              >
                Por Cobrar
              </p>
              <p
                className="text-lg font-extrabold tracking-tight"
                style={{ color: "#fbbf24", letterSpacing: "-0.5px" }}
              >
                ${new Intl.NumberFormat("es-AR").format(cuentasPorCobrar)}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 p-4 rounded-xl border"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: "rgba(96,165,250,0.08)", color: "#60a5fa" }}
            >
              ◈
            </div>
            <div>
              <p
                className="text-xs font-semibold uppercase"
                style={{
                  color: "#6b7899",
                  letterSpacing: "1px",
                  fontSize: "9.5px",
                }}
              >
                En Taller
              </p>
              <p
                className="text-lg font-extrabold tracking-tight"
                style={{ color: "#60a5fa", letterSpacing: "-0.5px" }}
              >
                {pendientes.length + enCurso.length}
              </p>
            </div>
          </div>
          <Link
            href="/turnos"
            className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:-translate-y-0.5"
            style={{
              background: "#252b3b",
              borderColor: "#2e3650",
              textDecoration: "none",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: "rgba(192,132,252,0.08)", color: "#c084fc" }}
            >
              ◷
            </div>
            <div>
              <p
                className="text-xs font-semibold uppercase"
                style={{
                  color: "#6b7899",
                  letterSpacing: "1px",
                  fontSize: "9.5px",
                }}
              >
                Turnos
              </p>
              <p
                className="text-lg font-extrabold tracking-tight"
                style={{ color: "#c084fc", letterSpacing: "-0.5px" }}
              >
                {turnosProximos} próximos
              </p>
            </div>
          </Link>
        </div>

        {/* FORM CON CALENDARIO OBLIGATORIO */}
        <DashboardFormConCalendario
          vehiculos={vehiculos ?? []}
          servicios={servicios ?? []}
          agregarOrdenAction={agregarOrden}
        />

        {/* KANBAN */}
        <KanbanColapsable
          pendientes={pendientes}
          enCurso={enCurso}
          historial={historial}
          moverEstadoAction={moverEstado}
          eliminarOrdenAction={eliminarOrden}
        />
      </div>
    </div>
  );
}
