"use client";

import { useState } from "react";

type Props = {
  error?: string;
  mensaje?: string;
  loginAction: (formData: FormData) => Promise<void>;
  registrarAction: (formData: FormData) => Promise<void>;
};

const inputStyle = {
  background: "#252b3b",
  border: "1px solid #374060",
  padding: "10px 14px",
  color: "#dde3f0",
  fontFamily: "inherit",
  borderRadius: "8px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
} as React.CSSProperties;

export default function PortalLoginTabs({
  error,
  mensaje,
  loginAction,
  registrarAction,
}: Props) {
  const [tab, setTab] = useState<"login" | "registro">("login");

  return (
    <>
      {/* Alertas */}
      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-xs font-semibold"
          style={{
            background: "rgba(248,113,113,0.08)",
            color: "#f87171",
            border: "1px solid rgba(248,113,113,0.2)",
          }}
        >
          ✕ {error}
        </div>
      )}
      {mensaje && (
        <div
          className="mb-4 p-3 rounded-lg text-xs font-semibold"
          style={{
            background: "rgba(52,211,153,0.08)",
            color: "#34d399",
            border: "1px solid rgba(52,211,153,0.2)",
          }}
        >
          ✓ {mensaje}
        </div>
      )}

      {/* TABS */}
      <div
        className="flex rounded-lg p-1 mb-6"
        style={{ background: "#252b3b" }}
      >
        {(["login", "registro"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-md text-xs font-bold transition-all"
            style={{
              background: tab === t ? "#4f8ef7" : "transparent",
              color: tab === t ? "#fff" : "#6b7899",
              fontFamily: "inherit",
            }}
          >
            {t === "login" ? "Iniciar Sesión" : "Registrarse"}
          </button>
        ))}
      </div>

      {/* FORM LOGIN */}
      {tab === "login" && (
        <form action={loginAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold"
              style={{ color: "#a8b4cc" }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="tu@email.com"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold"
              style={{ color: "#a8b4cc" }}
            >
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg text-sm font-bold text-white py-3 mt-2 transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
              fontFamily: "inherit",
              boxShadow: "0 4px 12px rgba(79,142,247,0.25)",
            }}
          >
            Entrar al Portal
          </button>
        </form>
      )}

      {/* FORM REGISTRO */}
      {tab === "registro" && (
        <form action={registrarAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold"
              style={{ color: "#a8b4cc" }}
            >
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              required
              placeholder="Juan García"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold"
              style={{ color: "#a8b4cc" }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="tu@email.com"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold"
              style={{ color: "#a8b4cc" }}
            >
              Teléfono{" "}
              <span style={{ color: "#6b7899", fontWeight: 400 }}>
                (opcional)
              </span>
            </label>
            <input
              type="text"
              name="telefono"
              placeholder="+54 11 1234-5678"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold"
              style={{ color: "#a8b4cc" }}
            >
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Mínimo 6 caracteres"
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg text-sm font-bold text-white py-3 mt-2 transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
              fontFamily: "inherit",
              boxShadow: "0 4px 12px rgba(79,142,247,0.25)",
            }}
          >
            Crear Cuenta
          </button>
        </form>
      )}
    </>
  );
}
