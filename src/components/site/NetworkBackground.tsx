import { useEffect, useRef } from "react";
import { useTerra } from "./TerraHealth";

type Node = { x: number; y: number; vx: number; vy: number; base: number };
type Particle = { i: number; j: number; t: number; speed: number };

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const { health } = useTerra();
  const healthRef = useRef(health);
  useEffect(() => {
    healthRef.current = health;
  }, [health]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let particles: Particle[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(120, Math.floor((width * height) / 14000));
      nodes = new Array(count).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        base: 0.4 + Math.random() * 0.6,
      }));
      particles = [];
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const onLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    let raf = 0;
    const linkDist = 130;
    const linkDist2 = linkDist * linkDist;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, width, height);

      const h = healthRef.current / 100; // 0..1
      const leafR = 132,
        leafG = 153,
        leafB = 79;
      const emberR = 252,
        emberG = 181,
        emberB = 59;

      // Update nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const dx = mouse.current.x - n.x;
        const dy = mouse.current.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 20000) {
          const f = (1 - d2 / 20000) * 0.4;
          n.x -= (dx / Math.sqrt(d2 + 0.01)) * f;
          n.y -= (dy / Math.sqrt(d2 + 0.01)) * f;
        }
      }

      // Draw links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist2) {
            const alpha = (1 - d2 / linkDist2) * (0.08 + h * 0.18);
            ctx.strokeStyle = `rgba(${leafR}, ${leafG}, ${leafB}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const dx = mouse.current.x - n.x;
        const dy = mouse.current.y - n.y;
        const d2 = dx * dx + dy * dy;
        const glow = d2 < 20000 ? 1 - d2 / 20000 : 0;
        const r = 1 + n.base + glow * 2;
        const mixR = leafR * (1 - glow) + emberR * glow;
        const mixG = leafG * (1 - glow) + emberG * glow;
        const mixB = leafB * (1 - glow) + emberB * glow;
        ctx.fillStyle = `rgba(${mixR}, ${mixG}, ${mixB}, ${0.35 + h * 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spawn traveling data particles
      if (Math.random() < 0.04 + h * 0.08 && particles.length < 30 && nodes.length > 2) {
        const i = Math.floor(Math.random() * nodes.length);
        let j = Math.floor(Math.random() * nodes.length);
        if (j === i) j = (j + 1) % nodes.length;
        particles.push({ i, j, t: 0, speed: 0.004 + Math.random() * 0.006 });
      }

      // Draw & step particles
      particles = particles.filter((p) => {
        const a = nodes[p.i];
        const b = nodes[p.j];
        if (!a || !b) return false;
        p.t += p.speed;
        if (p.t >= 1) return false;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 8);
        grad.addColorStop(0, `rgba(${emberR}, ${emberG}, ${emberB}, 0.9)`);
        grad.addColorStop(1, `rgba(${emberR}, ${emberG}, ${emberB}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 no-select"
      aria-hidden
    />
  );
}

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x,
      ty = y;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    let raf = 0;
    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 h-[600px] w-[600px] rounded-full opacity-60 mix-blend-multiply"
      style={{
        background:
          "radial-gradient(circle at center, color-mix(in oklab, var(--leaf) 22%, transparent), transparent 60%)",
      }}
    />
  );
}

export function FloatingParticles() {
  const dots = Array.from({ length: 18 });
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {dots.map((_, i) => {
        const size = 2 + Math.random() * 4;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 8;
        const dur = 12 + Math.random() * 14;
        const isEmber = Math.random() > 0.7;
        return (
          <span
            key={i}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
              background: isEmber
                ? "color-mix(in oklab, var(--ember) 80%, transparent)"
                : "color-mix(in oklab, var(--leaf) 70%, transparent)",
            }}
            className="absolute rounded-full blur-[1px] animate-drift opacity-70"
          />
        );
      })}
    </div>
  );
}
