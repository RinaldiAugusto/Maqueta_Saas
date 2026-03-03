import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/DeleteButton";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });

  const TrashIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );

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
    <div className="p-8 font-sans bg-gray-50/50 min-h-full">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
              Directorio de Clientes
            </h2>
            <p className="text-gray-500 mt-1">
              Alta y gestión de cartera de clientes.
            </p>
          </div>
          <span className="text-5xl">👥</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 rounded-xl bg-white p-6 shadow-sm border border-gray-200 h-fit">
            <h2 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">
              Nuevo Cliente
            </h2>
            <form action={agregarCliente} className="space-y-3">
              <input
                type="text"
                name="nombre"
                required
                placeholder="Nombre completo"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 text-gray-950 placeholder:text-gray-500 font-medium"
              />
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 text-gray-950 placeholder:text-gray-500 font-medium"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 text-gray-950 placeholder:text-gray-500 font-medium"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700 transition-colors"
              >
                Guardar
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">
              Listado Activo
            </h2>
            {clientes && clientes.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {clientes.map((c) => (
                  <li
                    key={c.id}
                    className="py-4 flex justify-between items-center group"
                  >
                    <div>
                      <p className="font-bold text-gray-950 text-lg">
                        {c.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        {c.telefono} • {c.email}
                      </p>
                    </div>
                    <form
                      action={eliminarCliente}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <input type="hidden" name="id" value={c.id} />
                      <DeleteButton
                        mensaje={`¿Eliminar a ${c.nombre}?`}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <TrashIcon />
                      </DeleteButton>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No hay clientes todavía.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
