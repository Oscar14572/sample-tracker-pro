import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { listarIngresos } from "@/lib/ingresos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio — Gestión de laboratorio de materiales" },
      {
        name: "description",
        content:
          "Panel de control del laboratorio de materiales: total de ingresos, pendientes de revisión y aprobados.",
      },
      { property: "og:title", content: "Inicio — Gestión de laboratorio de materiales" },
      {
        property: "og:description",
        content: "Panel de control del módulo de ingreso de muestras del laboratorio de materiales.",
      },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  const { data: ingresos = [] } = useQuery({ queryKey: ["ingresos"], queryFn: listarIngresos });

  const total = ingresos.length;
  const pendientes = ingresos.filter((i) => i.estado_ingreso === "pendiente_revision").length;
  const aprobados = ingresos.filter((i) => i.estado_ingreso === "aprobado").length;

  return (
    <AppShell titulo="Inicio">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="border-b-2 border-foreground pb-2">
          <h1 className="max-w-[40ch] text-balance text-2xl font-semibold tracking-tight">
            Recepción de muestras
          </h1>
          <p className="mt-1 max-w-[52ch] text-pretty text-sm text-muted-foreground">
            Registre, procese y apruebe el ingreso de muestras. Todo documento pasa por revisión humana antes
            de guardarse.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi titulo="Total de ingresos" valor={total} />
        <Kpi titulo="Pendientes de revisión" valor={pendientes} tono="text-amber" />
        <Kpi titulo="Aprobados" valor={aprobados} tono="text-approve" />
      </section>

      <Link
        to="/ingresos/nuevo"
        className="flex items-center justify-between gap-4 rounded-[12px] bg-primary px-6 py-6 text-primary-foreground ring-1 ring-primary transition-colors hover:bg-steel-deep"
      >
        <span>
          <span className="block text-lg font-semibold tracking-tight">Nuevo ingreso</span>
          <span className="mt-1 block text-[13px] text-primary-foreground/70">
            Digital, PDF o imagen — los tres métodos usan la misma estructura de datos.
          </span>
        </span>
        <span className="font-mono text-2xl leading-none">+</span>
      </Link>
    </AppShell>
  );
}

function Kpi({ titulo, valor, tono = "" }: { titulo: string; valor: number; tono?: string }) {
  return (
    <div className="rounded-[12px] bg-card p-4 ring-1 ring-border">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{titulo}</p>
      <p className={`mt-3 font-mono text-[34px] font-medium leading-none tracking-tight ${tono}`}>{valor}</p>
    </div>
  );
}
