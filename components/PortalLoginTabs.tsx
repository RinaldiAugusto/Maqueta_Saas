"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  error?: string;
  mensaje?: string;
  loginAction: (formData: FormData) => Promise<void>;
  registrarAction: (formData: FormData) => Promise<void>;
  googleLoginUrl?: string;
};

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "11px 14px",
  color: "#fff",
  fontFamily: "inherit",
  borderRadius: "10px",
  fontSize: "13px",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
} as React.CSSProperties;

// Pasos del registro
const STEPS = [
  { title: "Tu nombre", subtitle: "¿Cómo te llamamos?" },
  { title: "Tu contacto", subtitle: "Para comunicarnos con vos" },
  { title: "Tu cuenta", subtitle: "Creá tu acceso al portal" },
];

export default function PortalLoginTabs({
  error,
  mensaje,
  loginAction,
  registrarAction,
  googleLoginUrl,
}: Props) {
  const [tab, setTab] = useState<"login" | "registro">("login");
  const [step, setStep] = useState(0);
  const [regData, setRegData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    direccion: "",
    email: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState("");

  const update = (k: string, v: string) =>
    setRegData((p) => ({ ...p, [k]: v }));

  const nextStep = () => {
    if (step === 0 && !regData.nombre.trim()) {
      setLocalError("El nombre es obligatorio.");
      return;
    }
    if (step === 1 && !regData.email.trim()) {
      setLocalError("El email es obligatorio.");
      return;
    }
    setLocalError("");
    setStep((s) => s + 1);
  };

  const submitRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.password || regData.password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const fd = new FormData();
    Object.entries(regData).forEach(([k, v]) => fd.set(k, v));
    registrarAction(fd);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div>
      {/* Alertas globales */}
      {(error || localError) && (
        <div
          className="mb-4 p-3 rounded-xl text-xs font-semibold"
          style={{
            background: "rgba(248,113,113,0.1)",
            color: "#f87171",
            border: "1px solid rgba(248,113,113,0.2)",
          }}
        >
          ✕ {error || localError}
        </div>
      )}
      {mensaje && (
        <div
          className="mb-4 p-3 rounded-xl text-xs font-semibold"
          style={{
            background: "rgba(52,211,153,0.1)",
            color: "#34d399",
            border: "1px solid rgba(52,211,153,0.2)",
          }}
        >
          ✓ {mensaje}
        </div>
      )}

      {/* TABS */}
      <div
        className="flex rounded-xl p-1 mb-6"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        {(["login", "registro"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setStep(0);
              setLocalError("");
            }}
            className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: tab === t ? "#4f8ef7" : "transparent",
              color: tab === t ? "#fff" : "rgba(255,255,255,0.4)",
              fontFamily: "inherit",
            }}
          >
            {t === "login" ? "Iniciar Sesión" : "Registrarse"}
          </button>
        ))}
      </div>

      {/* ── LOGIN ── */}
      {tab === "login" && (
        <div className="flex flex-col gap-4">
          {/* Google */}
          <a
            href={googleLoginUrl ?? "/portal/auth/google"}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.12)",
              textDecoration: "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Continuar con Google
          </a>

          <div className="flex items-center gap-3">
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
            <span
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              o
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
          </div>

          <form action={loginAction} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}
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
                style={{ color: "rgba(255,255,255,0.5)" }}
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
              className="w-full rounded-xl text-sm font-bold text-white py-3 mt-1 transition-all hover:-translate-y-0.5 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
                fontFamily: "inherit",
                boxShadow: "0 4px 20px rgba(79,142,247,0.35)",
              }}
            >
              Entrar al Portal →
            </button>
          </form>
        </div>
      )}

      {/* ── REGISTRO MULTI-PASO ── */}
      {tab === "registro" && (
        <div>
          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <p
                className="text-xs font-bold"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {STEPS[step].title}
              </p>
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Paso {step + 1} de {STEPS.length}
              </span>
            </div>
            <div
              className="w-full rounded-full h-1"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #4f8ef7, #34d399)",
                }}
              />
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {STEPS[step].subtitle}
            </p>
          </div>

          {/* PASO 0: Nombre */}
          {step === 0 && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-semibold"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Nombre/s *
                  </label>
                  <input
                    type="text"
                    placeholder="Juan"
                    value={regData.nombre}
                    onChange={(e) => update("nombre", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-semibold"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Apellido/s
                  </label>
                  <input
                    type="text"
                    placeholder="García"
                    value={regData.apellido}
                    onChange={(e) => update("apellido", e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  N° de Documento
                </label>
                <input
                  type="text"
                  placeholder="38.123.456"
                  value={regData.dni}
                  onChange={(e) => update("dni", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                onClick={nextStep}
                className="w-full rounded-xl text-sm font-bold text-white py-3 mt-2 transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
                  fontFamily: "inherit",
                  boxShadow: "0 4px 20px rgba(79,142,247,0.3)",
                }}
              >
                Continuar →
              </button>
            </div>
          )}

          {/* PASO 1: Contacto */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={regData.email}
                  onChange={(e) => update("email", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Teléfono
                </label>
                <input
                  type="text"
                  placeholder="+54 351 123-4567"
                  value={regData.telefono}
                  onChange={(e) => update("telefono", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Av. Colón 1234, Córdoba"
                  value={regData.direccion}
                  onChange={(e) => update("direccion", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-4 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "inherit",
                  }}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 rounded-xl text-sm font-bold text-white py-3 transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
                    fontFamily: "inherit",
                    boxShadow: "0 4px 20px rgba(79,142,247,0.3)",
                  }}
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: Contraseña */}
          {step === 2 && (
            <form onSubmit={submitRegistro} className="flex flex-col gap-3">
              <div
                className="p-3 rounded-xl mb-1"
                style={{
                  background: "rgba(79,142,247,0.06)",
                  border: "1px solid rgba(79,142,247,0.15)",
                }}
              >
                <p className="text-xs font-bold" style={{ color: "#4f8ef7" }}>
                  ✓ {regData.nombre} {regData.apellido}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {regData.email}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={regData.password}
                    onChange={(e) => update("password", e.target.value)}
                    style={{ ...inputStyle, paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {showPass ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>
              {regData.password.length > 0 && (
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all"
                      style={{
                        background:
                          regData.password.length >= i * 4
                            ? i === 3
                              ? "#34d399"
                              : i === 2
                                ? "#fbbf24"
                                : "#f87171"
                            : "rgba(255,255,255,0.08)",
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "inherit",
                  }}
                >
                  ←
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl text-sm font-bold text-white py-3 transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #34d399, #059669)",
                    fontFamily: "inherit",
                    boxShadow: "0 4px 20px rgba(52,211,153,0.3)",
                  }}
                >
                  ✓ Crear mi cuenta
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
