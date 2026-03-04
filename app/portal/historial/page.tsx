import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PortalHistorialPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: cliente } = await supabase
    .from("clientes")
    .select(
      "id, nombre, vehiculos ( id, patente, marca, modelo, ordenes ( id, descripcion, costo, estado, created_at, pagado, monto_cobrado ) )",
    )
    .eq("auth_id", user.id)
    .single();

  if (!cliente) redirect("/portal/sin-cuenta");

  const vehiculos = (cliente.vehiculos as any[]) || [];

  const todasOrdenes = vehiculos
    .flatMap((v: any) =>
      (v.ordenes || []).map((o: any) => ({ ...o, vehiculo: v })),
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  const normEstado = (e: string) =>
    e === "Terminado" ? "Finalizado" : e === "En curso" ? "En Curso" : e;

  const estadoColor: Record<
    string,
    { bg: string; color: string; border: string; label: string }
  > = {
    Pendiente: {
      bg: "rgba(107,120,153,0.12)",
      color: "#6b7899",
      border: "rgba(107,120,153,0.2)",
      label: "Pendiente",
    },
    "En Curso": {
      bg: "rgba(251,191,36,0.08)",
      color: "#fbbf24",
      border: "rgba(251,191,36,0.2)",
      label: "En proceso",
    },
    Finalizado: {
      bg: "rgba(52,211,153,0.08)",
      color: "#34d399",
      border: "rgba(52,211,153,0.2)",
      label: "Finalizado",
    },
  };

  const totalGastado = todasOrdenes
    .filter((o: any) => o.pagado === true)
    .reduce(
      (acc: number, o: any) => acc + (Number(o.monto_cobrado ?? o.costo) || 0),
      0,
    );

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#1a1f2e",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* NAVBAR */}
      <nav
        className="border-b px-6 py-4 flex items-center gap-4"
        style={{ background: "#202637", borderColor: "#2e3650" }}
      >
        <Link
          href="/portal"
          className="text-xs font-semibold flex items-center gap-1.5 transition-all"
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

      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1
              className="text-xl font-extrabold"
              style={{ color: "#ffffff", letterSpacing: "-0.3px" }}
            >
              Historial de Órdenes
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#6b7899" }}>
              Todos los trabajos realizados en tus vehículos
            </p>
          </div>
          {totalGastado > 0 && (
            <div
              className="px-4 py-2 rounded-xl border flex-shrink-0"
              style={{ background: "#252b3b", borderColor: "#2e3650" }}
            >
              <p className="text-xs" style={{ color: "#6b7899" }}>
                Total abonado
              </p>
              <p
                className="text-lg font-extrabold"
                style={{ color: "#34d399", letterSpacing: "-0.3px" }}
              >
                ${new Intl.NumberFormat("es-AR").format(totalGastado)}
              </p>
            </div>
          )}
        </div>

        {todasOrdenes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {todasOrdenes.map((o: any) => {
              const en = normEstado(o.estado);
              const st = estadoColor[en] ?? estadoColor["Pendiente"];
              return (
                <div
                  key={o.id}
                  className="rounded-xl border p-5 transition-all hover:-translate-y-0.5"
                  style={{ background: "#252b3b", borderColor: "#2e3650" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Vehículo */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            background: "#2a3145",
                            color: "#a8b4cc",
                            letterSpacing: "1.5px",
                          }}
                        >
                          {o.vehiculo.patente}
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#6b7899" }}
                        >
                          {o.vehiculo.marca} {o.vehiculo.modelo}
                        </span>
                      </div>
                      {/* Descripción */}
                      <p
                        className="text-sm font-semibold mb-1"
                        style={{ color: "#dde3f0" }}
                      >
                        {o.descripcion}
                      </p>
                      {/* Fecha */}
                      <p className="text-xs" style={{ color: "#6b7899" }}>
                        {new Date(o.created_at).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        className="text-lg font-extrabold"
                        style={{
                          color: o.pagado ? "#34d399" : "#dde3f0",
                          letterSpacing: "-0.3px",
                        }}
                      >
                        $
                        {new Intl.NumberFormat("es-AR").format(
                          o.pagado ? (o.monto_cobrado ?? o.costo) : o.costo,
                        )}
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: st.bg,
                          color: st.color,
                          border: `1px solid ${st.border}`,
                        }}
                      >
                        {st.label}
                      </span>
                      {o.pagado && (
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#34d399" }}
                        >
                          ✓ Pagado
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Link PDF solo si está finalizado */}
                  {en === "Finalizado" && (
                    <div
                      className="mt-3 pt-3 border-t flex justify-end"
                      style={{ borderColor: "#2e3650" }}
                    >
                      <a
                        href={`/api/presupuesto/${o.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          background: "rgba(79,142,247,0.08)",
                          color: "#4f8ef7",
                          border: "1px solid rgba(79,142,247,0.2)",
                          textDecoration: "none",
                        }}
                      >
                        ↓ Descargar PDF
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-xl border p-10 text-center"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <p className="text-3xl mb-3">◈</p>
            <p className="text-sm font-semibold" style={{ color: "#6b7899" }}>
              No hay órdenes registradas todavía.
            </p>
            <p className="text-xs mt-1" style={{ color: "#4a5068" }}>
              Tus trabajos aparecerán aquí una vez que ingreses tu vehículo al
              taller.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
