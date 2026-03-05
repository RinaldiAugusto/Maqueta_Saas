import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "MotorAdmin Pro",
  description: "Sistema de gestión para talleres mecánicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <style>{`
          /* ── Scrollbars ── */

          /* Box admin (fondo #252b3b) */
          .scroll-box::-webkit-scrollbar { width: 4px; }
          .scroll-box::-webkit-scrollbar-track { background: #252b3b; border-radius: 999px; }
          .scroll-box::-webkit-scrollbar-thumb { background: #374060; border-radius: 999px; }
          .scroll-box::-webkit-scrollbar-thumb:hover { background: #4f8ef7; }

          /* Portal (fondo #1a1f2e) */
          .scroll-box-portal::-webkit-scrollbar { width: 4px; }
          .scroll-box-portal::-webkit-scrollbar-track { background: #1a1f2e; border-radius: 999px; }
          .scroll-box-portal::-webkit-scrollbar-thumb { background: #2e3650; border-radius: 999px; }
          .scroll-box-portal::-webkit-scrollbar-thumb:hover { background: #4f8ef7; }

          /* Firefox */
          .scroll-box { scrollbar-width: thin; scrollbar-color: #374060 #252b3b; }
          .scroll-box-portal { scrollbar-width: thin; scrollbar-color: #2e3650 #1a1f2e; }

          /* ── Animaciones de botones ── */
          @keyframes btn-pop {
            0%   { transform: scale(1); }
            40%  { transform: scale(0.93); }
            70%  { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          .btn-animate {
            transition: filter 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
          }
          .btn-animate:hover {
            filter: brightness(1.15);
            transform: translateY(-1px);
          }
          .btn-animate:active {
            animation: btn-pop 0.2s ease forwards;
          }

          /* Verde — Confirmar Cobro, Confirmar turno */
          .btn-green:hover {
            filter: brightness(1.1);
            box-shadow: 0 4px 14px rgba(52,211,153,0.3);
          }

          /* Azul — Guardar, Ingresar, PDF, MP */
          .btn-blue:hover {
            filter: brightness(1.12);
            box-shadow: 0 4px 14px rgba(79,142,247,0.3);
          }

          /* Rojo — Eliminar, Cancelar */
          .btn-red:hover {
            filter: brightness(1.1);
            box-shadow: 0 4px 14px rgba(248,113,113,0.25);
          }

          /* Ghost — Ver más, Volver, Cerrar */
          .btn-ghost:hover {
            filter: brightness(1.2);
          }
        `}</style>
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${jakarta.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
