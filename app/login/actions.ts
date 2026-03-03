"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Recibimos los datos del formulario
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Intentamos iniciar sesión
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(
      "/login?message=No se pudo iniciar sesión. Verifica tus datos.",
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log("🔍 URL DETECTADA:", `|${url}|`); // Las barras | nos mostrarán si hay espacios escondidos

  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    // 👇 AGREGA ESTA LÍNEA AQUÍ
    console.log("❌ ERROR SUPABASE:", error.message);
    // 👆 FIN DE LA LÍNEA NUEVA
    return redirect("/login?message=Error al registrarse");
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Revisa tu email para confirmar la cuenta");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}
