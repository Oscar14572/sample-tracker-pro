import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { EstadoBadge } from "@/components/EstadoBadge";
import { etiquetasOrigen, formatearFecha, listarIngresos } from "@/lib/ingresos";

export const Route = createFileRoute("/ingresos/")({
  head: () => ({
    meta: [
      { title: "Ingresos de muestras — Laboratorio de materiales" },
      {
        name: "description",
        content:
          "Listado y búsqueda de ingresos de muestras por número de ingreso, código de proyecto, proyecto o cliente.",
      },
      { property: "og:title", content: "Ingresos de muestras — Laboratorio de materiales" },
      {
        property: "og:description",
        content: "Consulte y busque todos los ingresos registrados en el laboratorio.",
      },
    ],
  }),
  component: Ingresos,
});

function Ingresos() {
  const [busqueda, setBusqueda] = useState("");
  const { data: ingresos = [], isLoading } = useQuery({
    queryKey: ["ingresos"],
    queryFn: listarIngresos,
  });

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return ingresos;
    return ingresos.filter((i) =>
      [i.numero_ingreso, i.codigo_proyecto, i.proyecto, i.cliente]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(q)),
    );
  }, [ingresos, busqueda]);

  return (
    <AppShell titulo="Ingresos de muestras">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="border-b-2 border-foreground pb-2">
          <h1 className="text-2xl font-semibold tracking-tight">Ingresos</h1>
          <p className="mt-1 max-w-[52ch] text-pretty text-sm text-muted-foreground">
            Registros de recepción de muestras del laboratorio.
          </p>
        </div>
        <Link
          to="/ingresos/nuevo"
          className="inline-flex items-center gap-2 rounded-[8px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground ring-1 ring-primary transition-colors hover:bg-steel-deep"
        >
          <span className="-mb-0.5 font-mono text-lg leading-none">+</span> Nuevo ingreso
        </Link>
      </div>

      <section className="overflow-hidden rounded-[12px] bg-card ring-1 ring-border">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <span className="size-1.5 shrink-0 rounded-full bg-lead" /> Registros de ingreso
          </div>
          <div className="relative ml-auto w-full sm:w-80">
            <input
              type="text"
              value={busqueda}
              maxLength={100}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por número, código, proyecto o cliente…"
              className="w-full rounded-[8px] bg-paper px-3 py-2 text-[13px] ring-1 ring-border placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-lead/30"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {[
                  "Nº ingreso",
                  "Recepción",
                  "Cód. proyecto",
                  "Proyecto",
                  "Cliente",
                  "Ubicación",
                  "Origen",
                  "Estado",
                ].map((h) => (
                  <th key={h} className="px-4 py-2.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    Cargando ingresos…
                  </td>
                </tr>
              )}
              {!isLoading && filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No hay ingresos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
              {filtrados.map((i) => (
                <tr key={i.ingreso_id} className="transition-colors hover:bg-paper">
                  <td className="px-4 py-3 font-mono">{i.numero_ingreso ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-muted-foreground">
                    {formatearFecha(i.fecha_recepcion)}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{i.codigo_proyecto ?? "—"}</td>
                  <td className="px-4 py-3">{i.proyecto ?? "—"}</td>
                  <td className="px-4 py-3">{i.cliente ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.ubicacion ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{etiquetasOrigen[i.tipo_origen]}</td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={i.estado_ingreso} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
