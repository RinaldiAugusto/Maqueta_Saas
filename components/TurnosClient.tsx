"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CalendarioDisponibilidad from "@/components/CalendarioDisponibilidad";

type Turno = {
  id: number;
  fecha: string;
  hora: string;
  descripcion: string | null;
  estado: string;
  estado_gestion: string;
  orden_creada: boolean;
  origen?: string | null;
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
  todosConfirmados: Turno[];
  todosDenegados: Turno[];
  hoyCount: number;
  manCount: number;
  compCount: number;
  servicioFiltro?: string;
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

const inputDateStyle: React.CSSProperties = {
  background: "#202637",
  border: "1px solid #374060",
  padding: "7px 10px",
  color: "#dde3f0",
  fontFamily: "inherit",
  borderRadius: "8px",
  fontSize: "12px",
  outline: "none",
  colorScheme: "dark",
};

function origenBadge(origen?: string | null) {
  if (origen === "portal" || origen === "web") {
    return (
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{
          background: "rgba(192,132,252,0.1)",
          color: "#c084fc",
          border: "1px solid rgba(192,132,252,0.2)",
        }}
      >
        🌐 Web
      </span>
    );
  }
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{
        background: "rgba(107,120,153,0.1)",
        color: "#6b7899",
        border: "1px solid rgba(107,120,153,0.2)",
      }}
    >
      ✏️ Manual
    </span>
  );
}

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
      className="p-4 rounded-xl border"
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
            {origenBadge(t.origen)}
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
            className="btn-animate btn-green text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
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
            className="btn-animate btn-red text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
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

