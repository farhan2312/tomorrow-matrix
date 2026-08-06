import type { SequenceStep } from "./types";

// 8-card canonical chains. Cards now display their `label` as the
// primary visual content (full-art card title), no icons.
export const SEQUENCES: Record<string, SequenceStep[]> = {
  arctic: [
    { id: "co2",     label: "CO₂ Emissions",         icon: "Factory",      tone: "industry" },
    { id: "warming", label: "Global Warming",        icon: "Thermometer",  tone: "heat" },
    { id: "arctic-rise", label: "Arctic Temperature Rise", icon: "TrendingUp", tone: "heat" },
    { id: "melt",    label: "Sea Ice Melt",          icon: "Droplets",     tone: "ice" },
    { id: "albedo",  label: "Albedo Loss",           icon: "Sun",          tone: "heat" },
    { id: "absorb",  label: "More Heat Absorption",  icon: "Flame",        tone: "heat" },
    { id: "accel",   label: "Accelerated Warming",   icon: "Zap",          tone: "climate" },
    { id: "loss",    label: "Arctic Ice Loss",       icon: "Snowflake",    tone: "ice" },
  ],
  coral: [
    { id: "co2-c",   label: "Industrial CO₂",        icon: "Factory",      tone: "industry" },
    { id: "ocean-heat", label: "Ocean Heat Uptake",  icon: "Waves",        tone: "water" },
    { id: "acid",    label: "Ocean Acidification",   icon: "FlaskConical", tone: "water" },
    { id: "stress",  label: "Coral Heat Stress",     icon: "Thermometer",  tone: "heat" },
    { id: "bleach",  label: "Bleaching Event",       icon: "Sparkle",      tone: "bio" },
    { id: "die",     label: "Reef Die-off",          icon: "Skull",        tone: "bio" },
    { id: "fish",    label: "Fishery Collapse",      icon: "Fish",         tone: "bio" },
    { id: "coast",   label: "Coastal Erosion",       icon: "Mountain",     tone: "water" },
  ],
  amazon: [
    { id: "demand",  label: "Global Beef Demand",    icon: "Beef",         tone: "human" },
    { id: "clear",   label: "Forest Clearing",       icon: "Axe",          tone: "industry" },
    { id: "burn",    label: "Slash & Burn",          icon: "Flame",        tone: "heat" },
    { id: "carbon",  label: "Carbon Release",        icon: "CloudFog",     tone: "climate" },
    { id: "dry",     label: "Rainfall Disruption",   icon: "CloudOff",     tone: "water" },
    { id: "drought-a", label: "Regional Drought",    icon: "Sun",          tone: "heat" },
    { id: "feedback", label: "Forest Dieback",       icon: "TreeDeciduous", tone: "bio" },
    { id: "savanna", label: "Savannafication",       icon: "Wind",         tone: "bio" },
  ],
  drought: [
    { id: "rainfall", label: "Shifted Rainfall",     icon: "CloudOff",     tone: "water" },
    { id: "soil",     label: "Soil Degradation",     icon: "Mountain",     tone: "bio" },
    { id: "pump",     label: "Aquifer Overdraft",    icon: "ArrowDownToLine", tone: "water" },
    { id: "dry-d",    label: "Persistent Drought",   icon: "Sun",          tone: "heat" },
    { id: "yields",   label: "Yield Decline",        icon: "Wheat",        tone: "bio" },
    { id: "prices",   label: "Food Price Spike",     icon: "TrendingUp",   tone: "human" },
    { id: "migrate",  label: "Migration Pressure",   icon: "Users",        tone: "human" },
    { id: "fire-d",   label: "Wildfire Risk",        icon: "Flame",        tone: "heat" },
  ],
  heat: [
    { id: "uhi",     label: "Urban Heat Island",     icon: "Building2",    tone: "industry" },
    { id: "albedo-h", label: "Low Surface Albedo",   icon: "Square",       tone: "heat" },
    { id: "high",    label: "Blocking High Pressure", icon: "CircleDot",   tone: "climate" },
    { id: "dome",    label: "Heat Dome Forms",       icon: "CloudSun",     tone: "heat" },
    { id: "ac",      label: "Energy Demand Surge",   icon: "Zap",          tone: "industry" },
    { id: "grid",    label: "Grid Stress",           icon: "PlugZap",      tone: "industry" },
    { id: "health",  label: "Health Emergencies",    icon: "HeartPulse",   tone: "human" },
    { id: "mort",    label: "Mortality Spike",       icon: "Skull",        tone: "human" },
  ],
  mangrove: [
    { id: "shrimp", label: "Aquaculture Expansion", icon: "Fish",         tone: "industry" },
    { id: "clear-m", label: "Coastal Clearing",     icon: "Axe",          tone: "industry" },
    { id: "loss-m", label: "Mangrove Loss",         icon: "TreePalm",     tone: "bio" },
    { id: "carbon-m", label: "Blue Carbon Released", icon: "CloudFog",    tone: "climate" },
    { id: "sea",    label: "Sea Level Pressure",    icon: "Waves",        tone: "water" },
    { id: "surge",  label: "Storm Surge Exposure",  icon: "Wind",         tone: "water" },
    { id: "nursery", label: "Lost Fish Nurseries",  icon: "Fish",         tone: "bio" },
    { id: "coast-m", label: "Coastal Communities Hit", icon: "Users",     tone: "human" },
  ],
  fish: [
    { id: "demand-f", label: "Rising Seafood Demand", icon: "Users",      tone: "human" },
    { id: "trawl",    label: "Industrial Trawling",   icon: "Anchor",     tone: "industry" },
    { id: "bycatch",  label: "Bycatch Waste",         icon: "Trash2",     tone: "industry" },
    { id: "warm-f",   label: "Ocean Warming",         icon: "Thermometer", tone: "water" },
    { id: "oxy",      label: "Oxygen Depletion",      icon: "CircleSlash", tone: "water" },
    { id: "spawn",    label: "Spawning Failure",      icon: "EggOff",     tone: "bio" },
    { id: "collapse", label: "Stock Collapse",        icon: "TrendingDown", tone: "bio" },
    { id: "coastal-f", label: "Coastal Livelihoods Lost", icon: "HeartCrack", tone: "human" },
  ],
};

