import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: orden } = await supabase
    .from("ordenes")
    .select(`*, vehiculos ( *, clientes ( nombre, telefono, email ) )`)
    .eq("id", id)
    .single();

  if (!orden)
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

  const { data: perfil } = await supabase
    .from("perfil_taller")
    .select("*")
    .eq("id", 1)
    .single();

  const vehiculo = orden.vehiculos as {
    patente: string;
    marca: string;
    modelo: string;
    año: string;
    clientes: { nombre: string; telefono: string; email: string } | null;
  } | null;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const colorPrimary = rgb(0.31, 0.55, 0.97);
  const colorDark = rgb(0.1, 0.13, 0.18);
  const colorGray = rgb(0.42, 0.47, 0.6);
  const colorGreen = rgb(0.2, 0.83, 0.6);
  const colorWhite = rgb(1, 1, 1);
  const colorBorder = rgb(0.18, 0.21, 0.32);
  const colorCard = rgb(0.15, 0.17, 0.24);

  const nombreTaller = perfil?.nombre ?? "MotorAdmin Pro";
  const sloganTaller = perfil?.slogan ?? "Sistema de gestión profesional";
  const telTaller = perfil?.telefono ?? "";
  const emailTaller = perfil?.email ?? "";
  const dirTaller = perfil?.direccion ?? "";

  // ── HEADER ──
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: colorDark,
  });
  page.drawRectangle({
    x: 40,
    y: height - 75,
    width: 40,
    height: 40,
    color: colorPrimary,
  });
  page.drawText("M", {
    x: 52,
    y: height - 57,
    size: 18,
    font: fontBold,
    color: colorWhite,
  });
  page.drawText(nombreTaller, {
    x: 92,
    y: height - 55,
    size: 16,
    font: fontBold,
    color: colorWhite,
  });
  page.drawText(sloganTaller, {
    x: 92,
    y: height - 72,
    size: 8,
    font: fontRegular,
    color: colorGray,
  });

  const contactoX = width - 200;
  let contactoY = height - 50;
  if (telTaller) {
    page.drawText(`Tel: ${telTaller}`, {
      x: contactoX,
      y: contactoY,
      size: 8,
      font: fontRegular,
      color: colorGray,
    });
    contactoY -= 13;
  }
  if (emailTaller) {
    page.drawText(emailTaller, {
      x: contactoX,
      y: contactoY,
      size: 8,
      font: fontRegular,
      color: colorGray,
    });
    contactoY -= 13;
  }
  if (dirTaller) {
    page.drawText(dirTaller, {
      x: contactoX,
      y: contactoY,
      size: 8,
      font: fontRegular,
      color: colorGray,
    });
  }

  let y = height - 120;

  // ── TÍTULO ──
  page.drawText("PRESUPUESTO", {
    x: 40,
    y,
    size: 22,
    font: fontBold,
    color: colorDark,
  });
  page.drawText(`N° ${id.toString().padStart(5, "0")}`, {
    x: width - 130,
    y,
    size: 12,
    font: fontBold,
    color: colorPrimary,
  });
  y -= 16;
  page.drawText(
    new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    { x: 40, y, size: 9, font: fontRegular, color: colorGray },
  );
  y -= 25;
  page.drawRectangle({
    x: 40,
    y,
    width: width - 80,
    height: 1,
    color: colorBorder,
  });
  y -= 25;

  // ── VEHÍCULO + CLIENTE ──
  const col1X = 40;
  const col2X = width / 2 + 10;
  const inicioColumnas = y;

  page.drawText("VEHÍCULO", {
    x: col1X,
    y,
    size: 8,
    font: fontBold,
    color: colorPrimary,
  });
  y -= 15;
  [
    {
      label: "Marca y Modelo",
      value: `${vehiculo?.marca ?? "—"} ${vehiculo?.modelo ?? ""}`,
    },
    { label: "Patente", value: vehiculo?.patente ?? "—" },
    { label: "Año", value: vehiculo?.año ?? "—" },
  ].forEach(({ label, value }) => {
    page.drawText(label + ":", {
      x: col1X,
      y,
      size: 9,
      font: fontBold,
      color: colorGray,
    });
    page.drawText(value, {
      x: col1X + 90,
      y,
      size: 9,
      font: fontRegular,
      color: colorDark,
    });
    y -= 14;
  });

  let clienteY = inicioColumnas;
  page.drawText("CLIENTE", {
    x: col2X,
    y: clienteY,
    size: 8,
    font: fontBold,
    color: colorPrimary,
  });
  clienteY -= 15;
  [
    { label: "Nombre", value: vehiculo?.clientes?.nombre ?? "—" },
    { label: "Teléfono", value: vehiculo?.clientes?.telefono ?? "—" },
    { label: "Email", value: vehiculo?.clientes?.email ?? "—" },
  ].forEach(({ label, value }) => {
    page.drawText(label + ":", {
      x: col2X,
      y: clienteY,
      size: 9,
      font: fontBold,
      color: colorGray,
    });
    page.drawText(value, {
      x: col2X + 70,
      y: clienteY,
      size: 9,
      font: fontRegular,
      color: colorDark,
    });
    clienteY -= 14;
  });

  y -= 20;
  page.drawRectangle({
    x: 40,
    y,
    width: width - 80,
    height: 1,
    color: colorBorder,
  });
  y -= 25;

  // ── TABLA SERVICIOS ──
  page.drawText("DETALLE DEL SERVICIO", {
    x: 40,
    y,
    size: 8,
    font: fontBold,
    color: colorPrimary,
  });
  y -= 15;

  // Header tabla
  page.drawRectangle({
    x: 40,
    y: y - 6,
    width: width - 80,
    height: 22,
    color: colorDark,
  });
  page.drawText("DESCRIPCIÓN", {
    x: 52,
    y: y + 2,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });
  page.drawText("CANT.", {
    x: width - 180,
    y: y + 2,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });
  page.drawText("PRECIO", {
    x: width - 130,
    y: y + 2,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });
  page.drawText("SUBTOTAL", {
    x: width - 80,
    y: y + 2,
    size: 8,
    font: fontBold,
    color: colorWhite,
  });
  y -= 20;

  // Fila servicio
  page.drawRectangle({
    x: 40,
    y: y - 6,
    width: width - 80,
    height: 22,
    color: colorCard,
  });
  const desc = (orden.descripcion ?? "Servicio").slice(0, 50);
  const costoFmt = `$${new Intl.NumberFormat("es-AR").format(orden.costo)}`;
  page.drawText(desc, {
    x: 52,
    y: y + 2,
    size: 9,
    font: fontRegular,
    color: colorDark,
  });
  page.drawText("1", {
    x: width - 172,
    y: y + 2,
    size: 9,
    font: fontRegular,
    color: colorDark,
  });
  page.drawText(costoFmt, {
    x: width - 130,
    y: y + 2,
    size: 9,
    font: fontRegular,
    color: colorDark,
  });
  page.drawText(costoFmt, {
    x: width - 80,
    y: y + 2,
    size: 9,
    font: fontBold,
    color: colorDark,
  });
  y -= 30;

  // ── TOTAL ──
  page.drawRectangle({
    x: width - 200,
    y: y - 8,
    width: 160,
    height: 36,
    color: colorPrimary,
  });
  page.drawText("TOTAL", {
    x: width - 190,
    y: y + 10,
    size: 9,
    font: fontBold,
    color: colorWhite,
  });
  page.drawText(costoFmt, {
    x: width - 190,
    y: y - 2,
    size: 14,
    font: fontBold,
    color: colorWhite,
  });
  y -= 50;

  // ── ESTADO DE PAGO ──
  if (orden.pagado) {
    page.drawRectangle({
      x: 40,
      y: y - 6,
      width: 120,
      height: 22,
      color: rgb(0.1, 0.28, 0.2),
    });
    page.drawText("PAGADO", {
      x: 52,
      y: y + 2,
      size: 9,
      font: fontBold,
      color: colorGreen,
    });
    if (orden.metodo_pago) {
      page.drawText(`Metodo: ${orden.metodo_pago}`, {
        x: 170,
        y: y + 2,
        size: 9,
        font: fontRegular,
        color: colorGray,
      });
    }
  } else {
    page.drawRectangle({
      x: 40,
      y: y - 6,
      width: 150,
      height: 22,
      color: rgb(0.25, 0.22, 0.1),
    });
    page.drawText("PENDIENTE DE PAGO", {
      x: 52,
      y: y + 2,
      size: 9,
      font: fontBold,
      color: rgb(0.98, 0.75, 0.14),
    });
  }

  y -= 40;
  page.drawRectangle({
    x: 40,
    y,
    width: width - 80,
    height: 1,
    color: colorBorder,
  });
  y -= 20;

  // ── NOTAS ──
  page.drawText("Notas:", {
    x: 40,
    y,
    size: 9,
    font: fontBold,
    color: colorGray,
  });
  y -= 14;
  page.drawText(
    "Este presupuesto tiene una validez de 15 dias desde la fecha de emision.",
    { x: 40, y, size: 8, font: fontRegular, color: colorGray },
  );
  y -= 12;
  page.drawText(
    "Los precios incluyen mano de obra. Repuestos sujetos a disponibilidad.",
    { x: 40, y, size: 8, font: fontRegular, color: colorGray },
  );

  // ── FOOTER ──
  page.drawRectangle({ x: 0, y: 0, width, height: 35, color: colorDark });
  page.drawText(nombreTaller, {
    x: 40,
    y: 13,
    size: 8,
    font: fontBold,
    color: colorGray,
  });
  page.drawText("Generado con MotorAdmin Pro", {
    x: width - 175,
    y: 13,
    size: 8,
    font: fontRegular,
    color: colorGray,
  });

  // ── SERIALIZAR — convertir a Buffer para NextResponse ──
  const pdfBytes = await doc.save();
  const buffer = Buffer.from(pdfBytes);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="presupuesto-${id}.pdf"`,
    },
  });
}
