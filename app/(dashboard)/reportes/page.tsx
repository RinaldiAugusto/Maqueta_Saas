import { createClient } from "@/utils/supabase/server";
import ReportesClient from "@/components/ReportesClient";

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ meses?: string }>;
}) {
  const mesesParam = parseInt((await searchParams).meses ?? "6");
  const meses = [3, 6, 12].includes(mesesParam) ? mesesParam : 6;

  const supabase = await createClient();

  const { data: ordenes } = await supabase
    .from("ordenes")
    .select("id, costo, estado, created_at, pagado, monto_cobrado, metodo_pago")
    .order("created_at", { ascending: true });

  const { data: turnosAll } = await supabase
    .from("turnos")
    .select("id, fecha, estado, estado_gestion, created_at");

  const { data: clientesAll } = await supabase
    .from("clientes")
    .select("id, created_at");

  const { data: vehiculosAll } = await supabase
    .from("vehiculos")
    .select("id, created_at");

  if (!ordenes || ordenes.length === 0) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          background: "#1a1f2e",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div className="text-center">
          <p className="text-4xl mb-4">◈</p>
          <p className="text-sm font-semibold" style={{ color: "#6b7899" }}>
            Todavía no hay datos suficientes para generar reportes.
          </p>
          <p className="text-xs mt-1" style={{ color: "#4a5068" }}>
            Ingresá órdenes desde el Tablero General para ver las métricas aquí.
          </p>
        </div>
      </div>
    );
  }

  const mesesNombres = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const hoy = new Date();

  // Ingresos por mes
  const ultimosMeses: {
    mes: string;
    ingresos: number;
    ordenes: number;
    cobradas: number;
  }[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const anio = fecha.getFullYear(),
      mes = fecha.getMonth();
    const ordenesDelMes = ordenes.filter((o) => {
      const d = new Date(o.created_at);
      return d.getFullYear() === anio && d.getMonth() === mes;
    });
    const cobradas = ordenesDelMes.filter((o) => o.pagado === true);
    const ingresos = cobradas.reduce(
      (acc, o) => acc + (Number(o.monto_cobrado ?? o.costo) || 0),
      0,
    );
    ultimosMeses.push({
      mes: `${mesesNombres[mes]} ${anio !== hoy.getFullYear() ? anio : ""}`.trim(),
      ingresos,
      ordenes: ordenesDelMes.length,
      cobradas: cobradas.length,
    });
  }

  const esFinalizado = (e: string) => e === "Finalizado" || e === "Terminado";
  const esEnCurso = (e: string) => e === "En Curso" || e === "En curso";

  const distribucionEstados = [
    {
      name: "Completado",
      value: ordenes.filter((o) => esFinalizado(o.estado)).length,
      color: "#34d399",
    },
    {
      name: "En Proceso",
      value: ordenes.filter((o) => esEnCurso(o.estado)).length,
      color: "#fbbf24",
    },
    {
      name: "Pendiente",
      value: ordenes.filter(
        (o) => !esFinalizado(o.estado) && !esEnCurso(o.estado),
      ).length,
      color: "#6b7899",
    },
  ].filter((d) => d.value > 0);

  // Métricas de pago
  const metodosPago: Record<string, number> = {};
  ordenes
    .filter((o) => o.pagado && o.metodo_pago)
    .forEach((o) => {
      const m = o.metodo_pago!;
      metodosPago[m] = (metodosPago[m] ?? 0) + 1;
    });
  const distribucionMetodos = Object.entries(metodosPago).map(
    ([name, value]) => ({ name, value }),
  );

  // Métricas globales
  const totalCobrado = ordenes
    .filter((o) => o.pagado === true)
    .reduce((acc, o) => acc + (Number(o.monto_cobrado ?? o.costo) || 0), 0);
  const totalPorCobrar = ordenes
    .filter((o) => o.pagado !== true)
    .reduce((acc, o) => acc + (Number(o.costo) || 0), 0);
  const totalOrdenes = ordenes.length;
  const ordenesFinalizadas = ordenes.filter((o) =>
    esFinalizado(o.estado),
  ).length;
  const ordenesCobradas = ordenes.filter((o) => o.pagado === true).length;
  const ticketPromedio =
    ordenesCobradas > 0 ? Math.round(totalCobrado / ordenesCobradas) : 0;
  const tasaCobro =
    totalOrdenes > 0 ? Math.round((ordenesCobradas / totalOrdenes) * 100) : 0;
  const tasaFinalizacion =
    totalOrdenes > 0
      ? Math.round((ordenesFinalizadas / totalOrdenes) * 100)
      : 0;

  const mejorMesData = [...ultimosMeses].sort(
    (a, b) => b.ingresos - a.ingresos,
  )[0];
  const mejorMes = mejorMesData?.ingresos > 0 ? mejorMesData.mes : "—";
  const mejorMesValor = mejorMesData?.ingresos ?? 0;

  // Turnos métricas
  const turnosConfirmados = (turnosAll || []).filter(
    (t) => t.estado_gestion === "confirmado",
  ).length;
  const turnosDenegados = (turnosAll || []).filter(
    (t) => t.estado_gestion === "denegado",
  ).length;
  const turnosPendientes = (turnosAll || []).filter(
    (t) => t.estado_gestion === "pendiente",
  ).length;
  const totalTurnos = (turnosAll || []).length;
  const tasaConfirmacion =
    totalTurnos > 0 ? Math.round((turnosConfirmados / totalTurnos) * 100) : 0;

  // Clientes y vehículos
  const totalClientes = (clientesAll || []).length;
  const totalVehiculos = (vehiculosAll || []).length;
  const vehiculosPorCliente =
    totalClientes > 0 ? (totalVehiculos / totalClientes).toFixed(1) : "0";

  // Promedio órdenes por mes (últimos meses con datos)
  const mesesConDatos = ultimosMeses.filter((m) => m.ordenes > 0);
  const promedioOrdenes =
    mesesConDatos.length > 0
      ? Math.round(
          mesesConDatos.reduce((a, m) => a + m.ordenes, 0) /
            mesesConDatos.length,
        )
      : 0;

  return (
    <ReportesClient
      ingresosPorMes={ultimosMeses}
      distribucionEstados={distribucionEstados}
      distribucionMetodos={distribucionMetodos}
      totalCobrado={totalCobrado}
      totalPorCobrar={totalPorCobrar}
      totalOrdenes={totalOrdenes}
      ticketPromedio={ticketPromedio}
      tasaCobro={tasaCobro}
      tasaFinalizacion={tasaFinalizacion}
      mejorMes={mejorMes}
      mejorMesValor={mejorMesValor}
      turnosConfirmados={turnosConfirmados}
      turnosDenegados={turnosDenegados}
      turnosPendientes={turnosPendientes}
      tasaConfirmacion={tasaConfirmacion}
      totalClientes={totalClientes}
      totalVehiculos={totalVehiculos}
      vehiculosPorCliente={vehiculosPorCliente}
      promedioOrdenesMes={promedioOrdenes}
      mesesActual={meses}
    />
  );
}
