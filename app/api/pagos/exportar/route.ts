import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: pagos } = await supabase
    .from("ordenes")
    .select(
      `id, descripcion, costo, monto_cobrado, metodo_pago, fecha_pago, created_at, vehiculos ( patente, marca, modelo, clientes ( nombre, telefono ) )`,
    )
    .eq("pagado", true)
    .order("fecha_pago", { ascending: false });

  type PagoRow = {
    id: number;
    descripcion: string;
    costo: number;
    monto_cobrado: number | null;
    metodo_pago: string | null;
    fecha_pago: string | null;
    created_at: string;
    vehiculos: {
      patente: string;
      marca: string;
      modelo: string;
      clientes: { nombre: string; telefono: string } | null;
    } | null;
  };

  const rows = (pagos ?? []) as unknown as PagoRow[];

  // Usamos ; como separador (estándar Excel español/latinoamérica)
  const SEP = ";";

  const headers = [
    "ID",
    "Fecha Pago",
    "Patente",
    "Vehiculo",
    "Cliente",
    "Telefono",
    "Descripcion",
    "Presupuesto",
    "Monto Cobrado",
    "Metodo de Pago",
  ].join(SEP);

  const csvRows = rows.map((p) => {
    const fechaPago = p.fecha_pago
      ? new Date(p.fecha_pago).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";
    const vehiculo =
      `${p.vehiculos?.marca ?? ""} ${p.vehiculos?.modelo ?? ""}`.trim();
    const desc = (p.descripcion ?? "").replace(/;/g, ","); // evitar romper columnas

    return [
      p.id,
      fechaPago,
      p.vehiculos?.patente ?? "",
      vehiculo,
      p.vehiculos?.clientes?.nombre ?? "",
      p.vehiculos?.clientes?.telefono ?? "",
      desc,
      p.costo,
      p.monto_cobrado ?? p.costo,
      p.metodo_pago ?? "",
    ].join(SEP);
  });

  // BOM UTF-8 para que Excel abra correctamente con tildes y ñ
  const BOM = "\uFEFF";
  const csv = BOM + [headers, ...csvRows].join("\r\n");

  const fecha = new Date().toLocaleDateString("es-AR").replace(/\//g, "-");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pagos-${fecha}.csv"`,
    },
  });
}
