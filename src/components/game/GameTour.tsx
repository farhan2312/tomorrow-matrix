import { useEffect } from "react";
import { runTourOnce } from "@/lib/tour";

/**
 * First-time guided tour of the game HUD. Mounted in the /play layout; runs
 * once per browser after a short delay so the HUD has rendered.
 */
export function GameTour() {
  useEffect(() => {
    const t = setTimeout(() => {
      runTourOnce("tm-tour-firstgame-v1", [
        {
          popover: {
            title: "Welcome to Terra 🌍",
            description:
              "The planet is at 40% health. Your mission: restore it to 70% by 2050. Here's a 20-second tour.",
          },
        },
        {
          element: '[data-tour="hud-terra"]',
          popover: {
            title: "Terra's Health",
            description:
              "The number you're fighting for. Every decision ripples through it, watch it climb as you act.",
          },
        },
        {
          element: '[data-tour="hud-cap"]',
          popover: {
            title: "Climate Action Points",
            description:
              "Your currency. Earn CAP by solving mysteries, then spend it on real-world interventions.",
          },
        },
        {
          element: '[data-tour="nav-mysteries"]',
          popover: {
            title: "Solve Mysteries",
            description:
              "Each mystery is a chain of cause and effect. Drag the 8 cards into order, first cause to final impact.",
          },
        },
        {
          element: '[data-tour="nav-marketplace"]',
          popover: {
            title: "Invest in Solutions",
            description:
              "Spend your CAP in the Marketplace on interventions that heal Terra's five indicators.",
          },
        },
        {
          popover: {
            title: "You're ready! 🦋",
            description:
              "Small actions, global change. Start with a Tier 1 mystery, and tap any underlined term for the glossary.",
          },
        },
      ]);
    }, 900);
    return () => clearTimeout(t);
  }, []);
  return null;
}
