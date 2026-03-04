"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function CambiarEstadoTurno({
  id,
  estadoActual,
  vehiculoId,
  servicioNombre,
  descripcion,
}: {
  id: number;
  estadoActual: string;
  vehiculoId?: number;
  servicioNombre?: string;
  descripcion?: string;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(estadoActual);
  const [ordenId, setOrdenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [yaCreada, setYaCreada] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value;
    setEstado(nuevoEstado);
    await fetch("/api/turnos/estado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado: nuevoEstado }),
    });
    router.refresh();
  };

  const crearOrden = async () => {
    if (!vehiculoId) return;
    setLoading(true);
    const desc = [servicioNombre, descripcion].filter(Boolean).join(" — ");
    const res = await fetch("/api/turnos/crear-orden", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turno_id: id,
        vehiculo_id: vehiculoId,
        descripcion: desc,
      }),
    });
    const data = await res.json();
    if (data.orden_id) {
      setOrdenId(data.orden_id);
      setYaCreada(true);
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <select
        value={estado}
        onChange={handleChange}
        className="rounded-md text-xs outline-none cursor-pointer"
        style={{
          background: "#202637",
          border: "1px solid #374060",
          padding: "5px 8px",
          color: "#a8b4cc",
          fontFamily: "inherit",
        }}
      >
        <option value="Confirmado">Confirmado</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Completado">Completado</option>
        <option value="Cancelado">Cancelado</option>
      </select>

      {/* Botón crear orden — solo si está Confirmado y tiene vehículo */}
      {estado === "Confirmado" &&
        vehiculoId &&
        (yaCreada && ordenId ? (
          <Link
            href={`/ordenes/${ordenId}`}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
            style={{
              background: "rgba(52,211,153,0.08)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.2)",
              textDecoration: "none",
            }}
          >
            ✓ Ver orden
          </Link>
        ) : (
          <button
            onClick={crearOrden}
            disabled={loading}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap disabled:opacity-50"
            style={{
              background: "rgba(79,142,247,0.08)",
              color: "#4f8ef7",
              border: "1px solid rgba(79,142,247,0.2)",
              fontFamily: "inherit",
            }}
          >
            {loading ? "..." : "+ Crear orden"}
          </button>
        ))}
    </div>
  );
}
