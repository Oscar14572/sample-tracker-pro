import { supabase } from "@/integrations/supabase/client";

export type TipoOrigen = "digital" | "pdf" | "imagen";
export type EstadoIngreso = "borrador" | "pendiente_revision" | "aprobado" | "rechazado";

export interface Ingreso {
  ingreso_id: string;
  numero_ingreso: string | null;
  fecha_remision: string | null;
  fecha_recepcion: string | null;
  codigo_proyecto: string | null;
  proyecto: string | null;
  cliente: string | null;
  ubicacion: string | null;
  entregado_por: string | null;
  recibido_por: string | null;
  observaciones_ingreso: string | null;
  tipo_origen: TipoOrigen;
  estado_ingreso: EstadoIngreso;
  confianza_extraccion: number | null;
  requiere_revision: boolean;
  revisado_por: string | null;
  fecha_revision: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface DatosIngreso {
  fecha_remision: string;
  fecha_recepcion: string;
  codigo_proyecto: string;
  proyecto: string;
  cliente: string;
  ubicacion: string;
  entregado_por: string;
  recibido_por: string;
  observaciones_ingreso: string;
}

export const datosVacios: DatosIngreso = {
  fecha_remision: "",
  fecha_recepcion: "",
  codigo_proyecto: "",
  proyecto: "",
  cliente: "",
  ubicacion: "",
  entregado_por: "",
  recibido_por: "",
  observaciones_ingreso: "",
};

export const etiquetasCampos: Record<keyof DatosIngreso, string> = {
  fecha_remision: "Fecha de remisión",
  fecha_recepcion: "Fecha de recepción",
  codigo_proyecto: "Código de proyecto",
  proyecto: "Proyecto",
  cliente: "Cliente",
  ubicacion: "Ubicación",
  entregado_por: "Entregado por",
  recibido_por: "Recibido por",
  observaciones_ingreso: "Observaciones",
};

export const etiquetasEstado: Record<EstadoIngreso, string> = {
  borrador: "Borrador",
  pendiente_revision: "Pendiente de revisión",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

export const etiquetasOrigen: Record<TipoOrigen, string> = {
  digital: "Digital",
  pdf: "PDF",
  imagen: "Imagen",
};

const vacio = (valor: string) => (valor.trim() === "" ? null : valor.trim());

export async function listarIngresos(): Promise<Ingreso[]> {
  const { data, error } = await supabase
    .from("ingresos")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Ingreso[];
}

export async function crearIngreso(params: {
  datos: DatosIngreso;
  tipo_origen: TipoOrigen;
  confianza_extraccion: number | null;
  revisado_por: string | null;
}): Promise<Ingreso> {
  const { datos, tipo_origen, confianza_extraccion, revisado_por } = params;
  const registro = {
    fecha_remision: vacio(datos.fecha_remision),
    fecha_recepcion: vacio(datos.fecha_recepcion),
    codigo_proyecto: vacio(datos.codigo_proyecto),
    proyecto: vacio(datos.proyecto),
    cliente: vacio(datos.cliente),
    ubicacion: vacio(datos.ubicacion),
    entregado_por: vacio(datos.entregado_por),
    recibido_por: vacio(datos.recibido_por),
    observaciones_ingreso: vacio(datos.observaciones_ingreso),
    tipo_origen,
    estado_ingreso: "aprobado",
    confianza_extraccion,
    requiere_revision: false,
    revisado_por: vacio(revisado_por ?? ""),
    fecha_revision: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("ingresos")
    .insert(registro as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Ingreso;
}

export function formatearFecha(valor: string | null): string {
  if (!valor) return "—";
  const [anio, mes, dia] = valor.split("-");
  if (!anio || !mes || !dia) return valor;
  return `${dia}/${mes}/${anio}`;
}
