CREATE TABLE public.ingresos (
  ingreso_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ingreso text UNIQUE,
  fecha_remision date,
  fecha_recepcion date,
  codigo_proyecto text,
  proyecto text,
  cliente text,
  ubicacion text,
  entregado_por text,
  recibido_por text,
  observaciones_ingreso text,
  tipo_origen text NOT NULL DEFAULT 'digital',
  estado_ingreso text NOT NULL DEFAULT 'borrador',
  confianza_extraccion numeric,
  requiere_revision boolean NOT NULL DEFAULT false,
  revisado_por text,
  fecha_revision timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ingresos_tipo_origen_check CHECK (tipo_origen IN ('digital','pdf','imagen')),
  CONSTRAINT ingresos_estado_check CHECK (estado_ingreso IN ('borrador','pendiente_revision','aprobado','rechazado'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingresos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingresos TO anon;
GRANT ALL ON public.ingresos TO service_role;

ALTER TABLE public.ingresos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingresos_lectura_publica" ON public.ingresos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ingresos_insert_publico" ON public.ingresos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "ingresos_update_publico" ON public.ingresos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ingresos_delete_publico" ON public.ingresos FOR DELETE TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.set_numero_ingreso()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  anio text;
  siguiente integer;
BEGIN
  IF NEW.numero_ingreso IS NULL THEN
    anio := to_char(COALESCE(NEW.fecha_recepcion, current_date), 'YYYY');
    PERFORM pg_advisory_xact_lock(hashtext('numero_ingreso_' || anio));
    SELECT COALESCE(MAX(substring(numero_ingreso from 10)::integer), 0) + 1
      INTO siguiente
      FROM public.ingresos
     WHERE numero_ingreso LIKE 'ING-' || anio || '-%';
    NEW.numero_ingreso := 'ING-' || anio || '-' || lpad(siguiente::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ingresos_numero
BEFORE INSERT ON public.ingresos
FOR EACH ROW EXECUTE FUNCTION public.set_numero_ingreso();

CREATE OR REPLACE FUNCTION public.set_actualizado_en()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.actualizado_en := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ingresos_actualizado
BEFORE UPDATE ON public.ingresos
FOR EACH ROW EXECUTE FUNCTION public.set_actualizado_en();