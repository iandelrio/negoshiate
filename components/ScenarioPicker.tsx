"use client";

import { ArrowRight, BriefcaseBusiness, Handshake, MessagesSquare } from "lucide-react";
import type { Scenario, ScenarioId } from "@/lib/types";

const icons = {
  "salary-negotiation": BriefcaseBusiness,
  "networking-introduction": Handshake,
  "behavioral-interview-star": MessagesSquare,
} satisfies Record<ScenarioId, typeof BriefcaseBusiness>;

export function ScenarioPicker({
  scenarios,
  selectedId,
  onSelect,
}: {
  scenarios: Scenario[];
  selectedId: ScenarioId | null;
  onSelect: (id: ScenarioId) => void;
}) {
  return (
    <section className="scenario-grid" aria-label="Choose a scenario">
      {scenarios.map((scenario) => {
        const Icon = icons[scenario.id];
        const selected = selectedId === scenario.id;

        return (
          <button
            className={`scenario-tile ${selected ? "selected" : ""}`}
            key={scenario.id}
            onClick={() => onSelect(scenario.id)}
            type="button"
          >
            <span className="scenario-accent" style={{ background: scenario.accent }} />
            <span className="scenario-top">
              <span className="icon-shell">
                <Icon aria-hidden="true" size={18} />
              </span>
              <ArrowRight aria-hidden="true" className="tile-arrow" size={18} />
            </span>
            <span className="scenario-copy">
              <span className="scenario-title">{scenario.title}</span>
              <span className="scenario-description">{scenario.description}</span>
            </span>
            <span className="scenario-meta">
              <span>{scenario.role}</span>
              <span>{scenario.outcome}</span>
            </span>
          </button>
        );
      })}
    </section>
  );
}
