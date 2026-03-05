import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PortalLoginLanding from "@/components/PortalLoginLanding";

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mensaje?: string }>;
}) {
  const { error, mensaje } = await searchParams;

  async function loginCliente(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) redirect("/portal/login?error=Credenciales incorrectas");
    redirect("/portal");
  }

  async function registrarCliente(formData: FormData) {
    "use server";
    const nombre = formData.get("nombre") as string;
    const apellido = formData.get("apellido") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const telefono = formData.get("telefono") as string;
    const dni = formData.get("dni") as string;
    const direccion = formData.get("direccion") as string;

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError)
      redirect(`/portal/login?error=${encodeURIComponent(authError.message)}`);

    const userId = authData.user?.id;
    if (!userId) redirect("/portal/login?error=Error al crear usuario");

    // Buscar si ya existe (cargado por el admin)
    const { data: clienteExistente } = await supabase
      .from("clientes")
      .select("id, onboarding_visto")
      .eq("email", email)
      .single();

    if (clienteExistente) {
      // Si ya vio el onboarding (true) → no lo tocamos
      // Si es null o false → seteamos false para que lo vea esta vez
      const nuevoValor =
        clienteExistente.onboarding_visto === true ? true : false;
      await supabase
        .from("clientes")
        .update({
          auth_id: userId,
          apellido,
          dni,
          direccion,
          telefono,
          onboarding_visto: nuevoValor,
        })
        .eq("id", clienteExistente.id);
    } else {
      // Cliente nuevo → mostrar onboarding
      await supabase.from("clientes").insert({
        nombre,
        apellido,
        email,
        telefono,
        dni,
        direccion,
        auth_id: userId,
        onboarding_visto: false,
      });
    }

    redirect("/portal");
  }

  return (
    <PortalLoginLanding
      error={error}
      mensaje={mensaje}
      loginAction={loginCliente}
      registrarAction={registrarCliente}
    />
  );
}
