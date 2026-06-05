import type { Scenario, ScenarioId } from "./types";

export const scenarios: Scenario[] = [
  {
    id: "salary-negotiation",
    title: "Salary Negotiation",
    shortTitle: "Salary",
    description:
      "Practice a compensation ask with realistic pushback from a decision-maker.",
    role: "Manager, recruiter, founder, or HR partner",
    outcome: "Clear ask, handled objections, concrete next step",
    accent: "#ff4704",
  },
  {
    id: "networking-introduction",
    title: "Networking Introduction",
    shortTitle: "Networking",
    description:
      "Practice introducing yourself and keeping a professional conversation alive.",
    role: "Peer, collaborator, recruiter, investor, or event contact",
    outcome: "Natural pitch, mutual context, follow-up path",
    accent: "#2c76f6",
  },
  {
    id: "behavioral-interview-star",
    title: "Behavioral Interview",
    shortTitle: "Interview",
    description:
      "Practice concise STAR answers under interviewer follow-up pressure.",
    role: "Hiring manager, recruiter, or panel interviewer",
    outcome: "Specific story, strong result, relevant reflection",
    accent: "#16a34a",
  },
];

export function getScenario(id: ScenarioId) {
  return scenarios.find((scenario) => scenario.id === id);
}

export function isScenarioId(value: string): value is ScenarioId {
  return scenarios.some((scenario) => scenario.id === value);
}
