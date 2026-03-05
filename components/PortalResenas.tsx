"use client";

import { useState } from "react";

type Resena = {
  id: number;
  estrellas: number;
  comentario: string | null;
  created_at: string;
  ordenes: { descripcion: string } | null;
};

type OrdenSinResena = {
  id: number;
  descripcion: string;
  created_at: string;
};

type Props = {
  resenas: Resena[];
  ordenesSinResena: OrdenSinResena[];
  enviarResenaAction: (fd: FormData) => Promise<void>;
};

function Estrellas({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{
            fontSize: "22px",
            background: "none",
            border: "none",
            cursor: onChange ? "pointer" : "default",
            color: i <= (hover || value) ? "#fbbf24" : "#374060",
            transition: "color 0.1s",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function PortalResenas({
  resenas,
  ordenesSinResena,
  enviarResenaAction,
}: Props) {
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<number | null>(
    null,
  );
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenSeleccionada) return;
    setEnviando(true);
    const fd = new FormData();
    fd.set("orden_id", String(ordenSeleccionada));
    fd.set("estrellas", String(estrellas));
    fd.set("comentario", comentario);
    await enviarResenaAction(fd);
    setEnviando(false);
    setOrdenSeleccionada(null);
    setComentario("");
    setEstrellas(5);
  };

  const promedioEstrellas =
    resenas.length > 0
      ? (resenas.reduce((a, r) => a + r.estrellas, 0) / resenas.length).toFixed(
          1,
        )
      : null;

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: "#252b3b", borderColor: "#2e3650" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            className="text-xs font-bold uppercase"
            style={{ color: "#6b7899", letterSpacing: "1.5px" }}
          >
            ⭐ Reseñas del Taller
          </p>
          {promedioEstrellas && (
            <p className="text-xs mt-0.5" style={{ color: "#fbbf24" }}>
              Tu promedio: {promedioEstrellas} / 5
            </p>
          )}
        </div>
        {ordenesSinResena.length > 0 && !ordenSeleccionada && (
          <button
            onClick={() => setOrdenSeleccionada(ordenesSinResena[0].id)}
            className="btn-animate btn-blue text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(251,191,36,0.08)",
              color: "#fbbf24",
              border: "1px solid rgba(251,191,36,0.2)",
              fontFamily: "inherit",
            }}
          >
            + Dejar reseña
          </button>
        )}
      </div>

      {/* Formulario de nueva reseña */}
      {ordenSeleccionada && (
        <form
          onSubmit={handleEnviar}
          className="mb-5 p-4 rounded-xl border"
          style={{ background: "#202637", borderColor: "#2e3650" }}
        >
          <p className="text-xs font-bold mb-3" style={{ color: "#dde3f0" }}>
            ¿Cómo fue tu experiencia?
          </p>

          {ordenesSinResena.length > 1 && (
            <div className="mb-3">
              <label
                className="text-xs font-semibold mb-1 block"
                style={{ color: "#a8b4cc" }}
              >
                Orden a calificar
              </label>
              <select
                value={ordenSeleccionada}
                onChange={(e) => setOrdenSeleccionada(parseInt(e.target.value))}
                style={{
                  background: "#252b3b",
                  border: "1px solid #374060",
                  padding: "8px 10px",
                  color: "#dde3f0",
                  fontFamily: "inherit",
                  borderRadius: "8px",
                  fontSize: "12px",
                  outline: "none",
                  width: "100%",
                }}
              >
                {ordenesSinResena.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.descripcion || `Orden #${o.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <label
              className="text-xs font-semibold mb-2 block"
              style={{ color: "#a8b4cc" }}
            >
              Calificación
            </label>
            <Estrellas value={estrellas} onChange={setEstrellas} />
          </div>

          <div className="mb-3">
            <label
              className="text-xs font-semibold mb-1 block"
              style={{ color: "#a8b4cc" }}
            >
              Comentario{" "}
              <span style={{ color: "#4a5068", fontWeight: 400 }}>
                (opcional)
              </span>
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Contanos tu experiencia..."
              rows={3}
              style={{
                background: "#252b3b",
                border: "1px solid #374060",
                padding: "8px 10px",
                color: "#dde3f0",
                fontFamily: "inherit",
                borderRadius: "8px",
                fontSize: "12px",
                outline: "none",
                width: "100%",
                resize: "vertical",
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrdenSeleccionada(null)}
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
              disabled={enviando}
              className="btn-animate btn-green flex-1 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #34d399, #059669)",
                fontFamily: "inherit",
              }}
            >
              {enviando ? "Enviando..." : "✓ Enviar reseña"}
            </button>
          </div>
        </form>
      )}

      {/* Reseñas enviadas */}
      {resenas.length === 0 && !ordenSeleccionada ? (
        <p className="text-xs text-center py-6" style={{ color: "#4a5068" }}>
          {ordenesSinResena.length > 0
            ? "Todavía no dejaste reseñas. ¡Contanos cómo fue tu experiencia!"
            : "Completá una orden para poder dejar una reseña."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {resenas.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-xl border"
              style={{ background: "#202637", borderColor: "#2e3650" }}
            >
              <div className="flex items-center justify-between mb-1">
                <Estrellas value={r.estrellas} />
                <span className="text-xs" style={{ color: "#4a5068" }}>
                  {new Date(r.created_at).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {r.ordenes?.descripcion && (
                <p className="text-xs mb-1" style={{ color: "#4f8ef7" }}>
                  {r.ordenes.descripcion}
                </p>
              )}
              {r.comentario && (
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#a8b4cc" }}
                >
                  {r.comentario}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
