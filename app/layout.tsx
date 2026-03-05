import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MotorAdmin Pro",
  description: "Sistema de gestión de taller",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <style>{`
          .scroll-box { scrollbar-width: thin; }
          .scroll-box::-webkit-scrollbar { width: 4px; }
          .scroll-box::-webkit-scrollbar-track { background: #252b3b; }
          .scroll-box::-webkit-scrollbar-thumb { background: #374060; border-radius: 999px; }
          .scroll-box::-webkit-scrollbar-thumb:hover { background: #4f8ef7; }

          .scroll-box-portal { scrollbar-width: thin; }
          .scroll-box-portal::-webkit-scrollbar { width: 4px; }
          .scroll-box-portal::-webkit-scrollbar-track { background: #1a1f2e; }
          .scroll-box-portal::-webkit-scrollbar-thumb { background: #2e3650; border-radius: 999px; }
          .scroll-box-portal::-webkit-scrollbar-thumb:hover { background: #4f8ef7; }

          @keyframes btn-pop {
            0%   { transform: scale(1); }
            40%  { transform: scale(0.93); }
            70%  { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .btn-animate { transition: filter 0.15s, box-shadow 0.15s, transform 0.15s; }
          .btn-animate:hover { filter: brightness(1.1); transform: translateY(-1px); }
          .btn-animate:active { animation: btn-pop 0.2s ease forwards; }
          .btn-blue:hover  { box-shadow: 0 4px 12px rgba(79,142,247,0.3); }
          .btn-green:hover { box-shadow: 0 4px 12px rgba(52,211,153,0.3); }
          .btn-red:hover   { box-shadow: 0 4px 12px rgba(248,113,113,0.25); }
        `}</style>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
