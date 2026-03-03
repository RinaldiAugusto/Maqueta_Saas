import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            MotorAdmin Pro
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Ingresá a tu panel de control
          </p>
        </div>

        <form className="flex flex-col gap-5">
          <div>
            <label
              className="block text-sm font-bold text-gray-700 mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="taller@mail.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
            />
          </div>

          <div>
            <label
              className="block text-sm font-bold text-gray-700 mb-1"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              formAction={login}
              className="flex-1 rounded-lg bg-gray-900 px-4 py-3 font-bold text-white hover:bg-gray-800 transition-colors shadow-md"
            >
              Ingresar
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded-lg bg-white px-4 py-3 font-bold text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Registrarme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
