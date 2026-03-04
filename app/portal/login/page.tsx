import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PortalLoginTabs from "@/components/PortalLoginTabs";

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
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const telefono = formData.get("telefono") as string;

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError)
      redirect(`/portal/login?error=${encodeURIComponent(authError.message)}`);

    const userId = authData.user?.id;
    if (!userId) redirect("/portal/login?error=Error al crear usuario");

    const { data: clienteExistente } = await supabase
      .from("clientes")
      .select("id")
      .eq("email", email)
      .single();

    if (clienteExistente) {
      await supabase
        .from("clientes")
        .update({ auth_id: userId })
        .eq("id", clienteExistente.id);
    } else {
      await supabase
        .from("clientes")
        .insert({ nombre, email, telefono, auth_id: userId });
    }

    redirect("/portal?mensaje=Cuenta creada. Revisá tu email para confirmar.");
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
        {/* LOGO */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
              boxShadow: "0 4px 12px rgba(79,142,247,0.3)",
            }}
          >
            ▦
          </div>
          <div>
            <div className="text-white font-extrabold text-base leading-tight">
              MotorAdmin Pro
            </div>
            <div
              className="text-xs font-medium uppercase"
              style={{
                color: "#6b7899",
                letterSpacing: "1.5px",
                fontSize: "9px",
              }}
            >
              Portal del Cliente
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{ background: "#202637", borderColor: "#2e3650" }}
        >
          <PortalLoginTabs
            error={error}
            mensaje={mensaje}
            loginAction={loginCliente}
            registrarAction={registrarCliente}
          />
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "#4a5068" }}>
          ¿Sos del taller?{" "}
          <a href="/login" style={{ color: "#4f8ef7" }}>
            Panel administrativo →
          </a>
        </p>
      </div>
    </div>
  );
}
