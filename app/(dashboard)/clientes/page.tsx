import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/DeleteButton";
import ClienteDetalle from "@/components/ClienteDetalle";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q || "";
  const supabase = await createClient();

  let clientesQuery = supabase
    .from("clientes")
    .select("*, vehiculos ( id, patente, marca, modelo, año )")
    .order("created_at", { ascending: false });

  if (query) clientesQuery = clientesQuery.ilike("nombre", `%${query}%`);

  const { data: clientes } = await clientesQuery;

  const { data: totalData } = await supabase
    .from("clientes")
    .select("id", { count: "exact" });

  async function agregarCliente(formData: FormData) {
    "use server";
    const nombre = formData.get("nombre") as string;
    const telefono = formData.get("telefono") as string;
    const email = formData.get("email") as string;
    if (!nombre) return;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from("clientes")
      .insert({ nombre, telefono, email, user_id: user?.id });
    revalidatePath("/clientes");
  }

  async function eliminarCliente(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (!id) return;
    const supabase = await createClient();
    await supabase.from("clientes").delete().eq("id", id);
    revalidatePath("/clientes");
  }

  return (
    <div
      className="p-6 md:p-8"
      style={{
        background: "#1a1f2e",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div
          className="flex justify-between items-center mb-6 pb-5 border-b"
          style={{ borderColor: "#2e3650" }}
        >
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: "#ffffff", letterSpacing: "-0.3px" }}
            >
              Base de Clientes
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#6b7899" }}>
              Registro y administración de titulares
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: "rgba(79,142,247,0.12)",
              color: "#4f8ef7",
              border: "1px solid rgba(79,142,247,0.2)",
            }}
          >
            ◉
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FORM */}
          <div
            className="col-span-1 rounded-xl border p-5 h-fit"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            <p
              className="text-xs font-bold uppercase mb-4"
              style={{ color: "#6b7899", letterSpacing: "1.5px" }}
            >
              Nuevo Cliente
            </p>
            <form action={agregarCliente} className="flex flex-col gap-3">
              {[
                {
                  name: "nombre",
                  placeholder: "Nombre completo",
                  type: "text",
                  required: true,
                },
                {
                  name: "telefono",
                  placeholder: "Teléfono",
                  type: "text",
                  required: false,
                },
                {
                  name: "email",
                  placeholder: "Email",
                  type: "email",
                  required: false,
                },
              ].map(({ name, placeholder, type, required }) => (
                <input
                  key={name}
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  required={required}
                  className="rounded-lg text-sm outline-none w-full"
                  style={{
                    background: "#202637",
                    border: "1px solid #374060",
                    padding: "9px 13px",
                    color: "#dde3f0",
                    fontFamily: "inherit",
                  }}
                />
              ))}
              <button
                type="submit"
                className="w-full rounded-lg text-sm font-bold text-white transition-all mt-1"
                style={{
                  background: "#4f8ef7",
                  padding: "9px 13px",
                  fontFamily: "inherit",
                }}
              >
                + Guardar Cliente
              </button>
            </form>
          </div>

          {/* LISTA */}
          <div
            className="col-span-1 md:col-span-2 rounded-xl border p-5"
            style={{ background: "#252b3b", borderColor: "#2e3650" }}
          >
            {/* Header con buscador */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b"
              style={{ borderColor: "#2e3650" }}
            >
              <div className="flex items-center gap-3">
                <p
                  className="text-xs font-bold uppercase"
                  style={{ color: "#6b7899", letterSpacing: "1.5px" }}
                >
                  Listado Activo
                </p>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: "#2a3145", color: "#6b7899" }}
                >
                  {totalData?.length || 0} registros
                </span>
              </div>
              {/* Buscador */}
              <form className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Buscar por nombre..."
                  className="rounded-lg text-sm outline-none"
                  style={{
                    background: "#202637",
                    border: "1px solid #374060",
                    padding: "7px 12px 7px 32px",
                    color: "#dde3f0",
                    fontFamily: "inherit",
                    width: "200px",
                  }}
                />
                <span
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "#6b7899" }}
                >
                  ⌕
                </span>
                {query && (
                  <a
                    href="/clientes"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: "#6b7899" }}
                  >
                    ✕
                  </a>
                )}
              </form>
            </div>

            {query && (
              <p className="text-xs mb-3" style={{ color: "#6b7899" }}>
                Resultados para:{" "}
                <span style={{ color: "#4f8ef7" }}>"{query}"</span> —{" "}
                {clientes?.length || 0} encontrados
              </p>
            )}

            {clientes && clientes.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {clientes.map((c) => (
                  <ClienteDetalle
                    key={c.id}
                    cliente={c}
                    vehiculos={
                      (c.vehiculos as {
                        id: number;
                        patente: string;
                        marca: string;
                        modelo: string;
                        año: string;
                      }[]) || []
                    }
                    eliminarAction={eliminarCliente}
                  />
                ))}
              </ul>
            ) : (
              <p
                className="text-center text-xs py-10"
                style={{ color: "#6b7899" }}
              >
                {query
                  ? "No se encontraron clientes con ese nombre."
                  : "No hay clientes registrados todavía."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
