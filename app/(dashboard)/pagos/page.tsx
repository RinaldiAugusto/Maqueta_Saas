import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ metodo?: string; desde?: string; hasta?: string }>;
}) {
  const { metodo, desde, hasta } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("ordenes")
    .select(
      `id, descripcion, costo, monto_cobrado, metodo_pago, fecha_pago, pagado, created_at, vehiculos ( patente, marca, modelo, clientes ( nombre ) )`,
    )
    .eq("pagado", true)
    .order("fecha_pago", { ascending: false });

  if (metodo) query = query.eq("metodo_pago", metodo);
  if (desde) query = query.gte("fecha_pago", desde);
  if (hasta) query = query.lte("fecha_pago", hasta + "T23:59:59");

  const { data: pagos } = await query;

  type Pago = {
    id: number;
    descripcion: string;
    costo: number;
    monto_cobrado: number | null;
    metodo_pago: string | null;
    fecha_pago: string | null;
    pagado: boolean;
    created_at: string;
    vehiculos: {
      patente: string;
      marca: string;
      modelo: string;
      clientes: { nombre: string } | null;
    } | null;
  };

  const pagosTyped = (pagos ?? []) as unknown as Pago[];

  const totalCobrado = pagosTyped.reduce(
    (acc, p) => acc + (p.monto_cobrado ?? p.costo),
    0,
  );

  const metodos = [
    "Efectivo",
    "Transferencia",
    "Mercado Pago",
    "Tarjeta de débito",
    "Tarjeta de crédito",
  ];

  const porMetodo: Record<string, number> = {};
  pagosTyped.forEach((p) => {
    const m = p.metodo_pago ?? "Sin especificar";
    porMetodo[m] = (porMetodo[m] ?? 0) + (p.monto_cobrado ?? p.costo);
  });

  const metodoPrincipal =
    Object.entries(porMetodo).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const inputStyle = {
    background: "#202637",
    border: "1px solid #374060",
    padding: "8px 12px",
    color: "#dde3f0",
    fontFamily: "inherit",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
  };

  return (
    <div
      className="p-6 md:p-8"
      style={{
        background: "#1a1f2e",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="mx-auto max-w-5xl">
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
              Historial de Pagos
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#6b7899" }}>
              Todos los cobros registrados
            </p>
          </div>
          <a
            href="/api/pagos/exportar"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-all"
            style={{
              background: "rgba(52,211,153,0.08)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            ↓ Exportar CSV
          </a>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: "Total cobrado",
              value: `$${new Intl.NumberFormat("es-AR").format(totalCobrado)}`,
              color: "#34d399",
              bg: "rgba(52,211,153,0.08)",
              size: "lg",
            },
            {
              label: "Transacciones",
              value: pagosTyped.length.toString(),
              color: "#4f8ef7",
              bg: "rgba(79,142,247,0.08)",
              size: "xl",
            },
            {
              label: "Método principal",
              value: metodoPrincipal,
              color: "#c084fc",
              bg: "rgba(192,132,252,0.08)",
              size: "sm",
            },
            {
              label: "Ticket promedio",
              value:
                pagosTyped.length > 0
                  ? `$${new Intl.NumberFormat("es-AR").format(Math.round(totalCobrado / pagosTyped.length))}`
                  : "$0",
              color: "#fbbf24",
              bg: "rgba(251,191,36,0.08)",
              size: "lg",
            },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className="flex flex-col gap-1.5 p-4 rounded-xl border"
              style={{ background: "#252b3b", borderColor: "#2e3650" }}
            >
              <p className="text-xs font-semibold" style={{ color: "#6b7899" }}>
                {label}
              </p>
              <p
                className="font-extrabold"
                style={{
                  color,
                  fontSize: value.length > 10 ? "14px" : "18px",
                  letterSpacing: "-0.3px",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <form
          className="flex flex-wrap gap-3 mb-5 p-4 rounded-xl border"
          style={{ background: "#252b3b", borderColor: "#2e3650" }}
        >
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-semibold"
              style={{ color: "#6b7899" }}
            >
              Método
            </label>
            <select
              name="metodo"
              defaultValue={metodo ?? ""}
              style={inputStyle}
            >
              <option value="">Todos</option>
              {metodos.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-semibold"
              style={{ color: "#6b7899" }}
            >
              Desde
            </label>
            <input
              type="date"
              name="desde"
              defaultValue={desde ?? ""}
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-semibold"
              style={{ color: "#6b7899" }}
            >
              Hasta
            </label>
            <input
              type="date"
              name="hasta"
              defaultValue={hasta ?? ""}
              style={inputStyle}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-lg text-xs font-bold px-4 py-2 transition-all"
              style={{
                background: "#4f8ef7",
                color: "#fff",
                fontFamily: "inherit",
              }}
            >
              Filtrar
            </button>
            <a
              href="/pagos"
              className="rounded-lg text-xs font-semibold px-4 py-2 border"
              style={{
                background: "transparent",
                color: "#6b7899",
                borderColor: "#374060",
              }}
            >
              Limpiar
            </a>
          </div>
        </form>

        {/* TABLA */}
        {pagosTyped.length === 0 ? (
          <div
            className="rounded-xl border p-10 text-center"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <p className="text-2xl mb-2">$</p>
            <p className="text-sm font-semibold" style={{ color: "#6b7899" }}>
              No hay pagos registrados
              {metodo || desde || hasta ? " con esos filtros" : ""}
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "#2e3650" }}
          >
            {/* Header tabla */}
            <div
              className="grid grid-cols-12 gap-2 px-5 py-3"
              style={{
                background: "#202637",
                borderBottom: "1px solid #2e3650",
              }}
            >
              {[
                "Fecha",
                "Vehículo",
                "Cliente",
                "Descripción",
                "Método",
                "Monto",
              ].map((h) => (
                <p
                  key={h}
                  className={`text-xs font-bold uppercase ${h === "Descripción" ? "col-span-3" : h === "Monto" ? "col-span-2 text-right" : "col-span-2"}`}
                  style={{ color: "#6b7899", letterSpacing: "1px" }}
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Filas */}
            {pagosTyped.map((p, idx) => (
              <Link
                key={p.id}
                href={`/ordenes/${p.id}`}
                className="grid grid-cols-12 gap-2 px-5 py-3.5 transition-all hover:bg-white/5"
                style={{
                  borderBottom:
                    idx < pagosTyped.length - 1 ? "1px solid #2e3650" : "none",
                  background: idx % 2 === 0 ? "#252b3b" : "#232940",
                  textDecoration: "none",
                }}
              >
                <p className="col-span-2 text-xs" style={{ color: "#a8b4cc" }}>
                  {p.fecha_pago
                    ? new Date(p.fecha_pago).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                <p
                  className="col-span-2 text-xs font-mono font-bold"
                  style={{ color: "#dde3f0" }}
                >
                  {p.vehiculos?.patente ?? "—"}
                </p>
                <p
                  className="col-span-2 text-xs truncate"
                  style={{ color: "#a8b4cc" }}
                >
                  {p.vehiculos?.clientes?.nombre ?? "—"}
                </p>
                <p
                  className="col-span-3 text-xs truncate"
                  style={{ color: "#6b7899" }}
                >
                  {p.descripcion}
                </p>
                <div className="col-span-1 flex items-center">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        p.metodo_pago === "Efectivo"
                          ? "rgba(52,211,153,0.08)"
                          : p.metodo_pago === "Transferencia"
                            ? "rgba(79,142,247,0.08)"
                            : p.metodo_pago === "Mercado Pago"
                              ? "rgba(192,132,252,0.08)"
                              : "rgba(107,120,153,0.12)",
                      color:
                        p.metodo_pago === "Efectivo"
                          ? "#34d399"
                          : p.metodo_pago === "Transferencia"
                            ? "#4f8ef7"
                            : p.metodo_pago === "Mercado Pago"
                              ? "#c084fc"
                              : "#6b7899",
                      fontSize: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.metodo_pago ?? "—"}
                  </span>
                </div>
                <p
                  className="col-span-2 text-sm font-extrabold text-right"
                  style={{ color: "#34d399" }}
                >
                  $
                  {new Intl.NumberFormat("es-AR").format(
                    p.monto_cobrado ?? p.costo,
                  )}
                </p>
              </Link>
            ))}

            {/* Total */}
            <div
              className="grid grid-cols-12 gap-2 px-5 py-3 border-t"
              style={{ background: "#202637", borderColor: "#2e3650" }}
            >
              <p
                className="col-span-10 text-xs font-bold text-right"
                style={{ color: "#6b7899" }}
              >
                TOTAL ({pagosTyped.length} transacciones)
              </p>
              <p
                className="col-span-2 text-sm font-extrabold text-right"
                style={{ color: "#34d399" }}
              >
                ${new Intl.NumberFormat("es-AR").format(totalCobrado)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
