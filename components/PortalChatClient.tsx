"use client";

import { useState, useEffect, useRef } from "react";

type Mensaje = {
  id: number;
  contenido: string;
  remitente: string;
  created_at: string;
  leido: boolean;
};

type Props = {
  ordenId: number;
  clienteId: number;
  clienteNombre: string;
  mensajesIniciales: Mensaje[];
  enviarMensajeAction: (fd: FormData) => Promise<void>;
};

export default function PortalChatClient({
  ordenId,
  clienteId,
  clienteNombre,
  mensajesIniciales,
  enviarMensajeAction,
}: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleEnviar = async () => {
    const contenido = texto.trim();
    if (!contenido || enviando) return;
    setEnviando(true);
    // Optimistic update
    const temp: Mensaje = {
      id: Date.now(),
      contenido,
      remitente: "cliente",
      created_at: new Date().toISOString(),
      leido: false,
    };
    setMensajes((prev) => [...prev, temp]);
    setTexto("");
    const fd = new FormData();
    fd.set("contenido", contenido);
    fd.set("orden_id", String(ordenId));
    await enviarMensajeAction(fd);
    setEnviando(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const formatHora = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

  // Agrupar por fecha
  let lastFecha = "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 65px)",
      }}
    >
      {/* Mensajes */}
      <div
        className="flex-1 overflow-y-auto scroll-box-portal px-4 py-6"
        style={{ maxHeight: "calc(100vh - 145px)" }}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {mensajes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-2xl mb-3">💬</p>
              <p className="text-sm font-bold" style={{ color: "#dde3f0" }}>
                Iniciá la conversación
              </p>
              <p className="text-xs mt-1" style={{ color: "#6b7899" }}>
                El equipo del taller te responderá a la brevedad.
              </p>
            </div>
          )}

          {mensajes.map((m, i) => {
            const esCliente = m.remitente === "cliente";
            const fechaStr = formatFecha(m.created_at);
            const showFecha = fechaStr !== lastFecha;
            if (showFecha) lastFecha = fechaStr;

            return (
              <div key={m.id}>
                {showFecha && (
                  <div className="flex items-center gap-3 my-4">
                    <div
                      className="flex-1 h-px"
                      style={{ background: "#2e3650" }}
                    />
                    <span
                      className="text-xs capitalize"
                      style={{ color: "#4a5068" }}
                    >
                      {fechaStr}
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "#2e3650" }}
                    />
                  </div>
                )}
                <div
                  className={`flex ${esCliente ? "justify-end" : "justify-start"}`}
                >
                  {!esCliente && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mr-2 mt-1"
                      style={{
                        background: "rgba(79,142,247,0.12)",
                        color: "#4f8ef7",
                      }}
                    >
                      T
                    </div>
                  )}
                  <div style={{ maxWidth: "72%" }}>
                    <div
                      className="rounded-2xl px-4 py-2.5"
                      style={{
                        background: esCliente
                          ? "linear-gradient(135deg, #4f8ef7, #3b7de8)"
                          : "#252b3b",
                        borderBottomRightRadius: esCliente ? "4px" : "16px",
                        borderBottomLeftRadius: esCliente ? "16px" : "4px",
                      }}
                    >
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: esCliente ? "#fff" : "#dde3f0" }}
                      >
                        {m.contenido}
                      </p>
                    </div>
                    <p
                      className={`text-xs mt-1 ${esCliente ? "text-right" : "text-left"}`}
                      style={{ color: "#4a5068" }}
                    >
                      {formatHora(m.created_at)}
                      {esCliente && !m.leido && <span className="ml-1">✓</span>}
                      {esCliente && m.leido && (
                        <span className="ml-1" style={{ color: "#4f8ef7" }}>
                          ✓✓
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className="border-t px-4 py-3"
        style={{ background: "#202637", borderColor: "#2e3650" }}
      >
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu mensaje... (Enter para enviar)"
            rows={1}
            style={{
              flex: 1,
              background: "#252b3b",
              border: "1px solid #374060",
              padding: "10px 14px",
              color: "#dde3f0",
              fontFamily: "inherit",
              borderRadius: "12px",
              fontSize: "13px",
              outline: "none",
              resize: "none",
              lineHeight: "1.5",
            }}
          />
          <button
            onClick={handleEnviar}
            disabled={!texto.trim() || enviando}
            className="btn-animate btn-blue w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
              fontFamily: "inherit",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "#4a5068" }}>
          Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
