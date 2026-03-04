"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

type Orden = {
  id: number;
  descripcion: string;
  costo: number;
  estadoLimpio: string;
  pagado: boolean;
  pagado_por_cliente?: boolean;
  monto_cobrado: number | null;
  metodo_pago?: string | null;
  created_at?: string;
  vehiculoData: { patente: string; marca: string; modelo: string } | null;
};

type Props = {
  pendientes: Orden[];
  enCurso: Orden[];
  historial: Orden[];
  moverEstadoAction: (formData: FormData) => void | Promise<void>;
  eliminarOrdenAction: (formData: FormData) => void | Promise<void>;
};

function ColHeader({
  label,
  count,
  color,
  bg,
  border,
  collapsed,
  onToggle,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
  border?: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 pb-3 cursor-pointer select-none"
      style={{
        borderBottom: collapsed ? "none" : "1px solid #2e3650",
        marginBottom: collapsed ? 0 : "12px",
      }}
      onClick={onToggle}
    >
      <span
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase"
        style={{
          background: bg,
          color,
          border: border ? `1px solid ${border}` : undefined,
          letterSpacing: "1px",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: color }}
        />
        {label}
      </span>
      <span
        className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold"
        style={{ background: "#2a3145", color: "#6b7899" }}
      >
        {count}
      </span>
      <span
        className="text-xs transition-transform duration-200"
        style={{
          color: "#6b7899",
          transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
        }}
      >
        ▾
      </span>
    </div>
  );
}

