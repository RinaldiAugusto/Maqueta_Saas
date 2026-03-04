import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  const { data: perfil } = await supabase
    .from("perfil_taller")
    .select("*")
    .eq("id", 1)
    .single();

  async function guardarPerfil(formData: FormData) {
    "use server";
    const supabase = await createClient();
    await supabase
      .from("perfil_taller")
      .update({
        nombre: formData.get("nombre") as string,
        slogan: formData.get("slogan") as string,
        direccion: formData.get("direccion") as string,
        telefono: formData.get("telefono") as string,
        email: formData.get("email") as string,
        instagram: formData.get("instagram") as string,
        facebook: formData.get("facebook") as string,
        whatsapp: formData.get("whatsapp") as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    revalidatePath("/configuracion");
  }

  const inputStyle = {
    background: "#202637",
    border: "1px solid #374060",
    padding: "10px 14px",
    color: "#dde3f0",
    fontFamily: "inherit",
    borderRadius: "8px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  const labelStyle = {
    color: "#a8b4cc",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "6px",
    display: "block",
  } as React.CSSProperties;

  return (
    <div
      className="p-6 md:p-8"
      style={{
        background: "#1a1f2e",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}
        <div
          className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-5 border-b"
          style={{ borderColor: "#2e3650" }}
        >
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: "#ffffff", letterSpacing: "-0.3px" }}
            >
              Perfil del Taller
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#6b7899" }}>
              Esta información aparece en los PDFs y en el portal del cliente
            </p>
          </div>
          {perfil?.updated_at && (
            <span
              className="text-xs px-3 py-1.5 rounded-lg border self-start md:self-auto"
              style={{
                background: "#252b3b",
                borderColor: "#374060",
                color: "#6b7899",
              }}
            >
              Actualizado:{" "}
              {new Date(perfil.updated_at).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <form action={guardarPerfil} className="flex flex-col gap-5">
          {/* IDENTIDAD */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <p
              className="text-xs font-bold uppercase mb-4"
              style={{ color: "#6b7899", letterSpacing: "1.5px" }}
            >
              Identidad
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex flex-col">
                <label style={labelStyle}>Nombre del taller *</label>
                <input
                  name="nombre"
                  required
                  defaultValue={perfil?.nombre ?? ""}
                  placeholder="Ej: Taller Mecánico García"
                  style={inputStyle}
                />
              </div>
              <div className="md:col-span-2 flex flex-col">
                <label style={labelStyle}>
                  Slogan{" "}
                  <span style={{ color: "#6b7899", fontWeight: 400 }}>
                    (opcional)
                  </span>
                </label>
                <input
                  name="slogan"
                  defaultValue={perfil?.slogan ?? ""}
                  placeholder="Ej: Tu vehículo en las mejores manos"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* CONTACTO */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <p
              className="text-xs font-bold uppercase mb-4"
              style={{ color: "#6b7899", letterSpacing: "1.5px" }}
            >
              Contacto
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label style={labelStyle}>Teléfono</label>
                <input
                  name="telefono"
                  defaultValue={perfil?.telefono ?? ""}
                  placeholder="+54 11 1234-5678"
                  style={inputStyle}
                />
              </div>
              <div className="flex flex-col">
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={perfil?.email ?? ""}
                  placeholder="taller@email.com"
                  style={inputStyle}
                />
              </div>
              <div className="md:col-span-2 flex flex-col">
                <label style={labelStyle}>Dirección</label>
                <input
                  name="direccion"
                  defaultValue={perfil?.direccion ?? ""}
                  placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                  style={inputStyle}
                />
              </div>
              <div className="flex flex-col">
                <label style={labelStyle}>
                  WhatsApp{" "}
                  <span style={{ color: "#6b7899", fontWeight: 400 }}>
                    (número con código de país)
                  </span>
                </label>
                <input
                  name="whatsapp"
                  defaultValue={perfil?.whatsapp ?? ""}
                  placeholder="5491112345678"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* REDES SOCIALES */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <p
              className="text-xs font-bold uppercase mb-4"
              style={{ color: "#6b7899", letterSpacing: "1.5px" }}
            >
              Redes Sociales
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label style={labelStyle}>Instagram</label>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm flex-shrink-0"
                    style={{ color: "#6b7899" }}
                  >
                    @
                  </span>
                  <input
                    name="instagram"
                    defaultValue={perfil?.instagram ?? ""}
                    placeholder="tallergarcía"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label style={labelStyle}>Facebook</label>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs flex-shrink-0 font-semibold"
                    style={{ color: "#6b7899" }}
                  >
                    fb.com/
                  </span>
                  <input
                    name="facebook"
                    defaultValue={perfil?.facebook ?? ""}
                    placeholder="tallergarcía"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          {perfil?.nombre && (
            <div
              className="rounded-xl border p-5"
              style={{ background: "#252b3b", borderColor: "#2e3650" }}
            >
              <p
                className="text-xs font-bold uppercase mb-4"
                style={{ color: "#6b7899", letterSpacing: "1.5px" }}
              >
                Vista previa — Encabezado de PDF
              </p>
              <div
                className="rounded-lg p-4 border"
                style={{ background: "#1a1f2e", borderColor: "#374060" }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p
                      className="font-extrabold text-lg"
                      style={{ color: "#ffffff", letterSpacing: "-0.3px" }}
                    >
                      {perfil.nombre}
                    </p>
                    {perfil.slogan && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#6b7899" }}
                      >
                        {perfil.slogan}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    {perfil.telefono && (
                      <p className="text-xs" style={{ color: "#a8b4cc" }}>
                        ☎ {perfil.telefono}
                      </p>
                    )}
                    {perfil.email && (
                      <p className="text-xs" style={{ color: "#a8b4cc" }}>
                        ✉ {perfil.email}
                      </p>
                    )}
                    {perfil.direccion && (
                      <p className="text-xs" style={{ color: "#a8b4cc" }}>
                        ⊙ {perfil.direccion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GUARDAR */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg text-sm font-bold text-white transition-all active:scale-95 px-8 py-3"
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
                fontFamily: "inherit",
                boxShadow: "0 4px 12px rgba(79,142,247,0.3)",
              }}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
