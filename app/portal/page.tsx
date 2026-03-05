import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PortalOrdenesActivas from "@/components/PortalOrdenesActivas";
import PortalHistoricoTurnos from "@/components/PortalHistoricoTurnos";

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }>;
}) {
  const { pago } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: cliente } = await supabase
    .from("clientes")
    .select(
      "*, vehiculos ( id, patente, marca, modelo, año, ordenes ( id, descripcion, costo, estado, created_at, pagado, pagado_por_cliente, monto_cobrado_cliente, metodo_pago_cliente, monto_cobrado ) )",
    )
    .eq("auth_id", user.id)
    .single();

  if (!cliente) redirect("/portal/sin-cuenta");

  const vehiculos = (cliente.vehiculos as any[]) || [];
  const vehiculoIds = vehiculos.map((v: any) => v.id);

  // Traemos TODOS los turnos del cliente (sin filtro de fecha) para el histórico
  const { data: todosLosTurnos } =
    vehiculoIds.length > 0
      ? await supabase
          .from("turnos")
          .select(
            "id, fecha, hora, estado, estado_gestion, descripcion, servicios ( nombre ), vehiculos ( patente, marca, modelo )",
          )
          .in("vehiculo_id", vehiculoIds)
          .order("fecha", { ascending: false })
      : { data: [] };

  const normEstado = (e: string) =>
    e === "Terminado" ? "Finalizado" : e === "En curso" ? "En Curso" : e;

  const ordenesActivas = vehiculos.flatMap((v: any) =>
    (v.ordenes || [])
      .filter((o: any) => normEstado(o.estado) !== "Finalizado")
      .map((o: any) => ({ ...o, vehiculo: v })),
  );

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/portal/login");
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
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ background: "#202637", borderColor: "#2e3650" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #4f8ef7, #3b7de8)" }}
          >
            ▦
          </div>
          <div>
            <div className="text-white font-extrabold text-sm">
              MotorAdmin Pro
            </div>
            <div
              className="text-xs"
              style={{
                color: "#6b7899",
                fontSize: "9px",
                letterSpacing: "1px",
              }}
            >
              PORTAL DEL CLIENTE
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-semibold hidden sm:block"
            style={{ color: "#a8b4cc" }}
          >
            Hola, {cliente.nombre}
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "rgba(79,142,247,0.12)", color: "#4f8ef7" }}
          >
            {cliente.nombre?.charAt(0).toUpperCase()}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="btn-animate btn-ghost text-xs font-semibold px-3 py-1.5 rounded-lg border"
              style={{
                color: "#6b7899",
                borderColor: "#374060",
                background: "transparent",
                fontFamily: "inherit",
              }}
            >
              Salir
            </button>
          </form>
        </div>
      </nav>

      <div className="p-6 max-w-6xl mx-auto">
        {pago === "ok" && (
          <div
            className="mb-5 p-4 rounded-xl text-sm font-semibold"
            style={{
              background: "rgba(52,211,153,0.08)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            ✓ Pago confirmado correctamente. El taller fue notificado.
          </div>
        )}

        <div className="mb-6">
          <h1
            className="text-xl font-extrabold"
            style={{ color: "#ffffff", letterSpacing: "-0.3px" }}
          >
            Bienvenido, {cliente.nombre.split(" ")[0]}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7899" }}>
            Seguí el estado de tu vehículo y gestioná tus turnos
          </p>
        </div>

        {/* FILA PRINCIPAL: En el taller ahora + Histórico de turnos lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* En el taller ahora */}
          <div>
            {ordenesActivas.length > 0 ? (
              <PortalOrdenesActivas ordenes={ordenesActivas} />
            ) : (
              <div
                className="rounded-xl border p-6 text-center h-full flex flex-col items-center justify-center gap-2"
                style={{ background: "#252b3b", borderColor: "#2e3650" }}
              >
                <p
                  className="text-xs font-bold uppercase"
                  style={{ color: "#6b7899", letterSpacing: "1.5px" }}
                >
                  🔧 En el taller ahora
                </p>
                <p className="text-sm" style={{ color: "#4a5068" }}>
                  No tenés vehículos en el taller actualmente.
                </p>
              </div>
            )}
          </div>

          {/* Histórico de turnos con filtro de fecha */}
          <PortalHistoricoTurnos turnos={(todosLosTurnos as any[]) ?? []} />
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link
            href="/portal/turno"
            className="flex items-center gap-4 p-5 rounded-xl border transition-all hover:-translate-y-0.5 btn-animate btn-ghost"
            style={{
              background: "#252b3b",
              borderColor: "#2e3650",
              textDecoration: "none",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: "rgba(79,142,247,0.08)",
                color: "#4f8ef7",
                border: "1px solid rgba(79,142,247,0.2)",
              }}
            >
              ◷
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#dde3f0" }}>
                Solicitar Turno
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6b7899" }}>
                Elegí el servicio y la fecha
              </p>
            </div>
            <span className="ml-auto text-lg" style={{ color: "#4f8ef7" }}>
              →
            </span>
          </Link>
          <Link
            href="/portal/historial"
            className="flex items-center gap-4 p-5 rounded-xl border transition-all hover:-translate-y-0.5 btn-animate btn-ghost"
            style={{
              background: "#252b3b",
              borderColor: "#2e3650",
              textDecoration: "none",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: "rgba(52,211,153,0.08)",
                color: "#34d399",
                border: "1px solid rgba(52,211,153,0.2)",
              }}
            >
              ◈
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#dde3f0" }}>
                Historial de Órdenes
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6b7899" }}>
                Ver trabajos anteriores
              </p>
            </div>
            <span className="ml-auto text-lg" style={{ color: "#34d399" }}>
              →
            </span>
          </Link>
        </div>

        {/* MIS VEHÍCULOS */}
        <div>
          <p
            className="text-xs font-bold uppercase mb-3"
            style={{ color: "#6b7899", letterSpacing: "1.5px" }}
          >
            Mis Vehículos
          </p>
          {vehiculos.length > 0 ? (
            <div className="flex flex-col gap-3">
              {vehiculos.map((v: any) => {
                const activas = (v.ordenes || []).filter(
                  (o: any) => normEstado(o.estado) !== "Finalizado",
                ).length;
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-4 rounded-xl border"
                    style={{ background: "#252b3b", borderColor: "#2e3650" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(79,142,247,0.08)",
                          color: "#4f8ef7",
                          border: "1px solid rgba(79,142,247,0.15)",
                        }}
                      >
                        ◈
                      </div>
                      <div>
                        <p
                          className="font-bold text-sm"
                          style={{ color: "#dde3f0" }}
                        >
                          {v.marca} {v.modelo} {v.año ? `(${v.año})` : ""}
                        </p>
                        <span
                          className="font-mono text-xs font-bold"
                          style={{ color: "#a8b4cc", letterSpacing: "1.5px" }}
                        >
                          {v.patente}
                        </span>
                      </div>
                    </div>
                    {activas > 0 && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(251,191,36,0.08)",
                          color: "#fbbf24",
                          border: "1px solid rgba(251,191,36,0.2)",
                        }}
                      >
                        {activas} en taller
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-xl border p-6 text-center"
              style={{ background: "#252b3b", borderColor: "#2e3650" }}
            >
              <p className="text-sm" style={{ color: "#6b7899" }}>
                No tenés vehículos registrados todavía.
              </p>
              <p className="text-xs mt-1" style={{ color: "#4a5068" }}>
                Acercate al taller para registrar tu vehículo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
