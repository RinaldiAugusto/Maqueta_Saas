"use client";

import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Props = {
  ingresosPorMes: {
    mes: string;
    ingresos: number;
    ordenes: number;
    cobradas?: number;
  }[];
  distribucionEstados: { name: string; value: number; color: string }[];
  distribucionMetodos?: { name: string; value: number }[];
  totalCobrado: number;
  totalPorCobrar: number;
  totalOrdenes: number;
  ticketPromedio: number;
  tasaCobro?: number;
  tasaFinalizacion?: number;
  mejorMes: string;
  mejorMesValor: number;
  turnosConfirmados?: number;
  turnosDenegados?: number;
  turnosPendientes?: number;
  tasaConfirmacion?: number;
  totalClientes?: number;
  totalVehiculos?: number;
  vehiculosPorCliente?: string;
  promedioOrdenesMes?: number;
  mesesActual: number;
};

const TT = ({ active, payload, label, format }: any) =>
  active && payload?.length ? (
    <div
      style={{
        background: "#202637",
        border: "1px solid #374060",
        borderRadius: "10px",
        padding: "12px 16px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <p style={{ color: "#6b7899", fontSize: "11px", marginBottom: "6px" }}>
        {label}
      </p>
      <p
        style={{
          color: format === "ordenes" ? "#4f8ef7" : "#34d399",
          fontWeight: 800,
          fontSize: "15px",
        }}
      >
        {format === "ordenes"
          ? `${payload[0].value} órdenes`
          : `$${new Intl.NumberFormat("es-AR").format(payload[0].value)}`}
      </p>
    </div>
  ) : null;

const TT3 = ({ active, payload }: any) =>
  active && payload?.length ? (
    <div
      style={{
        background: "#202637",
        border: "1px solid #374060",
        borderRadius: "10px",
        padding: "12px 16px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <p
        style={{
          color: payload[0].payload.color,
          fontWeight: 800,
          fontSize: "13px",
        }}
      >
        {payload[0].name}
      </p>
      <p style={{ color: "#dde3f0", fontWeight: 700, fontSize: "15px" }}>
        {payload[0].value} órdenes
      </p>
    </div>
  ) : null;

const metodoColors: Record<string, string> = {
  Efectivo: "#34d399",
  Transferencia: "#4f8ef7",
  "Mercado Pago": "#a78bfa",
  "Tarjeta de débito": "#fbbf24",
  "Tarjeta de crédito": "#f87171",
};

export default function ReportesClient({
  ingresosPorMes,
  distribucionEstados,
  distribucionMetodos,
  totalCobrado,
  totalPorCobrar,
  totalOrdenes,
  ticketPromedio,
  tasaCobro,
  tasaFinalizacion,
  mejorMes,
  mejorMesValor,
  turnosConfirmados,
  turnosDenegados,
  turnosPendientes,
  tasaConfirmacion,
  totalClientes,
  totalVehiculos,
  vehiculosPorCliente,
  promedioOrdenesMes,
  mesesActual,
}: Props) {
  const router = useRouter();

  const metricasPrincipales = [
    {
      label: "Total Cobrado",
      value: `$${new Intl.NumberFormat("es-AR").format(totalCobrado)}`,
      color: "#34d399",
      icon: "$",
      bg: "rgba(52,211,153,0.08)",
    },
    {
      label: "Por Cobrar",
      value: `$${new Intl.NumberFormat("es-AR").format(totalPorCobrar)}`,
      color: "#fbbf24",
      icon: "◷",
      bg: "rgba(251,191,36,0.08)",
    },
    {
      label: "Total Órdenes",
      value: totalOrdenes.toString(),
      color: "#60a5fa",
      icon: "◈",
      bg: "rgba(96,165,250,0.08)",
    },
    {
      label: "Ticket Promedio",
      value: `$${new Intl.NumberFormat("es-AR").format(ticketPromedio)}`,
      color: "#c084fc",
      icon: "◉",
      bg: "rgba(192,132,252,0.08)",
    },
  ];

  const metricasSecundarias = [
    ...(tasaCobro !== undefined
      ? [
          {
            label: "Tasa de Cobro",
            value: `${tasaCobro}%`,
            color: "#34d399",
            bg: "rgba(52,211,153,0.08)",
          },
        ]
      : []),
    ...(tasaFinalizacion !== undefined
      ? [
          {
            label: "Tasa Finalización",
            value: `${tasaFinalizacion}%`,
            color: "#4f8ef7",
            bg: "rgba(79,142,247,0.08)",
          },
        ]
      : []),
    ...(promedioOrdenesMes !== undefined
      ? [
          {
            label: "Prom. Órdenes/Mes",
            value: `${promedioOrdenesMes}`,
            color: "#a78bfa",
            bg: "rgba(167,139,250,0.08)",
          },
        ]
      : []),
    ...(totalClientes !== undefined
      ? [
          {
            label: "Clientes Registrados",
            value: `${totalClientes}`,
            color: "#fbbf24",
            bg: "rgba(251,191,36,0.08)",
          },
        ]
      : []),
    ...(totalVehiculos !== undefined
      ? [
          {
            label: "Vehículos en Flota",
            value: `${totalVehiculos}`,
            color: "#60a5fa",
            bg: "rgba(96,165,250,0.08)",
          },
        ]
      : []),
    ...(vehiculosPorCliente !== undefined
      ? [
          {
            label: "Vehíc. / Cliente",
            value: `${vehiculosPorCliente}`,
            color: "#f87171",
            bg: "rgba(248,113,113,0.08)",
          },
        ]
      : []),
  ];

  const metricasTurnos = [
    ...(tasaConfirmacion !== undefined
      ? [
          {
            label: "Tasa Confirmación",
            value: `${tasaConfirmacion}%`,
            color: "#34d399",
            bg: "rgba(52,211,153,0.08)",
          },
        ]
      : []),
    ...(turnosConfirmados !== undefined
      ? [
          {
            label: "Turnos Confirmados",
            value: `${turnosConfirmados}`,
            color: "#4f8ef7",
            bg: "rgba(79,142,247,0.08)",
          },
        ]
      : []),
    ...(turnosDenegados !== undefined
      ? [
          {
            label: "Turnos Denegados",
            value: `${turnosDenegados}`,
            color: "#f87171",
            bg: "rgba(248,113,113,0.08)",
          },
        ]
      : []),
    ...(turnosPendientes !== undefined
      ? [
          {
            label: "Turnos Pendientes",
            value: `${turnosPendientes}`,
            color: "#fbbf24",
            bg: "rgba(251,191,36,0.08)",
          },
        ]
      : []),
  ];

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
        {/* HEADER */}
        <div
          className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-5 border-b"
          style={{ borderColor: "#2e3650" }}
        >
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: "#ffffff", letterSpacing: "-0.3px" }}
            >
              Reportes y Análisis
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#6b7899" }}>
              Métricas financieras y operativas del taller
            </p>
          </div>
          <div
            className="flex items-center gap-2 p-1 rounded-lg"
            style={{ background: "#252b3b", border: "1px solid #374060" }}
          >
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                onClick={() => router.push(`/reportes?meses=${m}`)}
                className="px-3 py-1.5 rounded-md text-xs font-bold btn-animate btn-animate-ghost"
                style={{
                  background: mesesActual === m ? "#4f8ef7" : "transparent",
                  color: mesesActual === m ? "#fff" : "#6b7899",
                  fontFamily: "inherit",
                }}
              >
                {m} meses
              </button>
            ))}
          </div>
        </div>

        {/* MÉTRICAS PRINCIPALES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {metricasPrincipales.map(({ label, value, color, icon, bg }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-4 rounded-xl border hover:-translate-y-0.5 transition-all"
              style={{ background: "#252b3b", borderColor: "#2e3650" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: bg, color }}
              >
                {icon}
              </div>
              <div>
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: "#6b7899",
                    fontSize: "10px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {label}
                </p>
                <p
                  className="font-extrabold text-base"
                  style={{ color, letterSpacing: "-0.3px" }}
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* MÉTRICAS SECUNDARIAS */}
        {metricasSecundarias.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            {metricasSecundarias.map(({ label, value, color, bg }) => (
              <div
                key={label}
                className="flex flex-col gap-1.5 p-3 rounded-xl border hover:-translate-y-0.5 transition-all"
                style={{ background: "#252b3b", borderColor: "#2e3650" }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: "#6b7899",
                    fontSize: "9.5px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {label}
                </p>
                <p
                  className="font-extrabold text-lg"
                  style={{ color, letterSpacing: "-0.3px" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* GRÁFICOS FILA 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Barras ingresos */}
          <div
            className="lg:col-span-2 rounded-xl border p-5"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p
                  className="text-xs font-bold uppercase"
                  style={{ color: "#6b7899", letterSpacing: "1.5px" }}
                >
                  Ingresos Cobrados por Mes
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#6b7899" }}>
                  Mejor mes:{" "}
                  <span style={{ color: "#34d399", fontWeight: 700 }}>
                    {mejorMes} — $
                    {new Intl.NumberFormat("es-AR").format(mejorMesValor)}
                  </span>
                </p>
              </div>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#34d399", boxShadow: "0 0 8px #34d399" }}
              />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ingresosPorMes} barSize={28}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2e3650"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  tick={{
                    fill: "#6b7899",
                    fontSize: 11,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fill: "#6b7899",
                    fontSize: 10,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `$${new Intl.NumberFormat("es-AR").format(v)}`
                  }
                  width={70}
                />
                <Tooltip
                  content={<TT format="ingresos" />}
                  cursor={{ fill: "rgba(52,211,153,0.04)" }}
                />
                <Bar
                  dataKey="ingresos"
                  fill="#34d399"
                  radius={[6, 6, 0, 0]}
                  fillOpacity={0.9}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dona estados */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <p
              className="text-xs font-bold uppercase mb-5"
              style={{ color: "#6b7899", letterSpacing: "1.5px" }}
            >
              Estado de Órdenes
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={distribucionEstados}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distribucionEstados.map((e, i) => (
                    <Cell key={i} fill={e.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<TT3 />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-3">
              {distribucionEstados.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "#a8b4cc" }}
                    >
                      {d.name}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: d.color }}
                  >
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILA 2: línea + turnos + métodos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Línea volumen */}
          <div
            className="lg:col-span-2 rounded-xl border p-5"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p
                  className="text-xs font-bold uppercase"
                  style={{ color: "#6b7899", letterSpacing: "1.5px" }}
                >
                  Volumen de Órdenes
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#6b7899" }}>
                  Trabajos ingresados por mes
                </p>
              </div>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#4f8ef7", boxShadow: "0 0 8px #4f8ef7" }}
              />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={ingresosPorMes}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2e3650"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  tick={{
                    fill: "#6b7899",
                    fontSize: 11,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7899", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<TT format="ordenes" />}
                  cursor={{ stroke: "#374060", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="ordenes"
                  stroke="#4f8ef7"
                  strokeWidth={2.5}
                  dot={{ fill: "#4f8ef7", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#4f8ef7", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas de turnos */}
          {metricasTurnos.length > 0 && (
            <div
              className="rounded-xl border p-5 flex flex-col gap-4"
              style={{ background: "#252b3b", borderColor: "#2e3650" }}
            >
              <p
                className="text-xs font-bold uppercase"
                style={{ color: "#6b7899", letterSpacing: "1.5px" }}
              >
                Gestión de Turnos
              </p>
              {metricasTurnos.map(({ label, value, color, bg }) => (
                <div
                  key={label}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "#202637", border: "1px solid #2e3650" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "#a8b4cc" }}
                    >
                      {label}
                    </span>
                  </div>
                  <span className="font-extrabold text-lg" style={{ color }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Métodos de pago */}
        {distribucionMetodos && distribucionMetodos.length > 0 && (
          <div
            className="rounded-xl border p-5"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <p
              className="text-xs font-bold uppercase mb-4"
              style={{ color: "#6b7899", letterSpacing: "1.5px" }}
            >
              Métodos de Pago Utilizados
            </p>
            <div className="flex flex-wrap gap-3">
              {distribucionMetodos.map((m) => {
                const color = metodoColors[m.name] ?? "#a8b4cc";
                const pct =
                  totalOrdenes > 0
                    ? Math.round((m.value / totalOrdenes) * 100)
                    : 0;
                return (
                  <div
                    key={m.name}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                    style={{ background: "#202637", borderColor: "#2e3650" }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#dde3f0" }}
                    >
                      {m.name}
                    </span>
                    <span
                      className="font-extrabold text-sm ml-2"
                      style={{ color }}
                    >
                      {m.value}
                    </span>
                    <span className="text-xs" style={{ color: "#6b7899" }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
