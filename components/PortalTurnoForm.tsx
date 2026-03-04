"use client";

import { useState } from "react";
import CalendarioDisponibilidad from "@/components/CalendarioDisponibilidad";

type Servicio = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_base?: number;
  duracion_min?: number;
};
type Vehiculo = { id: number; patente: string; marca: string; modelo: string };
type TurnoExistente = {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  descripcion: string | null;
  servicios: { nombre: string } | null;
};

type Props = {
  servicios: Servicio[];
  vehiculos: Vehiculo[];
  turnosExistentes: TurnoExistente[];
  solicitarTurnoAction: (fd: FormData) => Promise<void>;
};

export default function PortalTurnoForm({
  servicios,
  vehiculos,
  turnosExistentes,
  solicitarTurnoAction,
}: Props) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const inputStyle: React.CSSProperties = {
    background: "#202637",
    border: "1px solid #374060",
    padding: "10px 14px",
    color: "#dde3f0",
    fontFamily: "inherit",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
      {/* FORMULARIO */}
      <div
        className="md:col-span-3 rounded-xl border p-6"
        style={{ background: "#252b3b", borderColor: "#2e3650" }}
      >
        <form action={solicitarTurnoAction} className="flex flex-col gap-5">
          {/* Campos ocultos para fecha y hora */}
          <input type="hidden" name="fecha" value={fecha} />
          <input type="hidden" name="hora" value={hora} />

          {/* Servicio */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold uppercase"
              style={{ color: "#6b7899", letterSpacing: "1px" }}
            >
              Tipo de servicio *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {servicios.map((s) => (
                <label
                  key={s.id}
                  className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                  style={{ background: "#202637", borderColor: "#374060" }}
                >
                  <input
                    type="radio"
                    name="servicio_id"
                    value={s.id}
                    required
                    className="mt-0.5 flex-shrink-0 accent-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#dde3f0" }}
                    >
                      {s.nombre}
                    </p>
                    {s.descripcion && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#6b7899" }}
                      >
                        {s.descripcion}
                      </p>
                    )}
                  </div>
                  {s.precio_base && (
                    <span
                      className="text-xs font-bold flex-shrink-0"
                      style={{ color: "#34d399" }}
                    >
                      ${new Intl.NumberFormat("es-AR").format(s.precio_base)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Vehículo */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold uppercase"
              style={{ color: "#6b7899", letterSpacing: "1px" }}
            >
              Vehículo *
            </label>
            {vehiculos.length > 0 ? (
              <select name="vehiculo_id" required style={inputStyle}>
                <option value="">Seleccioná tu vehículo...</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.patente} — {v.marca} {v.modelo}
                  </option>
                ))}
              </select>
            ) : (
              <div
                className="p-3 rounded-lg text-xs"
                style={{
                  background: "#202637",
                  border: "1px solid #374060",
                  color: "#6b7899",
                }}
              >
                No tenés vehículos registrados. Acercate al taller para
                registrarlo.
              </div>
            )}
          </div>

          {/* Calendario de disponibilidad */}
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
            {fecha && hora && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg mt-1"
                style={{
                  background: "rgba(79,142,247,0.06)",
                  border: "1px solid rgba(79,142,247,0.2)",
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: "#4f8ef7" }}
                >
                  ✓ Seleccionado:{" "}
                  {new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}{" "}
                  a las {hora}
                </span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold uppercase"
              style={{ color: "#6b7899", letterSpacing: "1px" }}
            >
              Comentario{" "}
              <span
                style={{
                  color: "#4a5068",
                  fontWeight: 400,
                  textTransform: "none",
                }}
              >
                (opcional)
              </span>
            </label>
            <textarea
              name="descripcion"
              rows={3}
              placeholder="Describí brevemente el problema o consulta..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            disabled={vehiculos.length === 0 || !fecha || !hora}
            className="w-full rounded-lg text-sm font-bold text-white py-3 transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
              fontFamily: "inherit",
              boxShadow: "0 4px 12px rgba(79,142,247,0.25)",
            }}
          >
            Confirmar Solicitud de Turno
          </button>
        </form>
      </div>

      {/* TURNOS PRÓXIMOS */}
      <div className="md:col-span-2 flex flex-col gap-4">
        <div
          className="rounded-xl border p-5"
          style={{ background: "#252b3b", borderColor: "#2e3650" }}
        >
          <p
            className="text-xs font-bold uppercase mb-4"
            style={{ color: "#6b7899", letterSpacing: "1.5px" }}
          >
            Tus Próximos Turnos
          </p>
          {turnosExistentes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {turnosExistentes.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border"
                  style={{ background: "#202637", borderColor: "#2e3650" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#4f8ef7" }}
                    >
                      {new Date(t.fecha + "T00:00:00").toLocaleDateString(
                        "es-AR",
                        { weekday: "short", day: "2-digit", month: "short" },
                      )}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#a8b4cc" }}
                    >
                      {t.hora.slice(0, 5)}
                    </span>
                  </div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "#dde3f0" }}
                  >
                    {(t.servicios as any)?.nombre ??
                      t.descripcion ??
                      "Turno agendado"}
                  </p>
                  <span
                    className="text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        t.estado === "Confirmado"
                          ? "rgba(79,142,247,0.08)"
                          : "rgba(251,191,36,0.08)",
                      color: t.estado === "Confirmado" ? "#4f8ef7" : "#fbbf24",
                    }}
                  >
                    {t.estado}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p
              className="text-xs text-center py-4"
              style={{ color: "#6b7899" }}
            >
              No tenés turnos próximos.
            </p>
          )}
        </div>

        <div
          className="rounded-xl border p-4"
          style={{ background: "#252b3b", borderColor: "#2e3650" }}
        >
          <p className="text-xs font-bold mb-2" style={{ color: "#6b7899" }}>
            ℹ️ A tener en cuenta
          </p>
          <ul className="flex flex-col gap-1.5">
            {[
              "El taller confirmará tu turno a la brevedad",
              "Llegá 10 minutos antes de tu turno",
              "Para cancelar, contactá al taller directamente",
            ].map((item) => (
              <li
                key={item}
                className="text-xs flex items-start gap-1.5"
                style={{ color: "#6b7899" }}
              >
                <span style={{ color: "#4f8ef7", flexShrink: 0 }}>·</span>{" "}
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
