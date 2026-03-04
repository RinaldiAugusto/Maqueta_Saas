import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PortalPagarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nombre")
    .eq("auth_id", user.id)
    .single();
  if (!cliente) redirect("/portal/sin-cuenta");

  const { data: orden } = await supabase
    .from("ordenes")
    .select("*, vehiculos ( id, patente, marca, modelo, clientes ( nombre ) )")
    .eq("id", id)
    .single();

  if (!orden) redirect("/portal");

  // Verificar que la orden pertenece al cliente
  const vehiculo = orden.vehiculos as any;
  const cobrado = orden.pagado || orden.pagado_por_cliente;

  async function procesarPago(formData: FormData) {
    "use server";
    const metodo = formData.get("metodo") as string;
    const supabase = await createClient();

    // 1. Marcar orden como pagada por cliente
    await supabase
      .from("ordenes")
      .update({
        pagado_por_cliente: true,
        metodo_pago_cliente: metodo,
        monto_cobrado_cliente: orden.costo,
        // También actualizar los campos del admin para que aparezca en historial
        pagado: true,
        metodo_pago: metodo,
        monto_cobrado: orden.costo,
        fecha_pago: new Date().toISOString(),
      })
      .eq("id", id);

    redirect("/portal?pago=ok");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "#1a1f2e",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="w-full max-w-md">
        {/* NAVBAR mínimo */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/portal"
            className="text-xs font-semibold flex items-center gap-1.5"
            style={{ color: "#6b7899", textDecoration: "none" }}
          >
            ← Volver
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
              }}
            >
              ▦
            </div>
            <span className="text-white font-extrabold text-sm">
              Portal del Cliente
            </span>
          </div>
        </div>

        {cobrado ? (
          // Ya pagado
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ background: "#202637", borderColor: "#2e3650" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
              style={{
                background: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.2)",
                color: "#34d399",
              }}
            >
              ✓
            </div>
            <h2
              className="text-lg font-extrabold mb-2"
              style={{ color: "#ffffff" }}
            >
              Orden ya abonada
            </h2>
            <p className="text-sm mb-6" style={{ color: "#6b7899" }}>
              Esta orden ya fue pagada anteriormente.
            </p>
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
                textDecoration: "none",
              }}
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <div
            className="rounded-2xl border p-8"
            style={{ background: "#202637", borderColor: "#2e3650" }}
          >
            <h2
              className="text-lg font-extrabold mb-1"
              style={{ color: "#ffffff" }}
            >
              Confirmar Pago
            </h2>
            <p className="text-xs mb-6" style={{ color: "#6b7899" }}>
              Revisá los detalles antes de confirmar
            </p>

            {/* Resumen orden */}
            <div
              className="rounded-xl border p-4 mb-5"
              style={{ background: "#252b3b", borderColor: "#2e3650" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(79,142,247,0.08)",
                    color: "#4f8ef7",
                  }}
                >
                  ◈
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#dde3f0" }}>
                    {vehiculo?.marca} {vehiculo?.modelo}
                  </p>
                  <span
                    className="font-mono text-xs font-bold"
                    style={{ color: "#a8b4cc", letterSpacing: "1.5px" }}
                  >
                    {vehiculo?.patente}
                  </span>
                </div>
              </div>
              <div
                className="flex flex-col gap-2 pt-3 border-t"
                style={{ borderColor: "#2e3650" }}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs" style={{ color: "#6b7899" }}>
                    Servicio
                  </span>
                  <span
                    className="text-xs font-semibold text-right ml-4"
                    style={{ color: "#dde3f0", maxWidth: "60%" }}
                  >
                    {orden.descripcion}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center pt-2 border-t"
                  style={{ borderColor: "#2e3650" }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#6b7899" }}
                  >
                    Total a pagar
                  </span>
                  <span
                    className="text-2xl font-extrabold"
                    style={{ color: "#34d399", letterSpacing: "-0.5px" }}
                  >
                    ${new Intl.NumberFormat("es-AR").format(orden.costo)}
                  </span>
                </div>
              </div>
            </div>

            {/* Form pago */}
            <form action={procesarPago} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-bold uppercase"
                  style={{ color: "#6b7899", letterSpacing: "1px" }}
                >
                  Método de pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "Efectivo", icon: "💵" },
                    { value: "Transferencia", icon: "🏦" },
                    { value: "Mercado Pago", icon: "💙" },
                    { value: "Tarjeta", icon: "💳" },
                  ].map((m) => (
                    <label
                      key={m.value}
                      className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all"
                      style={{ background: "#252b3b", borderColor: "#374060" }}
                    >
                      <input
                        type="radio"
                        name="metodo"
                        value={m.value}
                        required
                        className="accent-blue-500 flex-shrink-0"
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "#dde3f0" }}
                      >
                        {m.icon} {m.value}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div
                className="p-3 rounded-xl text-xs"
                style={{
                  background: "rgba(79,142,247,0.05)",
                  border: "1px solid rgba(79,142,247,0.15)",
                  color: "#6b7899",
                }}
              >
                ℹ️ Al confirmar el pago, el taller recibirá la notificación
                automáticamente.
              </div>

              <button
                type="submit"
                className="w-full rounded-xl text-sm font-bold text-white py-3.5 transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
                  fontFamily: "inherit",
                  boxShadow: "0 4px 12px rgba(79,142,247,0.25)",
                }}
              >
                ✓ Confirmar Pago de $
                {new Intl.NumberFormat("es-AR").format(orden.costo)}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
