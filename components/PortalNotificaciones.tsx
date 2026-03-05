"use client";

import { useState, useRef, useEffect } from "react";

type Notif = {
  id: number;
  titulo: string;
  cuerpo: string;
  leida: boolean;
  created_at: string;
};

type Props = {
  notificaciones: Notif[];
  noLeidas: number;
  marcarLeidaAction: (fd: FormData) => Promise<void>;
};

export default function PortalNotificaciones({
  notificaciones,
  noLeidas,
  marcarLeidaAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-animate btn-ghost relative w-9 h-9 rounded-xl flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid #2e3650",
        }}
      >
        <span style={{ fontSize: "16px" }}>🔔</span>
        {noLeidas > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "#f87171", fontSize: "9px" }}
          >
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden"
          style={{
            background: "#202637",
            borderColor: "#2e3650",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "#2e3650" }}
          >
            <p
              className="text-xs font-bold uppercase"
              style={{ color: "#6b7899", letterSpacing: "1.5px" }}
            >
              Notificaciones
            </p>
            {noLeidas > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(248,113,113,0.1)",
                  color: "#f87171",
                }}
              >
                {noLeidas} nuevas
              </span>
            )}
          </div>

          <div
            className="overflow-y-auto scroll-box-portal"
            style={{ maxHeight: "360px" }}
          >
            {notificaciones.length === 0 ? (
              <p
                className="text-xs text-center py-8"
                style={{ color: "#6b7899" }}
              >
                No tenés notificaciones todavía.
              </p>
            ) : (
              notificaciones.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 border-b transition-all hover:brightness-110"
                  style={{
                    borderColor: "#2e3650",
                    background: n.leida
                      ? "transparent"
                      : "rgba(79,142,247,0.04)",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                    style={{ background: n.leida ? "#374060" : "#4f8ef7" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-bold mb-0.5"
                      style={{ color: "#dde3f0" }}
                    >
                      {n.titulo}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#6b7899" }}
                    >
                      {n.cuerpo}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#4a5068" }}>
                      {new Date(n.created_at).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.leida && (
                    <form action={marcarLeidaAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <button
                        type="submit"
                        className="text-xs flex-shrink-0"
                        style={{
                          color: "#4a5068",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        ✕
                      </button>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
