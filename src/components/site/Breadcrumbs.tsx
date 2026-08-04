import { Link } from "@tanstack/react-router";

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {it.to ? (
              <Link to={it.to} className="hover:text-foreground">{it.label}</Link>
            ) : (
              <span className="text-foreground/70">{it.label}</span>
            )}
            {i < items.length - 1 && <span className="opacity-40">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
