"use client";

import { useState } from "react";

type Vehiculo = {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  km_actual?: number;
  km_proximo_service?: number;
  intervalo_km?: number;
};

type Props = {
  vehiculos: Vehiculo[];
  guardarKmAction: (fd: FormData) => Promise<void>;
};

export default function PortalKilometraje({
  vehiculos,
  guardarKmAction,
}: Props) {
  const [editando, setEditando] = useState<number | null>(null);
  const [kmVal, setKmVal] = useState("");
  const [intervaloVal, setIntervaloVal] = useState("10000");

  const abrirEdicion = (v: Vehiculo) => {
    setEditando(v.id);
    setKmVal(v.km_actual?.toString() ?? "");
    setIntervaloVal(v.intervalo_km?.toString() ?? "10000");
  };

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "#252b3b", borderColor: "#2e3650" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <p
          className="text-xs font-bold uppercase"
          style={{ color: "#6b7899", letterSpacing: "1.5px" }}
        >
          🛞 Podómetro de Service
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {vehiculos.map((v) => {
          const pct =
            v.km_actual && v.km_proximo_service
              ? Math.min((v.km_actual / v.km_proximo_service) * 100, 100)
              : 0;
          const cerca = pct >= 85;
          const listo = pct >= 100;
          const barColor = listo ? "#f87171" : cerca ? "#fbbf24" : "#34d399";

          return (
            <div
              key={v.id}
              className="rounded-xl border p-4"
              style={{ background: "#202637", borderColor: "#2e3650" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-sm" style={{ color: "#dde3f0" }}>
                    {v.marca} {v.modelo}
                  </p>
                  <span
                    className="font-mono text-xs"
                    style={{ color: "#6b7899", letterSpacing: "1.5px" }}
                  >
                    {v.patente}
                  </span>
                </div>
                <button
                  onClick={() => abrirEdicion(v)}
                  className="btn-animate btn-ghost text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{
                    background: "rgba(79,142,247,0.08)",
                    color: "#4f8ef7",
                    border: "1px solid rgba(79,142,247,0.2)",
                    fontFamily: "inherit",
                  }}
                >
                  ✏️ Actualizar km
                </button>
              </div>

              {v.km_actual ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs" style={{ color: "#6b7899" }}>
                      Km actual:{" "}
                      <strong style={{ color: "#dde3f0" }}>
                        {new Intl.NumberFormat("es-AR").format(v.km_actual)}
                      </strong>
                    </span>
                    {v.km_proximo_service && (
                      <span className="text-xs" style={{ color: "#6b7899" }}>
                        Próximo service:{" "}
                        <strong style={{ color: barColor }}>
                          {new Intl.NumberFormat("es-AR").format(
                            v.km_proximo_service,
                          )}
                        </strong>
                      </span>
                    )}
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: "#252b3b" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs" style={{ color: "#4a5068" }}>
                      0 km
                    </span>
                    {listo ? (
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#f87171" }}
                      >
                        ⚠️ ¡Service vencido!
                      </span>
                    ) : cerca ? (
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#fbbf24" }}
                      >
                        ⚡ Service próximo
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#6b7899" }}>
                        {Math.round(100 - pct)}% restante
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs" style={{ color: "#4a5068" }}>
                  Cargá el kilometraje actual para ver cuándo toca el próximo
                  service.
                </p>
              )}

              {/* Form de edición inline */}
              {editando === v.id && (
                <form
                  action={guardarKmAction}
                  className="mt-4 pt-4 border-t flex flex-col gap-3"
                  style={{ borderColor: "#2e3650" }}
                >
                  <input type="hidden" name="vehiculo_id" value={v.id} />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-xs font-semibold"
                        style={{ color: "#a8b4cc" }}
                      >
                        Km actual *
                      </label>
                      <input
                        type="number"
                        name="km_actual"
                        required
                        value={kmVal}
                        onChange={(e) => setKmVal(e.target.value)}
                        placeholder="Ej: 85000"
                        className="rounded-lg text-xs outline-none"
                        style={{
                          background: "#252b3b",
                          border: "1px solid #374060",
                          padding: "8px 10px",
                          color: "#dde3f0",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-xs font-semibold"
                        style={{ color: "#a8b4cc" }}
                      >
                        Intervalo km
                      </label>
                      <input
                        type="number"
                        name="intervalo_km"
                        value={intervaloVal}
                        onChange={(e) => setIntervaloVal(e.target.value)}
                        placeholder="10000"
                        className="rounded-lg text-xs outline-none"
                        style={{
                          background: "#252b3b",
                          border: "1px solid #374060",
                          padding: "8px 10px",
                          color: "#dde3f0",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditando(null)}
                      className="btn-animate btn-ghost px-3 py-2 rounded-lg text-xs font-semibold"
                      style={{
                        background: "#252b3b",
                        color: "#6b7899",
                        border: "1px solid #2e3650",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-animate btn-blue flex-1 py-2 rounded-lg text-xs font-bold text-white"
                      style={{ background: "#4f8ef7", fontFamily: "inherit" }}
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
