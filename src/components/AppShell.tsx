import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface AppShellProps {
  titulo: string;
  children: ReactNode;
}

export function AppShell({ titulo, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-background font-sans text-foreground antialiased">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-[68px] items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="grid size-8 place-items-center rounded-[6px] bg-sidebar-primary font-mono text-sm font-medium text-sidebar-primary-foreground">
            LM
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold tracking-tight">Laboratorio de Materiales</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Gestión</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <NavItem to="/" label="Inicio" />
          <NavItem to="/ingresos" label="Ingresos" />
        </nav>
        <div className="border-t border-sidebar-border px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Módulo activo</p>
          <p className="mt-1 font-mono text-[12px] text-sidebar-accent-foreground">Ingreso de muestras</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-[68px] items-center gap-3 border-b border-border bg-card px-5 lg:px-8">
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Módulo</p>
            <p className="font-mono text-[15px] font-medium">{titulo}</p>
          </div>
        </header>
        <div className="mx-auto max-w-[1400px] space-y-6 px-5 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      activeProps={{
        className:
          "flex items-center gap-3 rounded-[8px] bg-sidebar-accent px-3 py-2.5 text-[13px] font-medium text-sidebar-accent-foreground ring-1 ring-sidebar-border",
      }}
    >
      <span className="size-2 shrink-0 rounded-full bg-sidebar-primary" />
      {label}
    </Link>
  );
}
