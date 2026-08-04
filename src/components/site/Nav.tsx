import logo from "@/assets/logo.asset.json";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";

const links = [
  { label: "Approach", href: "#approach" },
  { label: "Services", href: "#services" },
  { label: "Matrix", href: "#matrix" },
  { label: "Knowledge", href: "#knowledge" },
  { label: "Assessment", href: "#assessment" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["rgba(255,255,255,0)", "rgba(255,255,255,0.75)"]);
  const border = useTransform(scrollY, [0, 120], ["rgba(255,255,255,0)", "rgba(0,0,0,0.06)"]);

  return (
    <motion.header
      style={{ backgroundColor: bg, borderColor: border }}
      className="fixed inset-x-0 top-0 z-30 border-b backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo.url} alt="For Tomorrow" className="h-9 w-9 object-contain" />
          <div className="hidden leading-tight sm:block">
            <div className="text-[15px] font-semibold tracking-tight">For Tomorrow</div>
            <div className="text-[10px] italic text-muted-foreground">from today</div>
          </div>
        </a>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative rounded-full px-4 py-2 text-sm text-foreground/75 transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-1 md:flex">
          <Link to="/courses" className="rounded-full px-4 py-2 text-sm text-foreground/75 hover:text-foreground">Courses</Link>
          <Link to="/contact" className="rounded-full px-4 py-2 text-sm text-foreground/75 hover:text-foreground">Contact</Link>
        </div>
        <Link
          to="/book"
          className="group inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Book consultation
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </motion.header>
  );
}
