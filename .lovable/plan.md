# ESG Strategy Centrepiece + Booking/Contact + Site-wide Polish

This is a large scope. I'll ship it in three coordinated waves, all in the same visual language (cream, editorial serif, glass, particles) already established. No overall redesign.

## Wave 1 — ESG Strategy page (`/services/esg-strategy` only)

New components (in `src/components/site/`), all scoped to the strategy slug via an `isStrategy` branch in `src/routes/services.$slug.tsx`:

1. `StrategyEngine.tsx` — hero replacement. Central "Business Strategy" node with 11 orbiting layers (Climate, Carbon, Reporting, Risk, Governance, Finance, Supply Chain, Operations, Innovation, Stakeholders, Capital Markets). Continuous animated connective lines. Hovering a node highlights its related cluster via a hand-authored adjacency map (Climate → Carbon/Reporting/Risk/Governance; Finance → Capital Markets/Reporting/Strategy; etc.).
2. `TransformationTimeline.tsx` — vertical dynamic roadmap (Current State → … → Net Zero). Each stage expands on hover to reveal milestones, KPIs, deliverables, governance, dependencies, investment, business impact.
3. `StrategyFlywheel.tsx` — Overview section. Continuously rotating SVG flywheel of the 9 operating-model stages. Hover pauses rotation and reveals stage detail.
4. `StrategySimulator.tsx` — new "Build Your Sustainability Strategy" section. Multi-step form (industry, size, region, regulation, investors, carbon maturity, reporting maturity, supply-chain complexity, net-zero ambition) that renders a recommended strategy, roadmap, priority projects, frameworks, timeline, KPIs, board priorities, suggested next services. Pure client-side logic.
5. `StrategyOS.tsx` — the signature "Sustainability Operating System" digital twin. Interactive pillar map: click a pillar (Carbon / Reporting / Finance / Risk / Supply Chain / Governance / Investors / Employees / Customers) to expand initiatives and see animated flows across the map.
6. `MethodologyWorkspaces.tsx` — replaces methodology cards with 4 miniature workspaces (Materiality heatmap, Vision workshop board with sticky notes, Roadmap Gantt, Operating Model / governance chart).
7. `FrameworkCards.tsx` — expandable premium framework cards (CSRD, ISSB, GRI, SBTi, TNFD): purpose, who uses it, business value, integration with strategy, relationship to other frameworks.
8. `ExecutiveCTA.tsx` — boardroom CTA with animated strategy map + floating KPIs, used only on the strategy page.

Content data (`src/lib/services-data.ts`): expand `esg-strategy` with a 9-step journey (Discover → Materiality → Vision → Targets → Roadmap → Execution → Governance → Measure → Improve), 10 deliverables (Materiality Assessment, Strategy Document, Board Presentation, Transformation Roadmap, KPI Dashboard, Target Register, Implementation Tracker, Operating Model, Governance Charter, Business Case), industry list (Financial Institutions, Infrastructure, Manufacturing, Energy, Technology, Healthcare, Consumer Goods, Public Sector), outcome metrics (20+ Transformation Strategies, 95% Board Approval, 3× Funding Readiness, 40% Implementation Acceleration, 100% Executive Alignment), expanded FAQ.

Hero metrics: swap framework labels for animated counters (20+ / 100% / 3× / 90%). Reuse existing `Counter` and `CertMetric`-style helper.

"Learn before you certify" pattern is reused via existing `LearnBeforeCertify` (or a new `BuildInternalCapability` wrapper) to surface the 7 requested Academy programs.

## Wave 2 — Booking & Contact

- New route `src/routes/book.tsx` (`/book`) with query-param `?service=<slug>` prefill. 7-step wizard (service → type → duration → date/time → company info → project details → confirmation) using existing shadcn Form + zod validation, `date-fns`, and the shadcn Calendar. Time slots are generated client-side (fake availability grid for now; commented "wire to calendar API"). Success screen with animation, "Add to Calendar" (`.ics` download generated client-side), next-steps copy.
- New route `src/routes/contact.tsx` (`/contact`): hero, contact-option cards (Book / Email / Phone / LinkedIn / Address), validated contact form (zod + toast), stylised world map SVG with UAE + India markers, "Why Contact Us" metrics, Meet the Team (Dr. Farida using existing asset, plus placeholder slots), FAQ, final CTA.
- Update every "Book consultation" / "Book a Consultation" CTA across the site (Nav, Hero, service page CTAs, Final section, ExecutiveCTA, etc.) to `<Link to="/book" search={{ service }}>`.

## Wave 3 — Site-wide polish

- Breadcrumbs component on every service page (`Home / Services / <name>`).
- "See Methodology" and similar in-page CTAs use smooth `scrollIntoView` to `#methodology`.
- Service cards, framework cards, "Continue Exploring" cards become full `<Link>`s.
- Add hover/active/focus states and a shared loading spinner utility for primary buttons.
- Mobile responsiveness pass on the new strategy diagrams (stack orbit layers into a vertical list under `md`, timeline becomes single-column, simulator becomes step-by-step full width).
- Subtle page-transition wrapper (fade + 6px rise) in `__root.tsx` around `<Outlet />` keyed by pathname.
- Zod validation + toast success/error on all forms (booking, contact, any existing lead form).

## Verification

- `bunx tsgo --noEmit` after each wave.
- Playwright smoke: load `/services/esg-strategy`, `/book`, `/contact`; take screenshots; click a nav Book button and confirm route change.

## Out of scope / deferred

- Real calendar integration (Calendly/Google) — UI is built and wired to a typed handler that currently records selection locally; swap-in is a single function.
- Real email send from contact/booking — success UI + toast now; backend can be added later (Lovable Cloud not enabled on this project).
- Team photos beyond Dr. Farida — placeholder cards ready for future headshots.

## Technical notes

- All new components are presentational; no backend changes.
- Reuses tokens in `src/styles.css` (`--leaf`, `--ember`, `--ink`, `--clay`) — no new colors.
- Shadcn primitives used: `form`, `input`, `select`, `radio-group`, `calendar`, `popover`, `button`, `toast`, `accordion`. Install any missing ones via `bunx shadcn@latest add ...` before importing.
- Booking `.ics` generated with a small inline helper (no new dep).
- Adjacency + simulator logic live in `src/lib/strategy-data.ts` to keep components lean.
