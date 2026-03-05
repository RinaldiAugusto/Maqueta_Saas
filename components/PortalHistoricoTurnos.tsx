"use client";

import { useState } from "react";

type Turno = {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  estado_gestion: string;
  descripcion: string | null;
  servicios: { nombre: string } | null;
  vehiculos: { patente: string; marca: string; modelo: string } | null;
};

const inputDateStyle: React.CSSProperties = {
  background: "#202637",
  border: "1px solid #374060",
  padding: "6px 9px",
  color: "#dde3f0",
  fontFamily: "inherit",
  borderRadius: "8px",
  fontSize: "11px",
  outline: "none",
  colorScheme: "dark",
};

export default function PortalHistoricoTurnos({ turnos }: { turnos: Turno[] }) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const filtrados = turnos.filter((t) => {
    if (desde && t.fecha < desde) return false;
    if (hasta && t.fecha > hasta) return false;
    return true;
  });

  const hayFiltros = desde || hasta;

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "#252b3b", borderColor: "#2e3650" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p
            className="text-xs font-bold uppercase"
            style={{ color: "#6b7899", letterSpacing: "1.5px" }}
          >
            📅 Histórico de Turnos
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#4a5068" }}>
            {filtrados.length} turno{filtrados.length !== 1 ? "s" : ""}
            {hayFiltros ? " en el período" : " en total"}
          </p>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#2a3145", color: "#6b7899" }}
        >
          {filtrados.length}
        </span>
      </div>

      {/* Filtro de fechas */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold" style={{ color: "#6b7899" }}>
            Desde
          </span>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            style={inputDateStyle}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold" style={{ color: "#6b7899" }}>
            Hasta
          </span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            style={inputDateStyle}
          />
        </div>
        {hayFiltros && (
          <button
            onClick={() => {
              setDesde("");
              setHasta("");
            }}
            className="btn-animate btn-ghost text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            style={{
              background: "rgba(248,113,113,0.08)",
              color: "#f87171",
              border: "1px solid rgba(248,113,113,0.15)",
              fontFamily: "inherit",
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Lista */}
      <div
        className="scroll-box-portal flex flex-col gap-2 overflow-y-auto pr-1"
        style={{ maxHeight: "440px" }}
      >
        {filtrados.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "#6b7899" }}>
            {hayFiltros
              ? "No hay turnos en ese período."
              : "No tenés turnos registrados."}
          </p>
        ) : (
          filtrados.map((t) => {
            const confirmado = t.estado_gestion === "confirmado";
            const denegado = t.estado_gestion === "denegado";
            const estadoColor = confirmado
              ? "#34d399"
              : denegado
                ? "#f87171"
                : "#fbbf24";
            const estadoBg = confirmado
              ? "rgba(52,211,153,0.08)"
              : denegado
                ? "rgba(248,113,113,0.08)"
                : "rgba(251,191,36,0.08)";
            const estadoBorder = confirmado
              ? "rgba(52,211,153,0.2)"
              : denegado
                ? "rgba(248,113,113,0.2)"
                : "rgba(251,191,36,0.2)";
            const estadoLabel = confirmado
              ? "✓ Confirmado"
              : denegado
                ? "✕ Cancelado"
                : "Pendiente";

            return (
              <div
                key={t.id}
                className="rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0"
                style={{
                  background: "#202637",
                  borderColor: estadoBorder,
                  borderLeftColor: estadoColor,
                  borderLeftWidth: "3px",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        background: "#2a3145",
                        color: "#a8b4cc",
                        letterSpacing: "1.5px",
                      }}
                    >
                      {t.vehiculos?.patente}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#4f8ef7" }}
                    >
                      {new Date(t.fecha + "T00:00:00").toLocaleDateString(
                        "es-AR",
                        {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#a8b4cc" }}
                    >
                      {t.hora?.slice(0, 5)}
                    </span>
                  </div>
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: "#dde3f0" }}
                  >
                    {t.servicios?.nombre ?? t.descripcion ?? "Turno agendado"}
                  </p>
                  <p className="text-xs" style={{ color: "#6b7899" }}>
                    {t.vehiculos?.marca} {t.vehiculos?.modelo}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: estadoBg,
                    color: estadoColor,
                    border: `1px solid ${estadoBorder}`,
                  }}
                >
                  {estadoLabel}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
