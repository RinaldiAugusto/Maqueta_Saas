import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/DeleteButton";

export default async function VehiculosPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre")
    .order("nombre", { ascending: true });
  const { data: vehiculos } = await supabase
    .from("vehiculos")
    .select("*, clientes(nombre)")
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

  async function agregarVehiculo(formData: FormData) {
    "use server";
    const patente = formData.get("patente") as string;
    const marca = formData.get("marca") as string;
    const modelo = formData.get("modelo") as string;
    const año = formData.get("año") as string;
    const cliente_id = formData.get("cliente_id") as string;
    if (!patente || !cliente_id) return;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from("vehiculos")
      .insert({
        patente: patente.toUpperCase(),
        marca,
        modelo,
        año,
        cliente_id: parseInt(cliente_id),
        user_id: user?.id,
      });
    revalidatePath("/vehiculos");
  }

  async function eliminarVehiculo(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (!id) return;
    const supabase = await createClient();
    await supabase.from("vehiculos").delete().eq("id", id);
    revalidatePath("/vehiculos");
  }

  return (
    <div className="p-8 font-sans bg-gray-50/50 min-h-full">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
              Flota de Vehículos
            </h2>
            <p className="text-gray-500 mt-1">
              Registro de rodados y vinculación con titulares.
            </p>
          </div>
          <span className="text-5xl">🚘</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 rounded-xl bg-white p-6 shadow-sm border border-gray-200 h-fit">
            <h2 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">
              Ingresar Vehículo
            </h2>
            <form action={agregarVehiculo} className="space-y-3">
              <select
                name="cliente_id"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 bg-white text-gray-950 font-medium"
              >
                <option value="" className="text-gray-500">
                  Dueño del vehículo...
                </option>
                {clientes?.map((c) => (
                  <option key={c.id} value={c.id} className="text-gray-950">
                    {c.nombre}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="patente"
                required
                placeholder="Patente"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 uppercase text-gray-950 placeholder:text-gray-500 font-medium"
              />
              <input
                type="text"
                name="marca"
                required
                placeholder="Marca (Ej: Ford)"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 text-gray-950 placeholder:text-gray-500 font-medium"
              />
              <input
                type="text"
                name="modelo"
                required
                placeholder="Modelo (Ej: Fiesta)"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 text-gray-950 placeholder:text-gray-500 font-medium"
              />
              <input
                type="text"
                name="año"
                placeholder="Año"
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
              Parque Automotor Registrado
            </h2>
            {vehiculos && vehiculos.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {vehiculos.map((v) => (
                  <li
                    key={v.id}
                    className="py-4 flex justify-between items-center group"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-gray-950 text-lg">
                          {v.marca} {v.modelo} {v.año && `(${v.año})`}
                        </p>
                        <span className="font-mono text-xs bg-gray-900 text-white px-2 py-1 rounded">
                          {v.patente}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Titular: {v.clientes?.nombre}
                      </p>
                    </div>
                    <form
                      action={eliminarVehiculo}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <input type="hidden" name="id" value={v.id} />
                      <DeleteButton
                        mensaje={`¿Eliminar vehículo ${v.patente}?`}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <TrashIcon />
                      </DeleteButton>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No hay vehículos registrados.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
