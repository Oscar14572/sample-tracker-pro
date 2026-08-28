import { etiquetasEstado, type EstadoIngreso } from "@/lib/ingresos";

const estilos: Record<EstadoIngreso, string> = {
  borrador: "bg-muted text-muted-foreground ring-border",
  pendiente_revision: "bg-amber/10 text-amber ring-amber/25",
  aprobado: "bg-approve/10 text-approve ring-approve/25",
  rechazado: "bg-destructive/10 text-destructive ring-destructive/25",
};

export function EstadoBadge({ estado }: { estado: EstadoIngreso }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${estilos[estado]}`}
    >
      {etiquetasEstado[estado]}
    </span>
  );
}
