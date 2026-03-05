"use client";

import { useState, useRef } from "react";
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
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const listo = !!fecha && !!hora;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!listo || loading) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("fecha_turno", fecha);
    fd.set("hora_turno", hora);
    await agregarOrdenAction(fd);
    // Reset completo
    formRef.current?.reset();
    setFecha("");
    setHora("");
    setLoading(false);
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  };

  return (
    <div
      className="p-5 rounded-xl border mb-5"
      style={{ background: "#252b3b", borderColor: "#2e3650" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-xs font-bold uppercase"
          style={{ color: "#6b7899", letterSpacing: "1.5px" }}
        >
          Ingresar Nuevo Vehículo a Reparación
        </p>
        {ok && (
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{
              background: "rgba(52,211,153,0.1)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            ✓ Ingresado correctamente
          </span>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <input type="hidden" name="fecha_turno" value={fecha} />
        <input type="hidden" name="hora_turno" value={hora} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* COLUMNA IZQUIERDA */}
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

            {/* Estado del turno */}
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
                  className="text-xs px-2 py-1 rounded-lg btn-animate btn-animate-red"
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
              disabled={!listo || loading}
              className="w-full rounded-lg text-sm font-bold text-white py-3 btn-animate"
              style={{
                background:
                  listo && !loading
                    ? "linear-gradient(135deg, #4f8ef7, #3b7de8)"
                    : "#374060",
                fontFamily: "inherit",
                boxShadow: listo ? "0 4px 12px rgba(79,142,247,0.25)" : "none",
                transition: "all 0.2s",
                cursor: listo && !loading ? "pointer" : "not-allowed",
              }}
            >
              {loading
                ? "Ingresando..."
                : listo
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
              key={`${fecha}-${hora}-${ok}`}
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