// Progressive hints per mystery — never reveal the full answer.
// Index 0 = subtle (attempt 2), Index 1 = moderate (attempt 3),
// Index 2 = stronger (attempt 4+).
export const HINTS: Record<string, string[]> = {
  arctic: [
    "Human activity sits at the very start of this chain.",
    "Sea ice melt happens before albedo loss — not after.",
    "The final card is the visible outcome the mystery is named after.",
  ],
  coral: [
    "This story starts on land, not in the ocean.",
    "Acidification and heat stress are intermediate, not endpoints.",
    "Coastal erosion is the last consequence in this chain.",
  ],
  amazon: [
    "Look for a demand-side driver as the first cause.",
    "Burning releases carbon before rainfall is disrupted.",
    "Savannafication is the terminal state of this system.",
  ],
  drought: [
    "Atmospheric change comes before what happens in the soil.",
    "Aquifer overdraft happens after the rain pattern shifts.",
    "Migration and wildfire are downstream, not upstream.",
  ],
  heat: [
    "Built environment matters first here — think city surfaces.",
    "The heat dome forms before the grid feels it.",
    "Mortality is the final, human consequence.",
  ],
  mangrove: [
    "A human industry kicks this chain off.",
    "Carbon release follows the loss of the trees themselves.",
    "Communities feel this last, after the ecosystem buffer is gone.",
  ],
  fish: [
    "Demand creates the pressure before the boats arrive.",
    "Warming and oxygen loss come after fishing pressure, not before.",
    "Loss of livelihoods is the final human cost.",
  ],
};
