import Link from "next/link";

export default function SinCuentaPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "#1a1f2e",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5"
          style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.2)",
            color: "#fbbf24",
          }}
        >
          ◷
        </div>
        <h1
          className="text-lg font-extrabold mb-2"
          style={{ color: "#ffffff" }}
        >
          Cuenta no vinculada
        </h1>
        <p className="text-sm mb-1" style={{ color: "#6b7899" }}>
          Tu cuenta aún no está vinculada a un cliente en el sistema.
        </p>
        <p className="text-sm mb-6" style={{ color: "#6b7899" }}>
          Acercate al taller para que registren tu email y puedan activar tu
          acceso.
        </p>
        <Link
          href="/portal/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
            textDecoration: "none",
          }}
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
