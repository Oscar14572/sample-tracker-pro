import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { CamposIngreso } from "@/components/CamposIngreso";
import { crearIngreso, datosVacios, etiquetasOrigen, type DatosIngreso, type TipoOrigen } from "@/lib/ingresos";
import { procesarDocumento } from "@/lib/ocr.functions";

export const Route = createFileRoute("/ingresos/nuevo")({
  head: () => ({
    meta: [
      { title: "Nuevo ingreso de muestras — Laboratorio de materiales" },
      {
        name: "description",
        content:
          "Registre un ingreso de muestras llenando el formulario, subiendo un PDF o subiendo una imagen para su lectura automática.",
      },
      { property: "og:title", content: "Nuevo ingreso de muestras" },
      {
        property: "og:description",
        content: "Cree un ingreso de muestras de forma digital, por PDF o por imagen.",
      },
    ],
  }),
  component: NuevoIngreso,
});

type Paso = "metodo" | "digital" | "archivo" | "revision";

const CLAVE_WEBHOOK = "n8n_webhook_url";

function NuevoIngreso() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const enviarDocumento = useServerFn(procesarDocumento);

  const [paso, setPaso] = useState<Paso>("metodo");
  const [tipoOrigen, setTipoOrigen] = useState<TipoOrigen>("digital");
  const [datos, setDatos] = useState<DatosIngreso>(datosVacios);
  const [confianza, setConfianza] = useState<number | null>(null);
  const [advertencias, setAdvertencias] = useState<string[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWebhookUrl(window.localStorage.getItem(CLAVE_WEBHOOK) ?? "");
  }, []);

  const guardarWebhook = (valor: string) => {
    setWebhookUrl(valor);
    window.localStorage.setItem(CLAVE_WEBHOOK, valor);
  };

  const elegir = (tipo: TipoOrigen) => {
    setError(null);
    setTipoOrigen(tipo);
    setDatos(datosVacios);
    setConfianza(null);
    setAdvertencias([]);
    setArchivo(null);
    setPaso(tipo === "digital" ? "digital" : "archivo");
  };

  const procesar = async () => {
    if (!archivo) return;
    setProcesando(true);
    setError(null);
    try {
      const cuerpo = new FormData();
      cuerpo.append("archivo", archivo);
      cuerpo.append("tipo_origen", tipoOrigen);
      cuerpo.append("webhook_url", webhookUrl);
      const respuesta = await enviarDocumento({ data: cuerpo });
      if (!respuesta.success) {
        setError(respuesta.error ?? "El documento no pudo procesarse.");
        return;
      }
      const extraidos = respuesta.data ?? {};
      setDatos({
        fecha_remision: texto(extraidos["fecha_remision"]),
        fecha_recepcion: texto(extraidos["fecha_recepcion"]),
        codigo_proyecto: texto(extraidos["codigo_proyecto"]),
        proyecto: texto(extraidos["proyecto"]),
        cliente: texto(extraidos["cliente"]),
        ubicacion: texto(extraidos["ubicacion"]),
        entregado_por: texto(extraidos["entregado_por"]),
        recibido_por: texto(extraidos["recibido_por"]),
        observaciones_ingreso: texto(extraidos["observaciones_ingreso"]),
      });
      setConfianza(respuesta.confidence ?? null);
      setAdvertencias(respuesta.warnings ?? []);
      setPaso("revision");
    } catch {
      setError("Ocurrió un problema al enviar el documento.");
    } finally {
      setProcesando(false);
    }
  };

  const aprobar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await crearIngreso({
        datos,
        tipo_origen: tipoOrigen,
        confianza_extraccion: confianza,
        revisado_por: datos.recibido_por,
      });
      await queryClient.invalidateQueries({ queryKey: ["ingresos"] });
      void navigate({ to: "/ingresos" });
    } catch {
      setError("No se pudo guardar el ingreso.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AppShell titulo="Nuevo ingreso">
      {error && (
        <p className="rounded-[8px] bg-destructive/10 px-4 py-3 text-[13px] text-destructive ring-1 ring-destructive/20">
          {error}
        </p>
      )}

      {paso === "metodo" && (
        <section>
          <div className="mb-4 border-b-2 border-foreground pb-2">
            <h1 className="text-2xl font-semibold tracking-tight">¿Cómo desea ingresar la información?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Los tres métodos terminan usando la misma estructura de datos.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Opcion
              letra="A"
              titulo="Llenar digitalmente"
              descripcion="Complete el formulario campo por campo, sin depender de un documento."
              accion="Comenzar →"
              onClick={() => elegir("digital")}
            />
            <Opcion
              letra="B"
              titulo="Subir PDF"
              descripcion="Arrastre el documento de remisión. La lectura automática extrae los datos."
              accion="Seleccionar archivo →"
              onClick={() => elegir("pdf")}
            />
            <Opcion
              letra="C"
              titulo="Subir imagen"
              descripcion="Fotografía o escaneo (JPG, JPEG, PNG). El archivo no se almacena."
              accion="Seleccionar archivo →"
              onClick={() => elegir("imagen")}
            />
          </div>
        </section>
      )}

      {paso === "digital" && (
        <section className="overflow-hidden rounded-[14px] bg-paper ring-1 ring-border">
          <div className="border-b border-dashed border-border px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ingreso digital</p>
            <p className="font-mono text-[15px] font-medium">Datos de recepción</p>
          </div>
          <div className="space-y-5 p-5">
            <CamposIngreso datos={datos} onChange={setDatos} />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPaso("revision")}
                className="rounded-[8px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground ring-1 ring-primary transition-colors hover:bg-steel-deep"
              >
                Guardar y revisar
              </button>
              <button
                onClick={() => setPaso("metodo")}
                className="rounded-[8px] px-4 py-2.5 text-sm font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-card"
              >
                Cancelar
              </button>
            </div>
          </div>
        </section>
      )}

      {paso === "archivo" && (
        <section className="overflow-hidden rounded-[14px] bg-paper ring-1 ring-border">
          <div className="border-b border-dashed border-border px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Origen: {etiquetasOrigen[tipoOrigen]}
            </p>
            <p className="font-mono text-[15px] font-medium">Procesamiento del documento</p>
          </div>
          <div className="space-y-5 p-5">
            <div
              onClick={() => inputArchivo.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) setArchivo(f);
              }}
              className="grid cursor-pointer place-items-center rounded-[10px] border-2 border-dashed border-border bg-card px-6 py-12 text-center transition-colors hover:border-lead/40"
            >
              <p className="text-[13px] font-medium">
                {archivo ? archivo.name : "Arrastre el archivo aquí o haga clic para seleccionarlo"}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {tipoOrigen === "pdf" ? "Formato PDF" : "Formatos JPG, JPEG o PNG"} · el archivo no se
                almacena, solo se envía para su lectura.
              </p>
              <input
                ref={inputArchivo}
                type="file"
                className="hidden"
                accept={tipoOrigen === "pdf" ? "application/pdf" : "image/jpeg,image/png"}
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                Dirección del servicio de lectura automática
              </label>
              <input
                type="url"
                value={webhookUrl}
                maxLength={500}
                onChange={(e) => guardarWebhook(e.target.value)}
                placeholder="https://…/webhook/ingresos"
                className="w-full rounded-[8px] bg-card px-3 py-2 font-mono text-[13px] ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-lead/30"
              />
            </div>

            {procesando && (
              <div className="rounded-[8px] bg-card px-4 py-3 ring-1 ring-border">
                <p className="font-mono text-[13px]">Analizando documento…</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-lead" />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                disabled={!archivo || procesando}
                onClick={procesar}
                className="rounded-[8px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground ring-1 ring-primary transition-colors hover:bg-steel-deep disabled:opacity-40"
              >
                Procesar documento
              </button>
              <button
                onClick={() => setPaso("metodo")}
                className="rounded-[8px] px-4 py-2.5 text-sm font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-card"
              >
                Cancelar
              </button>
            </div>
          </div>
        </section>
      )}

      {paso === "revision" && (
        <section className="overflow-hidden rounded-[14px] bg-paper ring-1 ring-border">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-border px-5 py-4">
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Boleta de revisión
              </p>
              <p className="font-mono text-[15px] font-medium">Revisar ingreso · pendiente_revision</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-amber/10 px-2.5 py-1 text-[11px] font-medium text-amber ring-1 ring-amber/20">
              Origen: {etiquetasOrigen[tipoOrigen]}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="space-y-4 p-5 lg:col-span-2">
              <CamposIngreso datos={datos} onChange={setDatos} resaltarVacios />
            </div>

            <aside className="space-y-5 border-t border-border bg-card/60 p-5 lg:border-l lg:border-t-0">
              {tipoOrigen !== "digital" && (
                <>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                        Confianza de extracción
                      </p>
                      <span className="font-mono text-[13px] font-medium text-approve">
                        {confianza === null ? "—" : `${Math.round(confianza * 100)}%`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-approve"
                        style={{ width: `${Math.round((confianza ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                      Advertencias
                    </p>
                    {advertencias.length === 0 ? (
                      <p className="text-[12px] text-muted-foreground">Sin advertencias.</p>
                    ) : (
                      <ul className="space-y-2">
                        {advertencias.map((a) => (
                          <li
                            key={a}
                            className="rounded-[8px] bg-amber/10 px-3 py-2 text-[12px] text-pretty ring-1 ring-amber/20"
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2 pt-1">
                <button
                  onClick={aprobar}
                  disabled={guardando}
                  className="w-full rounded-[8px] bg-approve py-2.5 text-sm font-medium text-primary-foreground ring-1 ring-approve transition-colors hover:bg-approve/90 disabled:opacity-40"
                >
                  {guardando ? "Guardando…" : "Aprobar ingreso"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaso(tipoOrigen === "digital" ? "digital" : "revision")}
                    className="rounded-[8px] bg-card py-2.5 text-sm font-medium ring-1 ring-border transition-colors hover:bg-muted"
                  >
                    Corregir
                  </button>
                  <button
                    onClick={() => navigate({ to: "/ingresos" })}
                    className="rounded-[8px] py-2.5 text-sm font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
                  >
                    Cancelar
                  </button>
                </div>
                <p className="pt-1 text-[11px] text-pretty text-muted-foreground">
                  Al aprobar se genera el número de ingreso y los datos se guardan definitivamente.
                </p>
              </div>
            </aside>
          </div>
        </section>
      )}
    </AppShell>
  );
}

function texto(valor: string | null | undefined): string {
  return valor == null ? "" : String(valor);
}

function Opcion({
  letra,
  titulo,
  descripcion,
  accion,
  onClick,
}: {
  letra: string;
  titulo: string;
  descripcion: string;
  accion: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-[12px] bg-paper p-5 text-left ring-1 ring-border transition-transform hover:-translate-y-0.5 hover:ring-lead/30"
    >
      <span className="grid size-10 place-items-center rounded-[8px] bg-lead/10 font-mono text-sm text-lead">
        {letra}
      </span>
      <span className="mt-4 block text-[15px] font-semibold">{titulo}</span>
      <span className="mt-1.5 block text-[13px] text-pretty text-muted-foreground">{descripcion}</span>
      <span className="mt-4 block text-[12px] font-medium text-lead">{accion}</span>
    </button>
  );
}
