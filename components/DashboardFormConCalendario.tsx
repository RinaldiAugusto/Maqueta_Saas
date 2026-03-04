"use client";

import { useState } from "react";
import CalendarioDisponibilidad from "@/components/CalendarioDisponibilidad";

type Props = {
  vehiculos: { id: number; patente: string; marca: string; modelo: string }[];
  servicios: { id: number; nombre: string }[];
  agregarOrdenAction: (fd: FormData) => Promise<void>;
};

const selectStyle: React.CSSProperties = {
  background: "#202637",
  border: "1px solid #374060",
  padding: "9px 13px",
  color: "#dde3f0",
  fontFamily: "inherit",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  width: "100%",
};

export default function DashboardFormConCalendario({
  vehiculos,
  servicios,
  agregarOrdenAction,
}: Props) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const listo = !!fecha && !!hora;

  return (
    <div
      className="p-5 rounded-xl border mb-5"
      style={{ background: "#252b3b", borderColor: "#2e3650" }}
    >
      <p
        className="text-xs font-bold uppercase mb-4"
        style={{ color: "#6b7899", letterSpacing: "1.5px" }}
      >
        Ingresar Nuevo Vehículo a Reparación
      </p>

      <form action={agregarOrdenAction}>
        <input type="hidden" name="fecha_turno" value={fecha} />
        <input type="hidden" name="hora_turno" value={hora} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* COLUMNA IZQUIERDA — datos del vehículo */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: "#a8b4cc" }}
              >
                Vehículo *
              </label>
              <select name="vehiculo_id" required style={selectStyle}>
                <option value="">Seleccionar...</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.patente} – {v.marca} {v.modelo}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: "#a8b4cc" }}
              >
                Tipo de servicio
              </label>
              <select name="servicio_id" style={selectStyle}>
                <option value="">Sin especificar</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: "#a8b4cc" }}
              >
                Descripción / detalle
              </label>
              <input
                name="descripcion"
                placeholder="Descripción de la falla o servicio..."
                style={selectStyle}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: "#a8b4cc" }}
              >
                Costo estimado
              </label>
              <input
                type="number"
                name="costo"
                placeholder="$ 0"
                style={selectStyle}
              />
            </div>

            {/* Resumen turno seleccionado */}
            {listo ? (
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  background: "rgba(52,211,153,0.06)",
                  border: "1px solid rgba(52,211,153,0.2)",
                }}
              >
                <div>
                  <p className="text-xs font-bold" style={{ color: "#34d399" }}>
                    ✓ Turno seleccionado
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#a8b4cc" }}>
                    {new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    })}{" "}
                    — {hora}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFecha("");
                    setHora("");
                  }}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    color: "#f87171",
                    border: "1px solid rgba(248,113,113,0.2)",
                    fontFamily: "inherit",
                  }}
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{
                  background: "rgba(251,191,36,0.05)",
                  border: "1px solid rgba(251,191,36,0.15)",
                }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#fbbf24" }}
                >
                  ⚠ Seleccioná una fecha y hora en el calendario →
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={!listo}
              className="w-full rounded-lg text-sm font-bold text-white py-3 transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: listo
                  ? "linear-gradient(135deg, #4f8ef7, #3b7de8)"
                  : "#374060",
                fontFamily: "inherit",
                boxShadow: listo ? "0 4px 12px rgba(79,142,247,0.25)" : "none",
              }}
            >
              {listo
                ? "+ Ingresar Vehículo"
                : "Seleccioná fecha y hora para continuar"}
            </button>
          </div>

          {/* COLUMNA DERECHA — calendario */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold"
              style={{ color: "#a8b4cc" }}
            >
              Disponibilidad de turnos *
              <span
                className="ml-1 text-xs font-normal"
                style={{ color: "#6b7899" }}
              >
                (verde = disponible, rojo = lleno)
              </span>
            </label>
            <CalendarioDisponibilidad
              onSelect={(f, h) => {
                setFecha(f);
                setHora(h);
              }}
              fechaSeleccionada={fecha}
              horaSeleccionada={hora}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
