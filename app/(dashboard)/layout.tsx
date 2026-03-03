"use client"; // Lo convertimos a cliente para usar usePathname

import { usePathname } from "next/navigation";
import { signOut } from "../login/actions";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Función para saber si el link está activo
  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
      isActive(path)
        ? "bg-indigo-600 text-white shadow-md"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            MotorAdmin Pro
          </h1>
          <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider font-semibold">
            Taller System
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/" className={linkClass("/")}>
            <span>📊</span> Tablero General
          </Link>

          <Link href="/clientes" className={linkClass("/clientes")}>
            <span>👥</span> Base de Clientes
          </Link>

          <Link href="/vehiculos" className={linkClass("/vehiculos")}>
            <span>🚘</span> Flota de Vehículos
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-950">
          <form action={signOut}>
            <button className="w-full rounded-md bg-red-500/10 text-red-500 px-4 py-2.5 text-sm font-bold hover:bg-red-600 hover:text-white transition-all border border-red-500/20">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
