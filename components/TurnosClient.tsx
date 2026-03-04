"use client";

import { useState } from "react";
import CalendarioDisponibilidad from "@/components/CalendarioDisponibilidad";

type Turno = {
  id: number;
  fecha: string;
  hora: string;
  descripcion: string | null;
  estado: string;
  estado_gestion: string;
  orden_creada: boolean;
  clientes: { nombre: string; telefono: string } | null;
  vehiculos: {
    id: number;
    patente: string;
    marca: string;
    modelo: string;
  } | null;
  servicios: { id: number; nombre: string } | null;
};

type Props = {
  clientes: { id: number; nombre: string }[];
  vehiculos: {
    id: number;
    patente: string;
    marca: string;
    modelo: string;
    cliente_id: number;
  }[];
  servicios: { id: number; nombre: string }[];
  pendientes: Turno[];
  confirmados: Turno[];
  denegados: Turno[];
  hoyCount: number;
  manCount: number;
  compCount: number;
  servicioFiltro?: string;
  qConfirmados: string;
  qDenegados: string;
  agregarTurnoAction: (fd: FormData) => Promise<void>;
  denegarTurnoAction: (fd: FormData) => Promise<void>;
  eliminarTurnoAction: (fd: FormData) => Promise<void>;
};

const selectStyle: React.CSSProperties = {
  background: "#202637",
  border: "1px solid #374060",
  padding: "9px 13px",
  color: "#dde3f0",
  fontFamily: "inherit",
  borderRadius: "8px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};

function TurnoCard({
  t,
  hoy,
  mananaS,
  onConfirmar,
  onDenegar,
  loadingId,
}: {
  t: Turno;
  hoy: string;
  mananaS: string;
  onConfirmar: (id: number) => void;
  onDenegar: (id: number) => void;
  loadingId: number | null;
}) {
  const esHoy = t.fecha === hoy,
    esManana = t.fecha === mananaS,
    isLoading = loadingId === t.id;
  return (
    <div
      className="p-4 rounded-xl border flex-shrink-0"
      style={{
        background: "#202637",
        borderColor: esHoy ? "rgba(79,142,247,0.3)" : "#2e3650",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {esHoy && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(79,142,247,0.12)",
                  color: "#4f8ef7",
                }}
              >
                HOY
              </span>
            )}
            {esManana && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(192,132,252,0.12)",
                  color: "#c084fc",
                }}
              >
                MAÑANA
              </span>
            )}
            <span className="text-xs font-bold" style={{ color: "#a8b4cc" }}>
              {new Date(t.fecha + "T00:00:00").toLocaleDateString("es-AR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
            </span>
            <span className="text-xs font-bold" style={{ color: "#4f8ef7" }}>
              {t.hora?.slice(0, 5)}
            </span>
          </div>
          <p className="text-sm font-bold" style={{ color: "#dde3f0" }}>
            {t.clientes?.nombre ?? "Sin cliente"}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {t.servicios?.nombre && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(79,142,247,0.06)",
                  color: "#4f8ef7",
                  border: "1px solid rgba(79,142,247,0.15)",
                }}
              >
                {t.servicios.nombre}
              </span>
            )}
            {t.vehiculos?.patente && (
              <span className="font-mono text-xs" style={{ color: "#6b7899" }}>
                {t.vehiculos.patente}
              </span>
            )}
            {t.descripcion && (
              <span className="text-xs" style={{ color: "#6b7899" }}>
                · {t.descripcion}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onConfirmar(t.id)}
            disabled={isLoading}
            className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
            style={{
              background: "rgba(52,211,153,0.08)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.2)",
              fontFamily: "inherit",
            }}
          >
            {isLoading ? "..." : "✓ Confirmar"}
          </button>
          <button
            onClick={() => onDenegar(t.id)}
            disabled={isLoading}
            className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
            style={{
              background: "rgba(248,113,113,0.08)",
              color: "#f87171",
              border: "1px solid rgba(248,113,113,0.2)",
              fontFamily: "inherit",
            }}
          >
            ✕ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function HistorialList({
  items,
  titulo,
  color,
  busqueda,
  onBusqueda,
}: {
  items: Turno[];
  titulo: string;
  color: string;
  busqueda: string;
  onBusqueda: (v: string) => void;
}) {
  const filtrados = items.filter(
    (t) =>
      !busqueda ||
      t.vehiculos?.patente?.toLowerCase().includes(busqueda.toLowerCase()),
  );
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "#252b3b", borderColor: "#2e3650" }}
    >
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: color }}
          />
          <p
            className="text-xs font-bold uppercase"
            style={{ color: "#6b7899", letterSpacing: "1.5px" }}
          >
            {titulo}
          </p>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "#2a3145", color: "#6b7899" }}
          >
            {items.length}
          </span>
        </div>
        <div className="relative">
          <span
            className="absolute left-2 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "#6b7899" }}
          >
            🔍
          </span>
          <input
            value={busqueda}
            onChange={(e) => onBusqueda(e.target.value)}
            placeholder="Buscar patente..."
            className="rounded-lg text-xs outline-none"
            style={{
              background: "#202637",
              border: "1px solid #374060",
              padding: "6px 24px 6px 22px",
              color: "#dde3f0",
              fontFamily: "inherit",
              width: "150px",
            }}
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusqueda("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "#6b7899" }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {/* Scroll con máx 5 items visibles (~5 * 72px) */}
      <div
        className="flex flex-col gap-2 overflow-y-auto pr-1"
        style={{ maxHeight: "360px" }}
      >
        {filtrados.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: "#6b7899" }}>
            {busqueda
              ? `Sin resultados para "${busqueda}"`
              : "No hay turnos en esta lista"}
          </p>
        ) : (
          filtrados.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-3 rounded-xl border"
              style={{ background: "#202637", borderColor: "#2e3650" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs" style={{ color: "#6b7899" }}>
                    {new Date(t.fecha + "T00:00:00").toLocaleDateString(
                      "es-AR",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  </span>
                  <span className="text-xs" style={{ color: "#4f8ef7" }}>
                    {t.hora?.slice(0, 5)}
                  </span>
                  {t.servicios?.nombre && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(79,142,247,0.06)",
                        color: "#4f8ef7",
                      }}
                    >
                      {t.servicios.nombre}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#a8b4cc" }}
                >
                  {t.clientes?.nombre ?? "Sin cliente"}
                  {t.vehiculos?.patente && (
                    <span
                      className="font-mono ml-2"
                      style={{ color: "#6b7899" }}
                    >
                      {t.vehiculos.patente}
                    </span>
                  )}
                </p>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full ml-3 flex-shrink-0"
                style={{
                  background:
                    color === "#34d399"
                      ? "rgba(52,211,153,0.08)"
                      : "rgba(248,113,113,0.08)",
                  color,
                }}
              >
                {titulo === "Turnos Confirmados" ? "Confirmado" : "Denegado"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function TurnosClient({
  clientes,
  vehiculos,
  servicios,
  pendientes,
  confirmados,
  denegados,
  hoyCount,
  manCount,
  compCount,
  servicioFiltro,
  qConfirmados,
  qDenegados,
  agregarTurnoAction,
  denegarTurnoAction,
  eliminarTurnoAction,
}: Props) {
  const hoy = new Date().toISOString().split("T")[0];
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const mananaS = manana.toISOString().split("T")[0];

  const [busqConf, setBusqConf] = useState(qConfirmados);
  const [busqDen, setBusqDen] = useState(qDenegados);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [localPend, setLocalPend] = useState(pendientes);
  const [localConf, setLocalConf] = useState(confirmados);
  const [localDen, setLocalDen] = useState(denegados);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const handleConfirmar = async (id: number) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/turnos/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turno_id: id }),
      });
      if (res.ok) {
        const t = localPend.find((x) => x.id === id);
        if (t) {
          setLocalPend((p) => p.filter((x) => x.id !== id));
          setLocalConf((c) => [
            { ...t, estado: "Confirmado", estado_gestion: "confirmado" },
            ...c,
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingId(null);
  };

  const handleDenegar = async (id: number) => {
    setLoadingId(id);
    const fd = new FormData();
    fd.set("id", String(id));
    await denegarTurnoAction(fd);
    const t = localPend.find((x) => x.id === id);
    if (t) {
      setLocalPend((p) => p.filter((x) => x.id !== id));
      setLocalDen((d) => [
        { ...t, estado: "Cancelado", estado_gestion: "denegado" },
        ...d,
      ]);
    }
    setLoadingId(null);
  };

  const listo = !!fecha && !!hora;
  const fechaMinS = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

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
        <div
          className="flex justify-between items-center mb-6 pb-5 border-b"
          style={{ borderColor: "#2e3650" }}
        >
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: "#ffffff", letterSpacing: "-0.3px" }}
            >
              Gestión de Turnos
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#6b7899" }}>
              Agenda de citas y servicios del taller
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: "Hoy",
              value: hoyCount,
              color: "#4f8ef7",
              bg: "rgba(79,142,247,0.08)",
            },
            {
              label: "Mañana",
              value: manCount,
              color: "#c084fc",
              bg: "rgba(192,132,252,0.08)",
            },
            {
              label: "Por gestionar",
              value: localPend.length,
              color: "#fbbf24",
              bg: "rgba(251,191,36,0.08)",
            },
            {
              label: "Confirmados",
              value: localConf.length,
              color: "#34d399",
              bg: "rgba(52,211,153,0.08)",
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
              <p className="text-2xl font-extrabold" style={{ color }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <a
            href="/turnos"
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{
              background: !servicioFiltro ? "#4f8ef7" : "#252b3b",
              color: !servicioFiltro ? "#fff" : "#6b7899",
              border: "1px solid #374060",
            }}
          >
            Todos
          </a>
          {servicios.map((s) => (
            <a
              key={s.id}
              href={`/turnos?servicio=${s.id}`}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                background:
                  servicioFiltro === String(s.id) ? "#4f8ef7" : "#252b3b",
                color: servicioFiltro === String(s.id) ? "#fff" : "#6b7899",
                border: "1px solid #374060",
              }}
            >
              {s.nombre}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* FORM CON CALENDARIO */}
          <div
            className="rounded-xl border p-5 h-fit"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <p
              className="text-xs font-bold uppercase mb-4"
              style={{ color: "#6b7899", letterSpacing: "1.5px" }}
            >
              Nuevo Turno
            </p>
            <form action={agregarTurnoAction} className="flex flex-col gap-3">
              <input type="hidden" name="fecha" value={fecha} />
              <input type="hidden" name="hora" value={hora} />

              <select name="cliente_id" style={selectStyle}>
                <option value="">Cliente (opcional)</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <select name="vehiculo_id" style={selectStyle}>
                <option value="">Vehículo (opcional)</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.patente} — {v.marca} {v.modelo}
                  </option>
                ))}
              </select>
              <select name="servicio_id" required style={selectStyle}>
                <option value="">Tipo de servicio *</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-bold uppercase"
                  style={{ color: "#6b7899", letterSpacing: "1px" }}
                >
                  Fecha y hora *
                </label>
                <CalendarioDisponibilidad
                  onSelect={(f, h) => {
                    setFecha(f);
                    setHora(h);
                  }}
                  fechaSeleccionada={fecha}
                  horaSeleccionada={hora}
                />
                {listo && (
                  <div
                    className="flex items-center justify-between p-2.5 rounded-lg"
                    style={{
                      background: "rgba(79,142,247,0.06)",
                      border: "1px solid rgba(79,142,247,0.2)",
                    }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#4f8ef7" }}
                    >
                      ✓{" "}
                      {new Date(fecha + "T00:00:00").toLocaleDateString(
                        "es-AR",
                        { day: "2-digit", month: "short" },
                      )}{" "}
                      — {hora}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFecha("");
                        setHora("");
                      }}
                      className="text-xs ml-2"
                      style={{
                        color: "#6b7899",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <textarea
                name="descripcion"
                rows={2}
                placeholder="Notas adicionales..."
                style={{ ...selectStyle, resize: "vertical" as const }}
              />

              <button
                type="submit"
                disabled={!listo}
                className="w-full rounded-lg text-sm font-bold text-white py-2.5 transition-all disabled:opacity-40"
                style={{
                  background: listo ? "#4f8ef7" : "#374060",
                  fontFamily: "inherit",
                }}
              >
                {listo ? "+ Agendar Turno" : "Seleccioná fecha y hora"}
              </button>
            </form>
          </div>

          <div className="md:col-span-2 flex flex-col gap-4">
            {/* AGENDA PRÓXIMA con scroll */}
            <div
              className="rounded-xl border p-5"
              style={{ background: "#252b3b", borderColor: "#2e3650" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <p
                  className="text-xs font-bold uppercase"
                  style={{ color: "#6b7899", letterSpacing: "1.5px" }}
                >
                  Agenda Próxima
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: "#2a3145", color: "#6b7899" }}
                >
                  {localPend.length}
                </span>
                <span className="text-xs ml-1" style={{ color: "#4a5068" }}>
                  — esperando gestión
                </span>
              </div>
              <div
                className="flex flex-col gap-2 overflow-y-auto pr-1"
                style={{ maxHeight: "380px" }}
              >
                {localPend.length === 0 ? (
                  <p
                    className="text-xs text-center py-6"
                    style={{ color: "#6b7899" }}
                  >
                    No hay turnos pendientes de gestión.
                  </p>
                ) : (
                  localPend.map((t) => (
                    <TurnoCard
                      key={t.id}
                      t={t}
                      hoy={hoy}
                      mananaS={mananaS}
                      onConfirmar={handleConfirmar}
                      onDenegar={handleDenegar}
                      loadingId={loadingId}
                    />
                  ))
                )}
              </div>
            </div>

            <HistorialList
              items={localConf}
              titulo="Turnos Confirmados"
              color="#34d399"
              busqueda={busqConf}
              onBusqueda={setBusqConf}
            />
            <HistorialList
              items={localDen}
              titulo="Turnos Denegados"
              color="#f87171"
              busqueda={busqDen}
              onBusqueda={setBusqDen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
