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
  pagado_por_cliente?: boolean;
  monto_cobrado_cliente?: number;
  metodo_pago_cliente?: string;
  monto_cobrado?: number;
  vehiculo: {
    id: number;
    patente: string;
    marca: string;
    modelo: string;
    año?: string;
  };
};

// TIMELINE basada en orden.estado (lo que el admin mueve en el Kanban)
// "Pendiente"  → idx 0 Recibido
// "En Proceso" → idx 1 En proceso
// "Completado" → idx 2 Listo (sin cobrar)
// pagado=true  → idx 3 Entregado → sale de esta lista

const STEPS = [
  { label: "Recibido", icon: "📋" },
  { label: "En proceso", icon: "🔧" },
  { label: "Listo", icon: "✅" },
  { label: "Entregado", icon: "🏁" },
];

function getIdx(o: Orden): number {
  if (o.pagado || o.pagado_por_cliente) return 3;
  const e = (o.estado ?? "").trim();
  if (e === "Completado") return 2;
  if (e === "En Proceso") return 1;
  return 0;
}

function Timeline({ orden }: { orden: Orden }) {
  const idx = getIdx(orden);
  return (
    <div className="flex items-center mt-3">
      {STEPS.map((step, i) => {
        const pasado = i < idx;
        const actual = i === idx;
        const isLast = i === STEPS.length - 1;
        return (
          <div
            key={step.label}
            className="flex items-center"
            style={{ flex: isLast ? "0 0 auto" : "1" }}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: actual
                    ? "rgba(79,142,247,0.2)"
                    : pasado
                      ? "rgba(52,211,153,0.12)"
                      : "rgba(255,255,255,0.04)",
                  border: actual
                    ? "2px solid #4f8ef7"
                    : pasado
                      ? "2px solid #34d399"
                      : "1px solid #2e3650",
                  boxShadow: actual ? "0 0 12px rgba(79,142,247,0.3)" : "none",
                }}
              >
                <span style={{ fontSize: "14px" }}>{step.icon}</span>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  color: actual ? "#4f8ef7" : pasado ? "#34d399" : "#4a5068",
                }}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className="flex-1 h-0.5 mx-1 mb-4"
                style={{ background: i < idx ? "#34d399" : "#2e3650" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PortalOrdenesActivas({
  ordenes,
}: {
  ordenes: Orden[];
}) {
  const [modal, setModal] = useState<Orden | null>(null);

  return (
    <>
      <div
        className="rounded-xl border p-5"
        style={{ background: "#252b3b", borderColor: "#2e3650" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <p
            className="text-xs font-bold uppercase"
            style={{ color: "#6b7899", letterSpacing: "1.5px" }}
          >
            🔧 En el taller ahora
          </p>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#2a3145", color: "#6b7899" }}
          >
            {ordenes.length}
          </span>
        </div>

        <div
          className="scroll-box-portal flex flex-col gap-3 overflow-y-auto pr-1"
          style={{ maxHeight: "540px" }}
        >
          {ordenes.map((o) => {
            const pendientePago =
              !o.pagado &&
              !o.pagado_por_cliente &&
              o.estado?.trim() === "Completado";
            return (
              <div
                key={o.id}
                className="rounded-xl border p-4"
                style={{ background: "#202637", borderColor: "#2e3650" }}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="font-mono text-xs font-bold px-2.5 py-1 rounded"
                        style={{
                          background: "#2a3145",
                          color: "#a8b4cc",
                          letterSpacing: "1.5px",
                        }}
                      >
                        {o.vehiculo.patente}
                      </span>
                      <span className="text-xs" style={{ color: "#6b7899" }}>
                        {o.vehiculo.marca} {o.vehiculo.modelo}
                      </span>
                    </div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#dde3f0" }}
                    >
                      {o.descripcion}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                    <button
                      onClick={() => setModal(o)}
                      className="btn-animate btn-ghost text-xs font-bold px-2.5 py-1.5 rounded-lg"
                      style={{
                        background: "rgba(79,142,247,0.08)",
                        color: "#4f8ef7",
                        border: "1px solid rgba(79,142,247,0.2)",
                        fontFamily: "inherit",
                      }}
                    >
                      🔍 Ver detalle
                    </button>
                    <Link
                      href={`/portal/chat/${o.id}`}
                      className="btn-animate btn-ghost text-xs font-bold px-2.5 py-1.5 rounded-lg"
                      style={{
                        background: "rgba(192,132,252,0.08)",
                        color: "#c084fc",
                        border: "1px solid rgba(192,132,252,0.2)",
                        textDecoration: "none",
                      }}
                    >
                      💬 Consultar
                    </Link>
                  </div>
                </div>

                <Timeline orden={o} />

                {pendientePago && (
                  <div
                    className="mt-3 pt-3 border-t flex items-center justify-between"
                    style={{ borderColor: "#2e3650" }}
                  >
                    <p
                      className="text-xs font-bold"
                      style={{ color: "#fbbf24" }}
                    >
                      💳 Pago pendiente: $
                      {new Intl.NumberFormat("es-AR").format(
                        o.monto_cobrado ?? o.costo,
                      )}
                    </p>
                    <Link
                      href={`/portal/pago/${o.id}`}
                      className="btn-animate btn-green text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{
                        background: "rgba(52,211,153,0.08)",
                        color: "#34d399",
                        border: "1px solid rgba(52,211,153,0.2)",
                        textDecoration: "none",
                      }}
                    >
                      Pagar →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{ background: "#202637", borderColor: "#2e3650" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p
                  className="font-extrabold text-base"
                  style={{ color: "#fff" }}
                >
                  Detalle de Orden
                </p>
                <p className="text-xs" style={{ color: "#6b7899" }}>
                  #{modal.id}
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="btn-animate btn-ghost w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "#252b3b",
                  color: "#6b7899",
                  border: "1px solid #2e3650",
                }}
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl" style={{ background: "#252b3b" }}>
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: "#6b7899" }}
                >
                  Vehículo
                </p>
                <p className="font-bold text-sm" style={{ color: "#dde3f0" }}>
                  {modal.vehiculo.marca} {modal.vehiculo.modelo}
                </p>
                <span
                  className="font-mono text-xs"
                  style={{ color: "#a8b4cc" }}
                >
                  {modal.vehiculo.patente}
                </span>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "#252b3b" }}>
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: "#6b7899" }}
                >
                  Descripción
                </p>
                <p className="text-sm" style={{ color: "#dde3f0" }}>
                  {modal.descripcion}
                </p>
              </div>
              <div className="flex gap-2">
                <div
                  className="flex-1 p-3 rounded-xl"
                  style={{ background: "#252b3b" }}
                >
                  <p
                    className="text-xs font-semibold mb-0.5"
                    style={{ color: "#6b7899" }}
                  >
                    Estado actual
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#4f8ef7" }}>
                    {modal.estado}
                  </p>
                </div>
                <div
                  className="flex-1 p-3 rounded-xl"
                  style={{ background: "#252b3b" }}
                >
                  <p
                    className="text-xs font-semibold mb-0.5"
                    style={{ color: "#6b7899" }}
                  >
                    Presupuesto
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#34d399" }}>
                    $
                    {new Intl.NumberFormat("es-AR").format(
                      modal.monto_cobrado ?? modal.costo,
                    )}
                  </p>
                </div>
              </div>
              <Timeline orden={modal} />
              <Link
                href={`/portal/chat/${modal.id}`}
                className="btn-animate btn-ghost w-full text-center py-2.5 rounded-xl text-xs font-bold mt-1"
                style={{
                  background: "rgba(192,132,252,0.08)",
                  color: "#c084fc",
                  border: "1px solid rgba(192,132,252,0.2)",
                  textDecoration: "none",
                }}
              >
                💬 Abrir chat con el taller
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
