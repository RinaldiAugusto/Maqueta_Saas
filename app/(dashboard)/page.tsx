import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/DeleteButton";
import Link from "next/link";

// Agregamos searchParams para capturar lo que el usuario escribe en la URL
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q || "";
  const supabase = await createClient();

  // 1. DATA FETCHING
  const { data: vehiculos } = await supabase
    .from("vehiculos")
    .select("id, patente, marca, modelo");
  const { data: ordenesRaw } = await supabase
    .from("ordenes")
    .select(
      `
    id, 
    descripcion, 
    costo, 
    estado,
    vehiculo_id,
    vehiculos ( patente, marca, modelo )
  `,
    )
    .order("created_at", { ascending: false });

  // 2. NORMALIZACIÓN Y FILTRADO POR BÚSQUEDA
  const todasLasOrdenes =
    ordenesRaw
      ?.map((o) => {
        const e = o.estado?.trim();
        let estadoLimpio = "Pendiente";
        if (e === "En Curso" || e === "En curso") estadoLimpio = "En Curso";
        if (e === "Finalizado" || e === "Terminado")
          estadoLimpio = "Finalizado";
        return { ...o, estadoLimpio };
      })
      .filter(
        (o) =>
          o.vehiculos?.patente.toLowerCase().includes(query.toLowerCase()) ||
          o.vehiculos?.marca.toLowerCase().includes(query.toLowerCase()) ||
          o.descripcion.toLowerCase().includes(query.toLowerCase()),
      ) || [];

  const pendientes = todasLasOrdenes.filter(
    (o) => o.estadoLimpio === "Pendiente",
  );
  const enCurso = todasLasOrdenes.filter((o) => o.estadoLimpio === "En Curso");
  const historial = todasLasOrdenes.filter(
    (o) => o.estadoLimpio === "Finalizado",
  );

  // 3. MÉTRICAS (Basadas en el total, no solo en la búsqueda para no perder el norte financiero)
  const metricasGlobales =
    ordenesRaw?.map((o) => ({
      ...o,
      esFinalizado: o.estado === "Finalizado" || o.estado === "Terminado",
    })) || [];

  const cajaTotal = metricasGlobales
    .filter((o) => o.esFinalizado)
    .reduce((acc, curr) => acc + (Number(curr.costo) || 0), 0);
  const cuentasPorCobrar = metricasGlobales
    .filter((o) => !o.esFinalizado)
    .reduce((acc, curr) => acc + (Number(curr.costo) || 0), 0);

  // SERVER ACTIONS
  async function agregarOrden(formData: FormData) {
    "use server";
    const vehiculo_id = formData.get("vehiculo_id");
    const descripcion = formData.get("descripcion");
    const costo = formData.get("costo");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("ordenes").insert({
      vehiculo_id: parseInt(vehiculo_id as string),
      descripcion,
      costo: parseInt(costo as string) || 0,
      user_id: user?.id,
      estado: "Pendiente",
    });
    revalidatePath("/");
  }

  async function moverEstado(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const estadoActual = formData.get("estado");
    let nuevoEstado = estadoActual === "Pendiente" ? "En Curso" : "Finalizado";
    const supabase = await createClient();
    await supabase.from("ordenes").update({ estado: nuevoEstado }).eq("id", id);
    revalidatePath("/");
  }

  async function eliminarOrden(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const supabase = await createClient();
    await supabase.from("ordenes").delete().eq("id", id);
    revalidatePath("/");
  }

  const TrashIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-950">
      <div className="mx-auto max-w-7xl">
        {/* HEADER CON BUSCADOR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              Gestión Operativa
            </h2>
            <p className="text-gray-500 font-medium">
              Control total de reparaciones y facturación.
            </p>
          </div>

          <form className="w-full md:w-96 relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar por patente o marca..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-950"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          </form>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-green-600">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Balance Cobrado
            </p>
            <p className="text-3xl font-black text-gray-950">
              ${new Intl.NumberFormat("es-AR").format(cajaTotal)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-orange-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Pendiente de Cobro
            </p>
            <p className="text-3xl font-black text-gray-950">
              ${new Intl.NumberFormat("es-AR").format(cuentasPorCobrar)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-blue-600">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Vehículos en Taller
            </p>
            <p className="text-3xl font-black text-gray-950">
              {pendientes.length + enCurso.length}
            </p>
          </div>
        </div>

        {/* CARGA RÁPIDA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <h3 className="text-xs font-black uppercase text-gray-400 mb-4">
            Ingresar Nuevo Vehículo a Reparación
          </h3>
          <form
            action={agregarOrden}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <select
              name="vehiculo_id"
              required
              className="rounded-xl border border-gray-300 p-3 text-gray-950 font-bold bg-gray-50 outline-none focus:border-indigo-600"
            >
              <option value="">Seleccionar auto...</option>
              {vehiculos?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.patente} - {v.marca}
                </option>
              ))}
            </select>
            <input
              name="descripcion"
              required
              placeholder="Falla o servicio..."
              className="md:col-span-2 rounded-xl border border-gray-300 p-3 text-gray-950 font-bold bg-gray-50 outline-none focus:border-indigo-600"
            />
            <div className="flex gap-2">
              <input
                type="number"
                name="costo"
                placeholder="$"
                className="w-full rounded-xl border border-gray-300 p-3 text-gray-950 font-bold bg-gray-50 outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white font-black px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                INGRESAR
              </button>
            </div>
          </form>
        </div>

        {/* KANBAN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PENDIENTES */}
          <div className="bg-gray-200/50 p-4 rounded-3xl border border-gray-300">
            <h3 className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest text-center">
              1. Pendientes de Revisión
            </h3>
            <div className="space-y-4">
              {pendientes.map((o) => (
                <div
                  key={o.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] bg-gray-950 text-white px-3 py-1 rounded-full font-bold">
                      {o.vehiculos?.patente}
                    </span>
                    <form action={eliminarOrden}>
                      <input type="hidden" name="id" value={o.id} />
                      <DeleteButton
                        mensaje="¿Borrar?"
                        className="text-red-400 hover:scale-110 transition-transform"
                      >
                        <TrashIcon />
                      </DeleteButton>
                    </form>
                  </div>
                  <h4 className="font-black text-gray-950 text-lg leading-tight">
                    {o.vehiculos?.marca} {o.vehiculos?.modelo}
                  </h4>
                  <p className="text-xs text-gray-600 font-bold mt-2 mb-4 leading-relaxed">
                    {o.descripcion}
                  </p>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-black text-gray-950 text-xl">
                      ${new Intl.NumberFormat("es-AR").format(o.costo)}
                    </span>
                    <form action={moverEstado}>
                      <input type="hidden" name="id" value={o.id} />
                      <input
                        type="hidden"
                        name="estado"
                        value={o.estadoLimpio}
                      />
                      <button
                        type="submit"
                        className="text-[10px] font-black bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md transition-all uppercase"
                      >
                        SIGUIENTE ➔
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EN CURSO */}
          <div className="bg-orange-100/50 p-4 rounded-3xl border border-orange-200">
            <h3 className="text-[10px] font-black text-orange-600 uppercase mb-4 tracking-widest text-center">
              2. En Proceso de Taller
            </h3>
            <div className="space-y-4">
              {enCurso.map((o) => (
                <div
                  key={o.id}
                  className="bg-white p-5 rounded-2xl shadow-md border-b-8 border-orange-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] bg-orange-600 text-white px-3 py-1 rounded-full font-bold">
                      {o.vehiculos?.patente}
                    </span>
                  </div>
                  <h4 className="font-black text-gray-950 text-lg leading-tight">
                    {o.vehiculos?.marca} {o.vehiculos?.modelo}
                  </h4>
                  <p className="text-xs text-orange-600 font-black mt-2 mb-4 italic uppercase">
                    🔧 Trabajando en el vehículo
                  </p>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-black text-gray-950 text-xl">
                      ${new Intl.NumberFormat("es-AR").format(o.costo)}
                    </span>
                    <form action={moverEstado}>
                      <input type="hidden" name="id" value={o.id} />
                      <input
                        type="hidden"
                        name="estado"
                        value={o.estadoLimpio}
                      />
                      <button
                        type="submit"
                        className="text-[10px] font-black bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 shadow-md transition-all uppercase"
                      >
                        SIGUIENTE ➔
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINALIZADO */}
          <div className="bg-green-100/50 p-4 rounded-3xl border border-green-200">
            <h3 className="text-[10px] font-black text-green-700 uppercase mb-4 tracking-widest text-center">
              3. Historial de Cobros
            </h3>
            <div className="space-y-3">
              {historial.map((o) => (
                <div
                  key={o.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-green-200"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-gray-950 text-sm">
                      {o.vehiculos?.marca} {o.vehiculos?.modelo}
                    </h4>
                    <span className="font-black text-green-700 text-base">
                      ${new Intl.NumberFormat("es-AR").format(o.costo)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest">
                    {o.vehiculos?.patente}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