function DetalleModal({
  orden,
  onClose,
}: {
  orden: Orden;
  onClose: () => void;
}) {
  const montoFinal = orden.monto_cobrado ?? orden.costo;
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
              Detalle de Orden Cobrada
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6b7899" }}>
              #{orden.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
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
            style={{ background: "rgba(52,211,153,0.08)", color: "#34d399" }}
          >
            ◈
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "#dde3f0" }}>
              {orden.vehiculoData?.marca} {orden.vehiculoData?.modelo}
            </p>
            <span
              className="font-mono text-xs font-bold"
              style={{ color: "#a8b4cc", letterSpacing: "1.5px" }}
            >
              {orden.vehiculoData?.patente}
            </span>
          </div>
          <span
            className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: "rgba(52,211,153,0.08)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            ✓ Cobrado
          </span>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-between items-start">
            <span className="text-xs" style={{ color: "#6b7899" }}>
              Descripción
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
              Monto cobrado
            </span>
            <span
              className="text-lg font-extrabold"
              style={{ color: "#34d399" }}
            >
              ${new Intl.NumberFormat("es-AR").format(montoFinal ?? 0)}
            </span>
          </div>
          {orden.metodo_pago && (
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: "#6b7899" }}>
                Método de pago
              </span>
              <span
                className="text-xs font-semibold capitalize"
                style={{ color: "#dde3f0" }}
              >
                {orden.metodo_pago}
              </span>
            </div>
          )}
          {orden.created_at && (
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: "#6b7899" }}>
                Fecha
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
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/ordenes/${orden.id}`}
            className="flex-1 text-center rounded-xl py-2.5 text-xs font-bold"
            style={{
              background: "rgba(79,142,247,0.08)",
              color: "#4f8ef7",
              border: "1px solid rgba(79,142,247,0.2)",
              textDecoration: "none",
            }}
          >
            Ver orden completa
          </Link>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-xs font-bold"
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
    </div>
  );
}

function KanbanCol({
  label,
  count,
  color,
  bg,
  border,
  collapsed,
  onToggle,
  items,
  moverEstadoAction,
  eliminarOrdenAction,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
  border?: string;
  collapsed: boolean;
  onToggle: () => void;
  items: Orden[];
  moverEstadoAction: (fd: FormData) => void | Promise<void>;
  eliminarOrdenAction: (fd: FormData) => void | Promise<void>;
}) {
  const [busq, setBusq] = useState("");
  const cobradoBadge = (o: Orden) => o.pagado || o.pagado_por_cliente;
  const filtered = items.filter(
    (o) =>
      !busq ||
      o.vehiculoData?.patente?.toLowerCase().includes(busq.toLowerCase()),
  );
  const esFinalizado = label === "Completado";

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "#252b3b", borderColor: "#2e3650" }}
    >
      <ColHeader
        label={label}
        count={count}
        color={color}
        bg={bg}
        border={border}
        collapsed={collapsed}
        onToggle={onToggle}
      />
      {!collapsed && (
        <>
          {/* Lupa */}
          <div className="relative mb-3">
            <span
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "#6b7899" }}
            >
              🔍
            </span>
            <input
              value={busq}
              onChange={(e) => setBusq(e.target.value)}
              placeholder="Buscar patente..."
              className="w-full rounded-lg text-xs outline-none"
              style={{
                background: "#202637",
                border: "1px solid #374060",
                padding: "6px 10px 6px 26px",
                color: "#dde3f0",
                fontFamily: "inherit",
              }}
            />
            {busq && (
              <button
                type="button"
                onClick={() => setBusq("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "#6b7899" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Lista con scroll */}
          <div
            className="flex flex-col gap-2 overflow-y-auto pr-1"
            style={{ maxHeight: "420px" }}
          >
            {filtered.map((o) => {
              const cobrado = cobradoBadge(o);
              const borderLeft = esFinalizado
                ? cobrado
                  ? "#34d399"
                  : "#fbbf24"
                : cobrado
                  ? "rgba(52,211,153,0.3)"
                  : "#2e3650";

              return (
                <div
                  key={o.id}
                  className="rounded-xl p-4 border transition-all hover:-translate-y-0.5"
                  style={{
                    background: "#202637",
                    borderColor:
                      cobrado && !esFinalizado
                        ? "rgba(52,211,153,0.3)"
                        : "#2e3650",
                    borderLeftColor: esFinalizado ? borderLeft : undefined,
                    borderLeftWidth: esFinalizado ? "3px" : undefined,
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="font-mono text-xs font-bold px-2.5 py-1 rounded"
                      style={{
                        background: "#2a3145",
                        color: "#a8b4cc",
                        letterSpacing: "1.5px",
                      }}
                    >
                      {o.vehiculoData?.patente}
                    </span>
                    <div className="flex items-center gap-1">
                      {cobrado && !esFinalizado && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(52,211,153,0.08)",
                            color: "#34d399",
                            border: "1px solid rgba(52,211,153,0.2)",
                          }}
                        >
                          ✓ Cobrado
                        </span>
                      )}
                      {!esFinalizado && (
                        <form action={eliminarOrdenAction}>
                          <input type="hidden" name="id" value={o.id} />
                          <DeleteButton
                            mensaje="¿Eliminar esta orden?"
                            className="text-xs px-1.5 py-1 rounded"
                            style={{ color: "#6b7899" }}
                          >
                            ✕
                          </DeleteButton>
                        </form>
                      )}
                    </div>
                  </div>
                  <p
                    className="font-bold text-sm mb-1"
                    style={{ color: "#dde3f0" }}
                  >
                    {o.vehiculoData?.marca} {o.vehiculoData?.modelo}
                  </p>
                  <p
                    className="text-xs mb-3 leading-relaxed"
                    style={{ color: "#6b7899" }}
                  >
                    {o.descripcion}
                  </p>
                  <div
                    className="flex justify-between items-center pt-2.5 border-t"
                    style={{ borderColor: "#2e3650" }}
                  >
                    <span
                      className="font-extrabold text-base"
                      style={{
                        color: esFinalizado && cobrado ? "#34d399" : "#dde3f0",
                      }}
                    >
                      $
                      {new Intl.NumberFormat("es-AR").format(
                        o.monto_cobrado ?? o.costo,
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/ordenes/${o.id}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-md"
                        style={{
                          background: "rgba(107,120,153,0.12)",
                          color: "#a8b4cc",
                          border: "1px solid rgba(107,120,153,0.2)",
                          textDecoration: "none",
                        }}
                      >
                        Ver más
                      </Link>
                      {!esFinalizado && (
                        <form action={moverEstadoAction}>
                          <input type="hidden" name="id" value={o.id} />
                          <input
                            type="hidden"
                            name="estado"
                            value={o.estadoLimpio}
                          />
                          <button
                            type="submit"
                            className="text-xs font-bold px-3 py-1.5 rounded-md uppercase"
                            style={{
                              background:
                                label === "En Proceso"
                                  ? "rgba(251,191,36,0.1)"
                                  : "rgba(79,142,247,0.12)",
                              color:
                                label === "En Proceso" ? "#fbbf24" : "#4f8ef7",
                              border: `1px solid ${label === "En Proceso" ? "rgba(251,191,36,0.22)" : "rgba(79,142,247,0.22)"}`,
                              fontFamily: "inherit",
                            }}
                          >
                            Siguiente →
                          </button>
                        </form>
                      )}
                      {esFinalizado && !cobrado && (
                        <Link
                          href={`/ordenes/${o.id}`}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded flex items-center gap-1"
                          style={{
                            background: "rgba(251,191,36,0.08)",
                            color: "#fbbf24",
                            border: "1px solid rgba(251,191,36,0.2)",
                            textDecoration: "none",
                          }}
                        >
                          $ Cobrar
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p
                className="text-center text-xs py-6"
                style={{ color: "#6b7899" }}
              >
                {busq ? `Sin resultados para "${busq}"` : "Sin órdenes"}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function KanbanColapsable({
  pendientes,
  enCurso,
  historial,
  moverEstadoAction,
  eliminarOrdenAction,
}: Props) {
  const [col, setCol] = useState({
    pendiente: true,
    enCurso: true,
    finalizado: true,
    cobrado: true,
  });
  const toggle = (k: keyof typeof col) => setCol((p) => ({ ...p, [k]: !p[k] }));
  const [modalOrden, setModalOrden] = useState<Orden | null>(null);
  const [busqCobrado, setBusqCobrado] = useState("");

  const cobradoBadge = (o: Orden) => o.pagado || o.pagado_por_cliente;
  const finalizadosSinCobrar = historial.filter((o) => !cobradoBadge(o));
  const finalizadosCobrados = historial.filter((o) => cobradoBadge(o));

  const filtradosCobrados = finalizadosCobrados.filter(
    (o) =>
      !busqCobrado ||
      o.vehiculoData?.patente
        ?.toLowerCase()
        .includes(busqCobrado.toLowerCase()),
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <KanbanCol
          label="Pendiente"
          count={pendientes.length}
          color="#6b7899"
          bg="rgba(107,120,153,0.12)"
          collapsed={!col.pendiente}
          onToggle={() => toggle("pendiente")}
          items={pendientes}
          moverEstadoAction={moverEstadoAction}
          eliminarOrdenAction={eliminarOrdenAction}
        />
        <KanbanCol
          label="En Proceso"
          count={enCurso.length}
          color="#fbbf24"
          bg="rgba(251,191,36,0.08)"
          border="rgba(251,191,36,0.2)"
          collapsed={!col.enCurso}
          onToggle={() => toggle("enCurso")}
          items={enCurso}
          moverEstadoAction={moverEstadoAction}
          eliminarOrdenAction={eliminarOrdenAction}
        />
        <KanbanCol
          label="Completado"
          count={finalizadosSinCobrar.length}
          color="#34d399"
          bg="rgba(52,211,153,0.08)"
          border="rgba(52,211,153,0.2)"
          collapsed={!col.finalizado}
          onToggle={() => toggle("finalizado")}
          items={finalizadosSinCobrar}
          moverEstadoAction={moverEstadoAction}
          eliminarOrdenAction={eliminarOrdenAction}
        />
      </div>

      {/* HISTORIAL COBRADO */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "#252b3b", borderColor: "#2e3650" }}
      >
        <ColHeader
          label="Historial Cobrado"
          count={finalizadosCobrados.length}
          color="#a78bfa"
          bg="rgba(167,139,250,0.08)"
          border="rgba(167,139,250,0.2)"
          collapsed={!col.cobrado}
          onToggle={() => toggle("cobrado")}
        />
        {col.cobrado && (
          <>
            {/* Lupa historial cobrado */}
            <div className="relative mb-3 max-w-xs">
              <span
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "#6b7899" }}
              >
                🔍
              </span>
              <input
                value={busqCobrado}
                onChange={(e) => setBusqCobrado(e.target.value)}
                placeholder="Buscar patente..."
                className="w-full rounded-lg text-xs outline-none"
                style={{
                  background: "#202637",
                  border: "1px solid #374060",
                  padding: "6px 10px 6px 26px",
                  color: "#dde3f0",
                  fontFamily: "inherit",
                }}
              />
              {busqCobrado && (
                <button
                  type="button"
                  onClick={() => setBusqCobrado("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "#6b7899" }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Grid con scroll */}
            <div
              className="overflow-y-auto pr-1"
              style={{ maxHeight: "340px" }}
            >
              {filtradosCobrados.length === 0 ? (
                <p
                  className="text-center text-xs py-6"
                  style={{ color: "#6b7899" }}
                >
                  {busqCobrado
                    ? `Sin resultados para "${busqCobrado}"`
                    : "Aún no hay órdenes cobradas"}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {filtradosCobrados.map((o) => {
                    const monto = o.monto_cobrado ?? o.costo;
                    return (
                      <div
                        key={o.id}
                        className="flex items-center justify-between p-3 rounded-xl border transition-all hover:-translate-y-0.5"
                        style={{
                          background: "#202637",
                          borderColor: "#2e3650",
                          borderLeftColor: "#34d399",
                          borderLeftWidth: "3px",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span
                              className="font-mono text-xs font-bold"
                              style={{
                                color: "#a8b4cc",
                                letterSpacing: "1.5px",
                              }}
                            >
                              {o.vehiculoData?.patente}
                            </span>
                            {o.metodo_pago && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  background: "rgba(52,211,153,0.06)",
                                  color: "#34d399",
                                }}
                              >
                                {o.metodo_pago}
                              </span>
                            )}
                          </div>
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color: "#dde3f0" }}
                          >
                            {o.vehiculoData?.marca} {o.vehiculoData?.modelo}
                          </p>
                          <p
                            className="text-xs truncate mt-0.5"
                            style={{ color: "#6b7899" }}
                          >
                            {o.descripcion}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
                          <span
                            className="font-extrabold text-sm"
                            style={{ color: "#34d399" }}
                          >
                            ${new Intl.NumberFormat("es-AR").format(monto ?? 0)}
                          </span>
                          <button
                            onClick={() => setModalOrden(o)}
                            className="text-xs font-bold px-2 py-1 rounded-lg"
                            style={{
                              background: "rgba(167,139,250,0.08)",
                              color: "#a78bfa",
                              border: "1px solid rgba(167,139,250,0.2)",
                              fontFamily: "inherit",
                            }}
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {modalOrden && (
        <DetalleModal orden={modalOrden} onClose={() => setModalOrden(null)} />
      )}
    </>
  );
}
