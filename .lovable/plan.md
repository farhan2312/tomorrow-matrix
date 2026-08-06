# Butterfly Explorer + Premium Marketplace

Two-part build. Both use the uploaded Linkage doc verbatim — no invented explanations.

## Part 1 — Butterfly Network Relationship Explorer

**Data pipeline**
- Parse `Tomorrow_Matrix_Linkage_Explanations.docx` into `src/lib/game/linkages.data.json`:
  `{ from, to, kind: "cascade" | "bridge" | "soft", chain?: string[], explanation, systemsInsight, plainEnglish }`
- Cascade text = the exact "→" chain from the doc; bridge = direct upstream/downstream paragraph; soft = Species Decline / Victory soft links.
- Match by mystery NAME (per the doc's own recommendation).

**SystemsMap.tsx / ButterflyNetwork.tsx**
- Nodes + edges become clickable. Clicking either opens `RelationshipExplorer` modal.
- Selected node: highlight current (amber), incoming (blue), outgoing (green), rest dimmed.
- Clicking a connected node inside the modal transitions smoothly (state swap + fade) instead of closing.

**RelationshipExplorer modal (new component)**
- Left column: Mystery A hero card (existing artwork) → animated ↓ chevron → Mystery B hero card.
- Right column:
  - Header "A → B"
  - **Connection Explanation** (verbatim doc text)
  - **Butterfly Cascade** — if doc provides a chain, render each step as an animated pill appearing sequentially. "Explore Full Cascade" button extends by walking outgoing edges up to 6 hops.
  - **Why are these connected?** (scientific insight, verbatim)
  - **Systems Thinking** panel
  - **"Why does this happen?"** toggle → plain-English simplified view
- If soft link → shows the flagged bridge note.

## Part 2 — Premium Intervention Marketplace

**Hero artwork strategy**
- Generating 177 unique images is too costly. Instead: 9 cinematic category hero images (energy, water, food, nature, cities, economy, society, ai, systemic), each intervention card uses its category art + subtle color grading + intervention title as focal typography. Feels like a AAA card set without per-item generation. (If you'd rather I generate individual artwork for a specific subset — e.g. only the 20 headline interventions — say so.)

**InterventionCard (redesign)**
- Portrait 3:4 collectible card feel: full-bleed category artwork with gradient overlay, floating gold CAP badge (⭐), category chip, title in display font, 1-line description, "N ripples across Terra" footer.
- Glassmorphism, soft shadow, hover lift + parallax tilt, gradient border on hover.
- Removes the tiny indicator chips from card front.

**InterventionDetail (full-screen strategy page)**
- Full-screen sheet (not dialog). Cinematic hero banner (category artwork + title + CAP badge).
- Sections:
  1. Description
  2. **Planetary Indicator Matrix** — 12-indicator premium control panel (large tiles, animated arrows, green/red/grey, bars showing magnitude)
  3. **Ripple Effects Across Terra** — each linked mystery as a hero-artwork row with explanation from library
  4. Linked Crisis Events
  5. Stakeholders Benefiting (derived from category → roles map)
  6. Expected Long-Term Outcomes (from description)
  7. Educational Insight
  8. Implementation Difficulty (from cost tier)
  9. Related Interventions (same category, top 3)
- Sticky purchase footer with confirm flow.

**Purchase animation**
- On confirm: CAP counter tween down, Terra Health bar pulse up, 12 indicator tiles flash their delta, toast "Ripples propagating…" — reuses existing `IndicatorChangePanel` where possible.

**Live Network Preview**
- Hovering an InterventionCard in Marketplace dispatches `highlightMysteries` to a shared store; if Butterfly Network is visible in a side-panel/mini-map, those nodes glow. (If Marketplace and Network aren't on the same screen, this becomes a "Preview on Network" button that opens the network with those nodes pre-highlighted.)

## Files touched
- NEW `src/lib/game/linkages.data.json`
- NEW `src/components/game/RelationshipExplorer.tsx`
- NEW `src/assets/interventions/*.jpg.asset.json` (9 category heroes via imagegen)
- EDIT `SystemsMap.tsx`, `ButterflyNetwork.tsx`, `InterventionCard.tsx`, `InterventionDetail.tsx`, `play.marketplace.tsx`, `interventions.ts` (add category art mapping)

## Confirm before I start
1. **Artwork:** 9 category heroes (fast, cheap) vs. per-intervention art for a curated subset — which?
2. **Live Network Preview:** side-panel mini-map inside Marketplace, or "Preview on Network" button that navigates?
3. Anything to cut from the Detail sections list above?
