import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PortalChatClient from "@/components/PortalChatClient";

export default async function PortalChatPage({
  params,
}: {
  params: Promise<{ orden_id: string }>;
}) {
  const { orden_id } = await params;
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
    .select("id, descripcion, estado, vehiculos ( patente, marca, modelo )")
    .eq("id", orden_id)
    .single();

  if (!orden) redirect("/portal");

  const { data: mensajes } = await supabase
    .from("mensajes")
    .select("*")
    .eq("orden_id", orden_id)
    .order("created_at", { ascending: true });

  async function enviarMensaje(formData: FormData) {
    "use server";
    const contenido = (formData.get("contenido") as string)?.trim();
    if (!contenido) return;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: c } = await supabase
      .from("clientes")
      .select("id")
      .eq("auth_id", user.id)
      .single();
    if (!c) return;
    await supabase.from("mensajes").insert({
      orden_id: parseInt(orden_id),
      cliente_id: c.id,
      remitente: "cliente",
      contenido,
      leido: false,
    });
    // Crear notificación para admin (genérica)
    redirect(`/portal/chat/${orden_id}`);
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#1a1f2e",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <nav
        className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-40"
        style={{ background: "#202637", borderColor: "#2e3650" }}
      >
        <a
          href="/portal"
          className="btn-animate btn-ghost text-xs font-semibold flex items-center gap-1.5"
          style={{ color: "#6b7899", textDecoration: "none" }}
        >
          ← Volver
        </a>
        <div>
          <p className="text-sm font-bold" style={{ color: "#dde3f0" }}>
            Chat — {(orden.vehiculos as any)?.marca}{" "}
            {(orden.vehiculos as any)?.modelo}
          </p>
          <p className="text-xs" style={{ color: "#6b7899" }}>
            Orden #{orden.id} · {(orden.vehiculos as any)?.patente}
          </p>
        </div>
      </nav>

      <PortalChatClient
        ordenId={parseInt(orden_id)}
        clienteId={cliente.id}
        clienteNombre={cliente.nombre}
        mensajesIniciales={mensajes ?? []}
        enviarMensajeAction={enviarMensaje}
      />
    </div>
  );
}
