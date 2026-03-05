import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PortalOrdenesActivas from "@/components/PortalOrdenesActivas";
import PortalHistoricoTurnos from "@/components/PortalHistoricoTurnos";
import PortalNotificaciones from "@/components/PortalNotificaciones";
import PortalOnboarding from "@/components/PortalOnboarding";
import PortalKilometraje from "@/components/PortalKilometraje";
import PortalResenas from "@/components/PortalResenas";

// Estados de la tabla ordenes que significan "el auto está en el taller ahora"
const ESTADOS_ACTIVOS = new Set(["Pendiente", "En Proceso", "Completado"]);

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }> | undefined;
}) {
  const params = (await searchParams) ?? {};
  const pago = params.pago;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: cliente } = await supabase
    .from("clientes")
    .select(
      "*, vehiculos ( id, patente, marca, modelo, año, km_actual, km_proximo_service, intervalo_km, ordenes ( id, descripcion, costo, estado, created_at, pagado, pagado_por_cliente, monto_cobrado_cliente, metodo_pago_cliente, monto_cobrado ) )",
    )
    .eq("auth_id", user.id)
    .single();

  if (!cliente) redirect("/portal/sin-cuenta");

  const vehiculos = (cliente.vehiculos as any[]) || [];
  const vehiculoIds = vehiculos.map((v: any) => v.id);
  const todasOrdenes = vehiculos.flatMap((v: any) => v.ordenes || []);

  const { data: todosLosTurnos } =
    vehiculoIds.length > 0
      ? await supabase
          .from("turnos")
          .select(
            "id, fecha, hora, estado, estado_gestion, descripcion, vehiculo_id, servicios ( nombre ), vehiculos ( patente, marca, modelo )",
          )
          .in("vehiculo_id", vehiculoIds)
          .order("fecha", { ascending: false })
      : { data: [] };

  const turnos = (todosLosTurnos as any[]) ?? [];

  const { data: notificaciones } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("cliente_id", cliente.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: resenas } = await supabase
    .from("resenas")
    .select("*, ordenes ( descripcion )")
    .eq("cliente_id", cliente.id)
    .order("created_at", { ascending: false });

  const resenaIds = new Set((resenas || []).map((r: any) => r.orden_id));
  const ordenesSinResena = todasOrdenes.filter(
    (o: any) =>
      (o.estado === "Finalizado" || o.estado === "Terminado") &&
      !resenaIds.has(o.id),
  );

  const pagosRealizados = todasOrdenes.filter(
    (o: any) => o.pagado || o.pagado_por_cliente,
  );
  const totalGastado = pagosRealizados.reduce(
    (acc: number, o: any) =>
      acc + (o.monto_cobrado_cliente ?? o.monto_cobrado ?? o.costo ?? 0),
    0,
  );
  const promedioPorVisita =
    pagosRealizados.length > 0 ? totalGastado / pagosRealizados.length : 0;
  const ultimoPago = [...pagosRealizados].sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];

  // Órdenes activas: solo las que están en estado activo Y no cobradas
  const ordenesActivas = vehiculos.flatMap((v: any) =>
    (v.ordenes || [])
      .filter((o: any) => {
        if (o.pagado || o.pagado_por_cliente) return false;
        return ESTADOS_ACTIVOS.has((o.estado ?? "").trim());
      })
      .map((o: any) => ({ ...o, vehiculo: v })),
  );

  const noLeidas = (notificaciones || []).filter((n: any) => !n.leida).length;
  const mostrarOnboarding = cliente.onboarding_visto === false;

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/portal/login");
  }

  async function marcarOnboardingVisto() {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("clientes")
      .update({ onboarding_visto: true })
      .eq("auth_id", user.id);
    redirect("/portal");
  }

  async function cancelarTurno(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const supabase = await createClient();
    await supabase
      .from("turnos")
      .update({ estado: "Cancelado", estado_gestion: "denegado" })
      .eq("id", id);
    redirect("/portal");
  }

  async function guardarKm(formData: FormData) {
    "use server";
    const vehiculoId = formData.get("vehiculo_id") as string;
    const kmActual = parseInt(formData.get("km_actual") as string);
    const intervaloKm =
      parseInt(formData.get("intervalo_km") as string) || 10000;
    if (!vehiculoId || isNaN(kmActual)) return;
    const supabase = await createClient();
    await supabase
      .from("vehiculos")
      .update({
        km_actual: kmActual,
        km_proximo_service: kmActual + intervaloKm,
        intervalo_km: intervaloKm,
      })
      .eq("id", vehiculoId);
    redirect("/portal");
  }

  async function enviarResena(formData: FormData) {
    "use server";
    const ordenId = parseInt(formData.get("orden_id") as string);
    const estrellas = parseInt(formData.get("estrellas") as string);
    const comentario = formData.get("comentario") as string;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: c } = await supabase
      .from("clientes")
      .select("id")
      .eq("auth_id", user.id)
      .single();
    if (!c) return;
    await supabase
      .from("resenas")
      .insert({ orden_id: ordenId, cliente_id: c.id, estrellas, comentario });
    redirect("/portal");
  }

  async function marcarNotificacionLeida(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const supabase = await createClient();
    await supabase.from("notificaciones").update({ leida: true }).eq("id", id);
    redirect("/portal");
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#1a1f2e",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {mostrarOnboarding && (
        <PortalOnboarding
          nombre={cliente.nombre}
          marcarVistoAction={marcarOnboardingVisto}
        />
      )}

      <nav
        className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40"
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
              Auto Services
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
          <PortalNotificaciones
            notificaciones={notificaciones ?? []}
            noLeidas={noLeidas}
            marcarLeidaAction={marcarNotificacionLeida}
          />
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total gastado",
              value: `$${new Intl.NumberFormat("es-AR").format(totalGastado)}`,
              color: "#34d399",
              icon: "💰",
            },
            {
              label: "Visitas pagadas",
              value: pagosRealizados.length,
              color: "#4f8ef7",
              icon: "🔧",
            },
            {
              label: "Promedio visita",
              value: `$${new Intl.NumberFormat("es-AR").format(Math.round(promedioPorVisita))}`,
              color: "#c084fc",
              icon: "📊",
            },
            {
              label: "Último pago",
              value: ultimoPago
                ? `$${new Intl.NumberFormat("es-AR").format(ultimoPago.monto_cobrado_cliente ?? ultimoPago.monto_cobrado ?? ultimoPago.costo)}`
                : "—",
              color: "#fbbf24",
              icon: "🧾",
            },
          ].map(({ label, value, color, icon }) => (
            <div
              key={label}
              className="rounded-xl border p-4"
              style={{ background: "#252b3b", borderColor: "#2e3650" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span>{icon}</span>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#6b7899" }}
                >
                  {label}
                </p>
              </div>
              <p className="text-lg font-extrabold" style={{ color }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
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
          <PortalHistoricoTurnos
            turnos={turnos}
            cancelarTurnoAction={cancelarTurno}
          />
        </div>

        {vehiculos.length > 0 && (
          <PortalKilometraje
            vehiculos={vehiculos}
            guardarKmAction={guardarKm}
          />
        )}

        <PortalResenas
          resenas={resenas ?? []}
          ordenesSinResena={ordenesSinResena}
          enviarResenaAction={enviarResena}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link
            href="/portal/turno"
            className="flex items-center gap-4 p-5 rounded-xl border transition-all hover:-translate-y-0.5"
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
            className="flex items-center gap-4 p-5 rounded-xl border transition-all hover:-translate-y-0.5"
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
                const tieneOrdenActiva = (v.ordenes || []).some(
                  (o: any) =>
                    !o.pagado &&
                    !o.pagado_por_cliente &&
                    ESTADOS_ACTIVOS.has((o.estado ?? "").trim()),
                );
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
                        {v.km_actual && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#6b7899" }}
                          >
                            {new Intl.NumberFormat("es-AR").format(v.km_actual)}{" "}
                            km
                            {v.km_proximo_service &&
                              ` · Próximo service: ${new Intl.NumberFormat("es-AR").format(v.km_proximo_service)} km`}
                          </p>
                        )}
                      </div>
                    </div>
                    {tieneOrdenActiva && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(251,191,36,0.08)",
                          color: "#fbbf24",
                          border: "1px solid rgba(251,191,36,0.2)",
                        }}
                      >
                        en taller
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
