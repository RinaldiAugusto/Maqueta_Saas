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
  apellido?: string;
  telefono?: string;
  email?: string;
  dni?: string;
  direccion?: string;
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

  const nombreCompleto = [cliente.nombre, cliente.apellido]
    .filter(Boolean)
    .join(" ");
  const inicial = (cliente.apellido || cliente.nombre)?.charAt(0).toUpperCase();

  return (
    <li
      className="rounded-xl border transition-all"
      style={{
        background: "#202637",
        borderColor: abierto ? "rgba(79,142,247,0.3)" : "#2e3650",
        transform: abierto ? "none" : undefined,
      }}
    >
      {/* Fila principal con hover levantado */}
      <div
        className="flex justify-between items-center p-4 group rounded-xl transition-all cursor-pointer"
        style={{ transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
        onMouseEnter={(e) => {
          if (!abierto) {
            (e.currentTarget as HTMLDivElement).style.transform =
              "translateY(-2px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 4px 16px rgba(0,0,0,0.2)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        <div
          className="flex items-center gap-3 flex-1 min-w-0"
          onClick={() => setAbierto(!abierto)}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "rgba(79,142,247,0.12)", color: "#4f8ef7" }}
          >
            {inicial}
          </div>
          <div className="min-w-0">
            <p
              className="font-bold text-sm truncate"
              style={{ color: "#dde3f0" }}
            >
              {nombreCompleto}
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

          {/* Ver detalles con animación */}
          <button
            onClick={() => setAbierto(!abierto)}
            className="btn-animate btn-blue text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{
              background: abierto
                ? "rgba(79,142,247,0.2)"
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
              mensaje={`¿Eliminar a ${nombreCompleto}?`}
              className="btn-animate btn-red text-xs px-2 py-1.5 rounded-lg"
              style={{ color: "#f87171", background: "transparent" }}
            >
              ✕
            </DeleteButton>
          </form>
        </div>
      </div>

      {/* Panel expandible */}
      {abierto && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "#2e3650" }}>
          {/* Datos del cliente */}
          {(cliente.dni || cliente.direccion) && (
            <div className="mt-3 mb-3 grid grid-cols-2 gap-2">
              {cliente.dni && (
                <div
                  className="flex flex-col gap-0.5 p-2.5 rounded-lg"
                  style={{ background: "#252b3b", border: "1px solid #2e3650" }}
                >
                  <span className="text-xs" style={{ color: "#6b7899" }}>
                    DNI
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#dde3f0" }}
                  >
                    {cliente.dni}
                  </span>
                </div>
              )}
              {cliente.direccion && (
                <div
                  className="flex flex-col gap-0.5 p-2.5 rounded-lg"
                  style={{ background: "#252b3b", border: "1px solid #2e3650" }}
                >
                  <span className="text-xs" style={{ color: "#6b7899" }}>
                    Dirección
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#dde3f0" }}
                  >
                    {cliente.direccion}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Vehículos */}
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
                  className="flex items-center gap-3 p-3 rounded-lg transition-all hover:-translate-y-0.5"
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
