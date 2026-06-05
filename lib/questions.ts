import type { ContextQuestion, ScenarioId } from "./types";

export const questionsByScenario: Record<ScenarioId, ContextQuestion[]> = {
  "salary-negotiation": [
    {
      id: "counterparty",
      label: "Who is the counterparty?",
      kind: "user_fact",
      options: ["Manager", "Recruiter", "Founder", "HR partner"],
      allowSurpriseMe: false,
    },
    {
      id: "ask",
      label: "What are you asking for?",
      kind: "user_fact",
      options: ["Raise", "Promotion", "Offer increase", "Expanded scope"],
      allowSurpriseMe: false,
      freeTextPlaceholder: "Add target amount, title, or terms",
    },
    {
      id: "leverage",
      label: "What is your strongest leverage?",
      kind: "user_fact",
      options: [
        "Strong performance",
        "Market compensation",
        "Competing offer",
        "Expanded responsibilities",
      ],
      allowSurpriseMe: false,
    },
    {
      id: "reaction",
      label: "How should they react?",
      kind: "agent_parameter",
      options: ["Supportive", "Skeptical", "Budget-constrained", "Defensive"],
      allowSurpriseMe: true,
    },
    {
      id: "pressure",
      label: "What pressure should the agent apply?",
      kind: "agent_parameter",
      options: ["Ask for proof", "Delay decision", "Offer less", "Question timing"],
      allowSurpriseMe: true,
    },
  ],
  "networking-introduction": [
    {
      id: "setting",
      label: "Where is this conversation happening?",
      kind: "user_fact",
      options: ["Conference", "Meetup", "Investor event", "Company mixer"],
      allowSurpriseMe: false,
    },
    {
      id: "counterparty",
      label: "Who are you talking to?",
      kind: "user_fact",
      options: ["Recruiter", "Founder", "Industry peer", "Potential collaborator"],
      allowSurpriseMe: false,
    },
    {
      id: "background",
      label: "What background should you practice explaining?",
      kind: "user_fact",
      options: ["Current role", "Career pivot", "Startup idea", "Recent project"],
      allowSurpriseMe: false,
      freeTextPlaceholder: "Add a one-line version of your background",
    },
    {
      id: "curiosity",
      label: "What should the agent be curious about?",
      kind: "agent_parameter",
      options: ["Your motivation", "Your experience", "Your product", "Your goals"],
      allowSurpriseMe: true,
    },
    {
      id: "energy",
      label: "What tone should the counterparty bring?",
      kind: "agent_parameter",
      options: ["Warm", "Distracted", "Direct", "Highly curious"],
      allowSurpriseMe: true,
    },
  ],
  "behavioral-interview-star": [
    {
      id: "target_role",
      label: "What role are you targeting?",
      kind: "user_fact",
      options: ["Product", "Engineering", "Operations", "Sales"],
      allowSurpriseMe: false,
      freeTextPlaceholder: "Add a more specific role or company",
    },
    {
      id: "story_type",
      label: "Which story should the interviewer probe?",
      kind: "user_fact",
      options: ["Conflict", "Leadership", "Failure", "Ambiguity"],
      allowSurpriseMe: false,
    },
    {
      id: "strength",
      label: "What strength do you want to show?",
      kind: "user_fact",
      options: ["Ownership", "Communication", "Analytical thinking", "Resilience"],
      allowSurpriseMe: false,
    },
    {
      id: "interviewer_style",
      label: "What interviewer style should you face?",
      kind: "agent_parameter",
      options: ["Friendly", "Skeptical", "Detail-oriented", "Time-boxed"],
      allowSurpriseMe: true,
    },
    {
      id: "follow_up_focus",
      label: "What should follow-ups emphasize?",
      kind: "agent_parameter",
      options: ["Metrics", "Tradeoffs", "Your role", "Lessons learned"],
      allowSurpriseMe: true,
    },
  ],
};

export function getQuestionsForScenario(scenarioId: ScenarioId) {
  return questionsByScenario[scenarioId];
}

export function splitContextAnswers(
  scenarioId: ScenarioId,
  answers: Record<string, string>,
) {
  const questions = getQuestionsForScenario(scenarioId);
  return questions.reduce(
    (groups, question) => {
      groups[question.kind][question.id] = answers[question.id] ?? "";
      return groups;
    },
    {
      user_fact: {} as Record<string, string>,
      agent_parameter: {} as Record<string, string>,
    },
  );
}
