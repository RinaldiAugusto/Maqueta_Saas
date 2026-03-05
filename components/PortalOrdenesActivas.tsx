"use client";

import { useState } from "react";
import Link from "next/link";

type Orden = {
  id: number;
  descripcion: string;
  costo: number;
  estado: string;
  created_at: string;
  pagado: boolean;
  pagado_por_cliente: boolean;
  monto_cobrado_cliente: number | null;
  metodo_pago_cliente: string | null;
  monto_cobrado: number | null;
  vehiculo: { id: number; patente: string; marca: string; modelo: string };
};

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

const normEstado = (e: string) =>
  e === "Terminado" ? "Finalizado" : e === "En curso" ? "En Curso" : e;

function DetalleModal({
  orden,
  onClose,
}: {
  orden: Orden;
  onClose: () => void;
}) {
  const cobrado = orden.pagado || orden.pagado_por_cliente;
  const en = normEstado(orden.estado);
  const st = estadoColor[en] ?? estadoColor["Pendiente"];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{
          background: "#202637",
          borderColor: "#2e3650",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="font-extrabold text-base"
              style={{ color: "#ffffff" }}
            >
              Detalle de la Orden
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6b7899" }}>
              #{orden.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center btn-animate btn-animate-ghost"
            style={{
              background: "#252b3b",
              color: "#6b7899",
              border: "1px solid #2e3650",
            }}
          >
            ✕
          </button>
        </div>
        <div
          className="flex items-center gap-3 p-3 rounded-xl mb-4"
          style={{ background: "#252b3b" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(79,142,247,0.08)", color: "#4f8ef7" }}
          >
            ◈
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "#dde3f0" }}>
              {orden.vehiculo.marca} {orden.vehiculo.modelo}
            </p>
            <span
              className="font-mono text-xs font-bold"
              style={{ color: "#a8b4cc", letterSpacing: "1.5px" }}
            >
              {orden.vehiculo.patente}
            </span>
          </div>
          <span
            className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: st.bg,
              color: st.color,
              border: `1px solid ${st.border}`,
            }}
          >
            {st.label}
          </span>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-between items-start">
            <span className="text-xs" style={{ color: "#6b7899" }}>
              Servicio / Descripción
            </span>
            <span
              className="text-xs font-semibold text-right ml-4"
              style={{ color: "#dde3f0", maxWidth: "60%" }}
            >
              {orden.descripcion}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: "#6b7899" }}>
              Presupuesto
            </span>
            <span
              className="text-sm font-extrabold"
              style={{ color: "#34d399" }}
            >
              ${new Intl.NumberFormat("es-AR").format(orden.costo)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: "#6b7899" }}>
              Fecha de ingreso
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: "#dde3f0" }}
            >
              {new Date(orden.created_at).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        {cobrado && (
          <div
            className="p-3 rounded-xl border mb-4"
            style={{
              background: "rgba(52,211,153,0.05)",
              borderColor: "rgba(52,211,153,0.2)",
            }}
          >
            <p className="text-xs font-bold mb-2" style={{ color: "#34d399" }}>
              ✓ Pago registrado
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "#6b7899" }}>
                  Monto abonado
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "#34d399" }}
                >
                  $
                  {new Intl.NumberFormat("es-AR").format(
                    orden.monto_cobrado_cliente ??
                      orden.monto_cobrado ??
                      orden.costo,
                  )}
                </span>
              </div>
              {orden.metodo_pago_cliente && (
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#6b7899" }}>
                    Método
                  </span>
                  <span
                    className="text-xs font-semibold capitalize"
                    style={{ color: "#dde3f0" }}
                  >
                    {orden.metodo_pago_cliente}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        {en === "En Curso" && !cobrado && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl mb-4"
            style={{
              background: "rgba(251,191,36,0.05)",
              border: "1px solid rgba(251,191,36,0.15)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
              style={{ background: "#fbbf24" }}
            />
            <p
              className="text-xs font-semibold"
              style={{ color: "rgba(251,191,36,0.8)" }}
            >
              Tu vehículo está siendo trabajado en este momento
            </p>
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full rounded-xl py-2.5 text-sm font-bold btn-animate btn-animate-ghost"
          style={{
            background: "#252b3b",
            color: "#6b7899",
            border: "1px solid #2e3650",
            fontFamily: "inherit",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default function PortalOrdenesActivas({
  ordenes,
}: {
  ordenes: Orden[];
}) {
  const [modalOrden, setModalOrden] = useState<Orden | null>(null);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs font-bold uppercase"
          style={{ color: "#6b7899", letterSpacing: "1.5px" }}
        >
          🔧 En el taller ahora
        </p>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#252b3b", color: "#6b7899" }}
        >
          {ordenes.length}
        </span>
      </div>

      {/* scroll-box: scrollbar del mismo color que el fondo (#1a1f2e del portal) */}
      <div
        className="scroll-box-portal flex flex-col gap-3 overflow-y-auto pr-1"
        style={{ maxHeight: "540px" }}
      >
        {ordenes.map((o) => {
          const en = normEstado(o.estado);
          const st = estadoColor[en] ?? estadoColor["Pendiente"];
          const cobrado = o.pagado || o.pagado_por_cliente;
          return (
            <div
              key={o.id}
              className="rounded-xl border p-5 flex-shrink-0"
              style={{
                background: "#252b3b",
                borderColor: st.border,
                borderLeftColor: st.color,
                borderLeftWidth: "4px",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                      className="font-bold text-sm"
                      style={{ color: "#dde3f0" }}
                    >
                      {o.vehiculo.marca} {o.vehiculo.modelo}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "#6b7899" }}>
                    {o.descripcion}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                  <span
                    className="text-sm font-extrabold"
                    style={{ color: "#dde3f0" }}
                  >
                    ${new Intl.NumberFormat("es-AR").format(o.costo)}
                  </span>
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: st.bg,
                      color: st.color,
                      border: `1px solid ${st.border}`,
                    }}
                  >
                    {st.label}
                  </span>
                </div>
              </div>
              {en === "En Curso" && !cobrado && (
                <div
                  className="mt-3 pt-3 border-t"
                  style={{ borderColor: "#2e3650" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: "#fbbf24" }}
                    />
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "rgba(251,191,36,0.8)" }}
                    >
                      Tu vehículo está siendo trabajado en este momento
                    </p>
                  </div>
                </div>
              )}
              <div
                className="mt-3 pt-3 border-t flex items-center gap-2 flex-wrap"
                style={{ borderColor: "#2e3650" }}
              >
                <button
                  onClick={() => setModalOrden(o)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg btn-animate btn-animate-ghost"
                  style={{
                    background: "rgba(107,120,153,0.12)",
                    color: "#a8b4cc",
                    border: "1px solid rgba(107,120,153,0.2)",
                    fontFamily: "inherit",
                  }}
                >
                  🔍 Ver detalle
                </button>
                {cobrado ? (
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    style={{
                      background: "rgba(52,211,153,0.08)",
                      color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.2)",
                    }}
                  >
                    ✓ Pagado
                  </span>
                ) : (
                  <Link
                    href={`/portal/pagar/${o.id}`}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg btn-animate"
                    style={{
                      background: "rgba(79,142,247,0.1)",
                      color: "#4f8ef7",
                      border: "1px solid rgba(79,142,247,0.25)",
                      textDecoration: "none",
                    }}
                  >
                    💳 Pagar
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {modalOrden && (
        <DetalleModal orden={modalOrden} onClose={() => setModalOrden(null)} />
      )}
    </div>
  );
}
