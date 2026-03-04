"use client";

import { useState, useEffect } from "react";

type Slot = {
  hora: string;
  ocupados: number;
  disponibles: number;
  lleno: boolean;
};

type Props = {
  onSelect: (fecha: string, hora: string) => void;
  fechaSeleccionada?: string;
  horaSeleccionada?: string;
};

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
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

function getDiasDelMes(year: number, month: number) {
  const dias = [];
  const primerDia = new Date(year, month, 1).getDay();
  const totalDias = new Date(year, month + 1, 0).getDate();
  // Padding inicial
  for (let i = 0; i < primerDia; i++) dias.push(null);
  for (let i = 1; i <= totalDias; i++) dias.push(i);
  return dias;
}

export default function CalendarioDisponibilidad({
  onSelect,
  fechaSeleccionada,
  horaSeleccionada,
}: Props) {
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);

  const [mesVista, setMesVista] = useState(manana.getMonth());
  const [anioVista, setAnioVista] = useState(manana.getFullYear());
  const [fechaClick, setFechaClick] = useState<string | null>(
    fechaSeleccionada ?? null,
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [horaClick, setHoraClick] = useState<string | null>(
    horaSeleccionada ?? null,
  );

  const diasDelMes = getDiasDelMes(anioVista, mesVista);

  const esPasado = (dia: number) => {
    const fecha = new Date(anioVista, mesVista, dia);
    fecha.setHours(0, 0, 0, 0);
    manana.setHours(0, 0, 0, 0);
    return fecha < manana;
  };

  const esDomingo = (dia: number) =>
    new Date(anioVista, mesVista, dia).getDay() === 0;

  const toFechaStr = (dia: number) =>
    `${anioVista}-${String(mesVista + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  const handleDia = async (dia: number) => {
    if (esPasado(dia) || esDomingo(dia)) return;
    const f = toFechaStr(dia);
    setFechaClick(f);
    setHoraClick(null);
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/turnos/disponibilidad?fecha=${f}`);
      const data = await res.json();
      setSlots(data.disponibilidad ?? []);
    } catch {
      setSlots([]);
    }
    setLoadingSlots(false);
  };

  const handleHora = (slot: Slot) => {
    if (slot.lleno || !fechaClick) return;
    setHoraClick(slot.hora);
    onSelect(fechaClick, slot.hora);
  };

  const prevMes = () => {
    if (mesVista === 0) {
      setMesVista(11);
      setAnioVista((a) => a - 1);
    } else setMesVista((m) => m - 1);
    setFechaClick(null);
    setHoraClick(null);
    setSlots([]);
  };
  const nextMes = () => {
    if (mesVista === 11) {
      setMesVista(0);
      setAnioVista((a) => a + 1);
    } else setMesVista((m) => m + 1);
    setFechaClick(null);
    setHoraClick(null);
    setSlots([]);
  };

  // No permitir ir a meses pasados
  const esMesAnterior =
    anioVista < manana.getFullYear() ||
    (anioVista === manana.getFullYear() && mesVista <= manana.getMonth());

  return (
    <div className="flex flex-col gap-4">
      {/* CALENDARIO */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "#202637", borderColor: "#2e3650" }}
      >
        {/* Header mes */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMes}
            disabled={esMesAnterior}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              background: "#252b3b",
              color: "#a8b4cc",
              border: "1px solid #2e3650",
            }}
          >
            ‹
          </button>
          <span className="text-sm font-bold" style={{ color: "#dde3f0" }}>
            {MESES[mesVista]} {anioVista}
          </span>
          <button
            type="button"
            onClick={nextMes}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: "#252b3b",
              color: "#a8b4cc",
              border: "1px solid #2e3650",
            }}
          >
            ›
          </button>
        </div>

        {/* Días semana */}
        <div className="grid grid-cols-7 mb-2">
          {DIAS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-bold py-1"
              style={{ color: d === "Dom" ? "#f87171" : "#6b7899" }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {diasDelMes.map((dia, i) => {
            if (!dia) return <div key={`empty-${i}`} />;
            const pasado = esPasado(dia);
            const domingo = esDomingo(dia);
            const fechaStr = toFechaStr(dia);
            const seleccionado = fechaClick === fechaStr;
            const deshabilitado = pasado || domingo;
            return (
              <button
                key={dia}
                type="button"
                onClick={() => handleDia(dia)}
                disabled={deshabilitado}
                className="aspect-square rounded-lg text-xs font-bold transition-all"
                style={{
                  background: seleccionado
                    ? "#4f8ef7"
                    : deshabilitado
                      ? "transparent"
                      : "#252b3b",
                  color: seleccionado
                    ? "#fff"
                    : deshabilitado
                      ? "#374060"
                      : "#dde3f0",
                  border: seleccionado
                    ? "1px solid #4f8ef7"
                    : "1px solid transparent",
                  cursor: deshabilitado ? "not-allowed" : "pointer",
                  opacity: deshabilitado ? 0.4 : 1,
                }}
              >
                {dia}
              </button>
            );
          })}
        </div>

        {/* Leyenda */}
        <div
          className="flex items-center gap-4 mt-3 pt-3 border-t"
          style={{ borderColor: "#2e3650" }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "#34d399" }}
            />
            <span className="text-xs" style={{ color: "#6b7899" }}>
              Disponible
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "#f87171" }}
            />
            <span className="text-xs" style={{ color: "#6b7899" }}>
              Lleno
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "#374060" }}
            />
            <span className="text-xs" style={{ color: "#6b7899" }}>
              No disponible
            </span>
          </div>
        </div>
      </div>

      {/* SLOTS DE HORA */}
      {fechaClick && (
        <div
          className="rounded-xl border p-4"
          style={{ background: "#202637", borderColor: "#2e3650" }}
        >
          <p
            className="text-xs font-bold uppercase mb-3"
            style={{ color: "#6b7899", letterSpacing: "1px" }}
          >
            Horarios —{" "}
            {new Date(fechaClick + "T00:00:00").toLocaleDateString("es-AR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </p>
          {loadingSlots ? (
            <div className="flex items-center justify-center py-6">
              <div
                className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: "#4f8ef7",
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
                const seleccionado = horaClick === slot.hora;
                return (
                  <button
                    key={slot.hora}
                    type="button"
                    onClick={() => handleHora(slot)}
                    disabled={slot.lleno}
                    className="p-2.5 rounded-lg text-center transition-all"
                    style={{
                      background: seleccionado
                        ? "#4f8ef7"
                        : slot.lleno
                          ? "rgba(248,113,113,0.06)"
                          : "rgba(52,211,153,0.06)",
                      border: seleccionado
                        ? "1px solid #4f8ef7"
                        : slot.lleno
                          ? "1px solid rgba(248,113,113,0.2)"
                          : "1px solid rgba(52,211,153,0.2)",
                      cursor: slot.lleno ? "not-allowed" : "pointer",
                      opacity: slot.lleno ? 0.6 : 1,
                    }}
                  >
                    <p
                      className="text-xs font-bold"
                      style={{
                        color: seleccionado
                          ? "#fff"
                          : slot.lleno
                            ? "#f87171"
                            : "#34d399",
                      }}
                    >
                      {slot.hora}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        color: seleccionado
                          ? "rgba(255,255,255,0.7)"
                          : "#6b7899",
                      }}
                    >
                      {slot.lleno
                        ? "Lleno"
                        : `${slot.disponibles} libre${slot.disponibles !== 1 ? "s" : ""}`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
