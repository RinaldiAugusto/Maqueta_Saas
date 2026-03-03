"use client";

export default function DeleteButton({
  mensaje,
  className,
  children,
}: {
  mensaje: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        // Si el usuario hace clic en "Cancelar", frenamos el envío del formulario
        if (!window.confirm(mensaje)) {
          e.preventDefault();
        }
      }}
      title="Eliminar"
    >
      {children}
    </button>
  );
}
