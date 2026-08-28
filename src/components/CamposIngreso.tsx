import { etiquetasCampos, type DatosIngreso } from "@/lib/ingresos";

const camposFecha: (keyof DatosIngreso)[] = ["fecha_remision", "fecha_recepcion"];
const camposTexto: (keyof DatosIngreso)[] = [
  "codigo_proyecto",
  "proyecto",
  "cliente",
  "ubicacion",
  "entregado_por",
  "recibido_por",
];

interface Props {
  datos: DatosIngreso;
  onChange: (datos: DatosIngreso) => void;
  resaltarVacios?: boolean;
}

export function CamposIngreso({ datos, onChange, resaltarVacios = false }: Props) {
  const set = (campo: keyof DatosIngreso, valor: string) => onChange({ ...datos, [campo]: valor });

  const clase = (campo: keyof DatosIngreso) => {
    const vacio = datos[campo].trim() === "";
    const marcar = resaltarVacios && vacio && campo !== "codigo_proyecto" && campo !== "observaciones_ingreso";
    return `w-full rounded-[8px] bg-card px-3 py-2 text-[13px] ring-1 focus:outline-none focus:ring-2 ${
      marcar ? "bg-amber/5 ring-amber/40 focus:ring-amber/50" : "ring-border focus:ring-lead/30"
    }`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {camposFecha.map((campo) => (
          <div key={campo}>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              {etiquetasCampos[campo]}
            </label>
            <input
              type="date"
              value={datos[campo]}
              onChange={(e) => set(campo, e.target.value)}
              className={`${clase(campo)} font-mono`}
            />
          </div>
        ))}
        {camposTexto.map((campo) => (
          <div key={campo}>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              {etiquetasCampos[campo]}
              {campo === "codigo_proyecto" && (
                <span className="ml-1 normal-case tracking-normal text-muted-foreground/70">(opcional)</span>
              )}
            </label>
            <input
              type="text"
              value={datos[campo]}
              maxLength={200}
              placeholder={datos[campo] === "" ? "(vacío)" : undefined}
              onChange={(e) => set(campo, e.target.value)}
              className={clase(campo)}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          {etiquetasCampos.observaciones_ingreso}
        </label>
        <textarea
          rows={3}
          maxLength={1000}
          value={datos.observaciones_ingreso}
          onChange={(e) => set("observaciones_ingreso", e.target.value)}
          placeholder="Notas del ingreso…"
          className="w-full resize-none rounded-[8px] bg-card px-3 py-2 text-[13px] ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-lead/30"
        />
      </div>
    </div>
  );
}