function HistoricoBox({
  todosConfirmados,
  todosDenegados,
}: {
  todosConfirmados: Turno[];
  todosDenegados: Turno[];
}) {
  const [tab, setTab] = useState<"confirmados" | "denegados">("confirmados");
  const [busq, setBusq] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const items = tab === "confirmados" ? todosConfirmados : todosDenegados;

  const filtrados = items.filter((t) => {
    if (
      busq &&
      !t.clientes?.nombre?.toLowerCase().includes(busq.toLowerCase()) &&
      !t.vehiculos?.patente?.toLowerCase().includes(busq.toLowerCase())
    )
      return false;
    if (desde && t.fecha < desde) return false;
    if (hasta && t.fecha > hasta) return false;
    return true;
  });

  // Agrupar por mes
  const porMes: Record<string, Turno[]> = {};
  filtrados.forEach((t) => {
    const mes = t.fecha.slice(0, 7);
    if (!porMes[mes]) porMes[mes] = [];
    porMes[mes].push(t);
  });
  const meses = Object.keys(porMes).sort((a, b) => b.localeCompare(a));

  const limpiarFiltros = () => {
    setDesde("");
    setHasta("");
    setBusq("");
  };
  const hayFiltros = busq || desde || hasta;

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "#252b3b", borderColor: "#2e3650" }}
    >
      {/* Header con tabs */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <p
            className="text-xs font-bold uppercase"
            style={{ color: "#6b7899", letterSpacing: "1.5px" }}
          >
            Histórico de Turnos
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#4a5068" }}>
            {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
            {hayFiltros ? " (filtrado)" : " en total"}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 p-1 rounded-lg"
          style={{ background: "#202637", border: "1px solid #2e3650" }}
        >
          <button
            onClick={() => setTab("confirmados")}
            className="btn-animate btn-ghost text-xs font-bold px-3 py-1.5 rounded-md"
            style={{
              background:
                tab === "confirmados" ? "rgba(52,211,153,0.12)" : "transparent",
              color: tab === "confirmados" ? "#34d399" : "#6b7899",
              fontFamily: "inherit",
            }}
          >
            ✓ Confirmados ({todosConfirmados.length})
          </button>
          <button
            onClick={() => setTab("denegados")}
            className="btn-animate btn-ghost text-xs font-bold px-3 py-1.5 rounded-md"
            style={{
              background:
                tab === "denegados" ? "rgba(248,113,113,0.12)" : "transparent",
              color: tab === "denegados" ? "#f87171" : "#6b7899",
              fontFamily: "inherit",
            }}
          >
            ✕ Denegados ({todosDenegados.length})
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[160px]">
          <span
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "#6b7899" }}
          >
            🔍
          </span>
          <input
            value={busq}
            onChange={(e) => setBusq(e.target.value)}
            placeholder="Cliente o patente..."
            className="w-full rounded-lg text-xs outline-none"
            style={{
              background: "#202637",
              border: "1px solid #374060",
              padding: "7px 10px 7px 26px",
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

        {/* Desde */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-semibold flex-shrink-0"
            style={{ color: "#6b7899" }}
          >
            Desde
          </span>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            style={inputDateStyle}
          />
        </div>

        {/* Hasta */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-semibold flex-shrink-0"
            style={{ color: "#6b7899" }}
          >
            Hasta
          </span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            style={inputDateStyle}
          />
        </div>

        {/* Limpiar */}
        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
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

      {/* Lista agrupada por mes */}
      <div
        className="scroll-box overflow-y-auto pr-1"
        style={{ maxHeight: "480px" }}
      >
        {meses.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "#6b7899" }}>
            {hayFiltros
              ? "Sin resultados para los filtros aplicados."
              : "No hay registros todavía."}
          </p>
        ) : (
          meses.map((mes) => {
            const [anio, m] = mes.split("-");
            const nombres = [
              "Enero",
              "Febrero",
              "Marzo",
              "Abril",
              "Mayo",
              "Junio",
              "Julio",
              "Agosto",
              "Septiembre",
              "Octubre",
              "Noviembre",
              "Diciembre",
            ];
            const mesLabel = `${nombres[parseInt(m) - 1]} ${anio}`;
            return (
              <div key={mes} className="mb-4">
                <p
                  className="text-xs font-bold uppercase mb-2 sticky top-0 py-1"
                  style={{
                    color: "#4f8ef7",
                    letterSpacing: "1px",
                    background: "#252b3b",
                  }}
                >
                  {mesLabel} — {porMes[mes].length} turno
                  {porMes[mes].length !== 1 ? "s" : ""}
                </p>
                <div className="flex flex-col gap-1.5">
                  {porMes[mes].map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl border transition-all hover:-translate-y-0.5"
                      style={{
                        background: "#202637",
                        borderColor: "#2e3650",
                        borderLeftColor:
                          tab === "confirmados" ? "#34d399" : "#f87171",
                        borderLeftWidth: "3px",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span
                            className="text-xs font-bold"
                            style={{ color: "#a8b4cc" }}
                          >
                            {new Date(t.fecha + "T00:00:00").toLocaleDateString(
                              "es-AR",
                              { day: "2-digit", month: "short" },
                            )}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "#4f8ef7" }}
                          >
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
                          className="text-xs font-semibold truncate"
                          style={{ color: "#dde3f0" }}
                        >
                          {t.clientes?.nombre ?? "Sin cliente"}
                          {t.vehiculos?.patente && (
                            <span
                              className="font-mono ml-2 text-xs"
                              style={{ color: "#6b7899" }}
                            >
                              {t.vehiculos.patente}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {origenBadge(t.origen)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
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
  todosConfirmados,
  todosDenegados,
  hoyCount,
  manCount,
  compCount,
  servicioFiltro,
  agregarTurnoAction,
  denegarTurnoAction,
  eliminarTurnoAction,
}: Props) {
  const hoy = new Date().toISOString().split("T")[0];
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const mananaS = manana.toISOString().split("T")[0];

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [localPend, setLocalPend] = useState(pendientes);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);

  const handleConfirmar = async (id: number) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/turnos/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turno_id: id }),
      });
      if (res.ok) setLocalPend((p) => p.filter((x) => x.id !== id));
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
    setLocalPend((p) => p.filter((x) => x.id !== id));
    setLoadingId(null);
  };

  const listo = !!fecha && !!hora;

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

        {/* MÉTRICAS */}
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
              value: compCount,
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

        {/* FILTROS SERVICIO */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <a
            href="/turnos"
            className="btn-animate btn-ghost px-3 py-1.5 rounded-lg text-xs font-bold"
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
              className="btn-animate btn-ghost px-3 py-1.5 rounded-lg text-xs font-bold"
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

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* ── COLUMNA IZQUIERDA (2/5) ── */}
          <div className="xl:col-span-2 flex flex-col gap-5">
            {/* AGENDA PRÓXIMA — arriba */}
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
                className="scroll-box flex flex-col gap-2 overflow-y-auto pr-1"
                style={{ maxHeight: "380px" }}
              >
                {localPend.length === 0 ? (
                  <p
                    className="text-xs text-center py-6"
                    style={{ color: "#6b7899" }}
                  >
                    No hay turnos pendientes.
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

            {/* NUEVO TURNO — colapsable abajo */}
            <div
              className="rounded-xl border"
              style={{ background: "#252b3b", borderColor: "#2e3650" }}
            >
              <button
                onClick={() => setFormAbierto(!formAbierto)}
                className="w-full flex items-center justify-between p-5 btn-animate btn-ghost"
                style={{ fontFamily: "inherit" }}
              >
                <p
                  className="text-xs font-bold uppercase"
                  style={{ color: "#6b7899", letterSpacing: "1.5px" }}
                >
                  + Nuevo Turno
                </p>
                <span
                  className="text-xs transition-transform duration-200"
                  style={{
                    color: "#6b7899",
                    transform: formAbierto ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▾
                </span>
              </button>
              {formAbierto && (
                <div
                  className="px-5 pb-5 border-t"
                  style={{ borderColor: "#2e3650" }}
                >
                  <form
                    action={agregarTurnoAction}
                    className="flex flex-col gap-3 mt-4"
                  >
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
                            className="text-xs ml-2 btn-animate btn-ghost"
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
                      className="btn-animate btn-blue w-full rounded-lg text-sm font-bold text-white py-2.5 disabled:opacity-40"
                      style={{
                        background: listo ? "#4f8ef7" : "#374060",
                        fontFamily: "inherit",
                      }}
                    >
                      {listo ? "+ Agendar Turno" : "Seleccioná fecha y hora"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* ── COLUMNA DERECHA (3/5) — solo histórico ── */}
          <div className="xl:col-span-3">
            <HistoricoBox
              todosConfirmados={todosConfirmados}
              todosDenegados={todosDenegados}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
