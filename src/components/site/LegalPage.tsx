import { Link } from "@tanstack/react-router";

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { h: string; p: string }[];
}) {
  return (
    <article className="mt-6">
      <h1 className="text-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05]">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{intro}</p>
      <div className="mt-10 space-y-6">
        {sections.map((s) => (
          <section key={s.h} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-display text-xl">{s.h}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-2">
        <Link
          to="/contact"
          className="rounded-full px-5 py-2.5 text-sm font-medium text-white"
          style={{ background: "var(--ink)" }}
        >
          Contact us
        </Link>
        <Link
          to="/book"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-[var(--leaf)]"
        >
          Book a consultation
        </Link>
      </div>
    </article>
  );
}
