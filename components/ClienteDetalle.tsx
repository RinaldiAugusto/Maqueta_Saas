"use client";

import { useState } from "react";
import DeleteButton from "@/components/DeleteButton";

type Vehiculo = {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  año: string;
};
type Cliente = {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
};

type Props = {
  cliente: Cliente;
  vehiculos: Vehiculo[];
  eliminarAction: (formData: FormData) => Promise<void>;
};

export default function ClienteDetalle({
  cliente,
  vehiculos,
  eliminarAction,
}: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <li
      className="rounded-xl border transition-all"
      style={{
        background: "#202637",
        borderColor: abierto ? "rgba(79,142,247,0.3)" : "#2e3650",
      }}
    >
      {/* Fila principal */}
      <div className="flex justify-between items-center p-4 group">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "rgba(79,142,247,0.12)", color: "#4f8ef7" }}
          >
            {cliente.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p
              className="font-bold text-sm truncate"
              style={{ color: "#dde3f0" }}
            >
              {cliente.nombre}
            </p>
            <p className="text-xs truncate" style={{ color: "#6b7899" }}>
              {cliente.telefono && <span>{cliente.telefono}</span>}
              {cliente.telefono && cliente.email && <span> · </span>}
              {cliente.email && <span>{cliente.email}</span>}
              {!cliente.telefono && !cliente.email && (
                <span>Sin datos de contacto</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {/* Badge vehículos */}
          {vehiculos.length > 0 && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(79,142,247,0.08)",
                color: "#4f8ef7",
                border: "1px solid rgba(79,142,247,0.2)",
              }}
            >
              {vehiculos.length} auto{vehiculos.length !== 1 ? "s" : ""}
            </span>
          )}
          {/* Ver detalles */}
          <button
            onClick={() => setAbierto(!abierto)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: abierto
                ? "rgba(79,142,247,0.15)"
                : "rgba(79,142,247,0.08)",
              color: "#4f8ef7",
              border: "1px solid rgba(79,142,247,0.2)",
              fontFamily: "inherit",
            }}
          >
            {abierto ? "▲ Ocultar" : "▾ Ver detalles"}
          </button>
          {/* Eliminar */}
          <form
            action={eliminarAction}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <input type="hidden" name="id" value={cliente.id} />
            <DeleteButton
              mensaje={`¿Eliminar a ${cliente.nombre}?`}
              className="text-xs px-2 py-1.5 rounded-lg transition-all"
              style={{ color: "#6b7899", background: "transparent" }}
            >
              ✕
            </DeleteButton>
          </form>
        </div>
      </div>

      {/* Panel de vehículos expandible */}
      {abierto && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "#2e3650" }}>
          <p
            className="text-xs font-bold uppercase mt-3 mb-2"
            style={{ color: "#6b7899", letterSpacing: "1.5px" }}
          >
            Vehículos vinculados
          </p>
          {vehiculos.length > 0 ? (
            <div className="flex flex-col gap-2">
              {vehiculos.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: "#252b3b", border: "1px solid #2e3650" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(79,142,247,0.08)",
                      color: "#4f8ef7",
                      border: "1px solid rgba(79,142,247,0.15)",
                    }}
                  >
                    ◈
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#dde3f0" }}
                    >
                      {v.marca} {v.modelo} {v.año ? `(${v.año})` : ""}
                    </p>
                  </div>
                  <span
                    className="font-mono text-xs font-bold px-2.5 py-1 rounded flex-shrink-0"
                    style={{
                      background: "#2a3145",
                      color: "#a8b4cc",
                      letterSpacing: "1.5px",
                    }}
                  >
                    {v.patente}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs py-2" style={{ color: "#4a5068" }}>
              Este cliente no tiene vehículos registrados.
            </p>
          )}
        </div>
      )}
    </li>
  );
}
