import { createFileRoute } from "@tanstack/react-router";
import { TerraProvider, TerraIndicator } from "@/components/site/TerraHealth";
import {
  NetworkBackground,
  CursorGlow,
  FloatingParticles,
} from "@/components/site/NetworkBackground";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/sections/Hero";
import { Challenges, Framework } from "@/components/sections/Story";
import { Lifecycle } from "@/components/sections/Lifecycle";
import { Services } from "@/components/sections/Services";
import { WhyUs } from "@/components/sections/WhyUs";
import { Founder } from "@/components/sections/Founder";
import { TomorrowMatrix } from "@/components/sections/TomorrowMatrix";
import { Knowledge } from "@/components/sections/Knowledge";
import { Assessment } from "@/components/sections/Assessment";
import { Final } from "@/components/sections/Final";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For Tomorrow — Credible sustainability, from today" },
      {
        name: "description",
        content:
          "For Tomorrow partners with organizations to design, implement, and verify sustainability and ESG solutions that are measurable, compliant, and future-ready.",
      },
      { property: "og:title", content: "For Tomorrow — Credible sustainability, from today" },
      {
        property: "og:description",
        content:
          "An integrated sustainability practice: strategy, measurement, reporting, verification.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  return (
    <TerraProvider>
      <SmoothScroll />
      <div className="relative min-h-screen overflow-hidden bg-background">
        <NetworkBackground />
        <CursorGlow />
        <FloatingParticles />

        {/* Slow morphing gradient wash */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(1200px 800px at 10% 10%, color-mix(in oklab, var(--leaf-soft) 25%, transparent), transparent 60%), radial-gradient(900px 700px at 90% 40%, color-mix(in oklab, var(--ember) 12%, transparent), transparent 60%), radial-gradient(1000px 800px at 50% 100%, color-mix(in oklab, var(--forest) 15%, transparent), transparent 60%)",
          }}
        />

        <Nav />

        <main className="relative z-10">
          <Hero />
          <Challenges />
          <Framework />
          <Lifecycle />
          <Services />
          <WhyUs />
          <Founder />
          <TomorrowMatrix />
          <Knowledge />
          <Assessment />
          <Final />
        </main>

        <TerraIndicator />
      </div>
    </TerraProvider>
  );
}
