"use client";

import { useState } from "react";

type Props = {
  nombre: string;
  marcarVistoAction: () => Promise<void>;
};

const PASOS = [
  {
    icon: "◷",
    color: "#4f8ef7",
    titulo: "Pedí tu turno online",
    desc: "Desde el portal podés solicitar un turno en segundos. Elegí el servicio, el vehículo y el horario que mejor te quede.",
  },
  {
    icon: "🔧",
    color: "#fbbf24",
    titulo: "Seguí tu auto en tiempo real",
    desc: "Mientras tu vehículo está en el taller, podés ver en qué etapa del trabajo está desde acá.",
  },
  {
    icon: "💳",
    color: "#34d399",
    titulo: "Pagá online",
    desc: "Cuando el trabajo esté listo, podés pagar directamente desde el portal con Mercado Pago o transferencia.",
  },
  {
    icon: "🔔",
    color: "#c084fc",
    titulo: "Recibí notificaciones",
    desc: "Te avisamos cada vez que hay un cambio en tu orden o cuando tu turno es confirmado. Todo en un solo lugar.",
  },
];

export default function PortalOnboarding({ nombre, marcarVistoAction }: Props) {
  const [paso, setPaso] = useState(0);
  const [saliendo, setSaliendo] = useState(false);

  const cerrar = async () => {
    setSaliendo(true);
    await marcarVistoAction();
  };

  const siguiente = () => {
    if (paso < PASOS.length - 1) setPaso((p) => p + 1);
    else cerrar();
  };

  if (saliendo) return null;

  const p = PASOS[paso];
  const progress = ((paso + 1) / PASOS.length) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{
          background: "#202637",
          borderColor: "#2e3650",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Barra de progreso */}
        <div className="h-1" style={{ background: "#252b3b" }}>
          <div
            className="h-1 transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${p.color}, ${p.color}88)`,
            }}
          />
        </div>

        <div className="p-8">
          {/* Saludo inicial solo en paso 0 */}
          {paso === 0 && (
            <p
              className="text-xs font-bold uppercase mb-4"
              style={{ color: "#6b7899", letterSpacing: "1.5px" }}
            >
              👋 Bienvenido, {nombre.split(" ")[0]}
            </p>
          )}

          {/* Ícono */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
            style={{
              background: `${p.color}12`,
              border: `1px solid ${p.color}25`,
            }}
          >
            {p.icon}
          </div>

          <h2
            className="text-xl font-extrabold mb-3"
            style={{ color: "#ffffff", letterSpacing: "-0.3px" }}
          >
            {p.titulo}
          </h2>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "#6b7899" }}
          >
            {p.desc}
          </p>

          {/* Dots */}
          <div className="flex items-center gap-2 mb-6">
            {PASOS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === paso ? "20px" : "6px",
                  height: "6px",
                  background:
                    i === paso ? p.color : i < paso ? "#374060" : "#252b3b",
                }}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={cerrar}
              className="btn-animate btn-ghost px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "#252b3b",
                color: "#6b7899",
                border: "1px solid #2e3650",
                fontFamily: "inherit",
              }}
            >
              Saltar
            </button>
            <button
              onClick={siguiente}
              className="btn-animate btn-blue flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`,
                fontFamily: "inherit",
                boxShadow: `0 4px 16px ${p.color}30`,
              }}
            >
              {paso < PASOS.length - 1 ? "Siguiente →" : "¡Empezar! →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
