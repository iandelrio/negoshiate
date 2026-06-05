export type ScenarioId =
  | "salary-negotiation"
  | "networking-introduction"
  | "behavioral-interview-star";

export type Scenario = {
  id: ScenarioId;
  title: string;
  shortTitle: string;
  description: string;
  role: string;
  outcome: string;
  accent: string;
};

export type QuestionKind = "user_fact" | "agent_parameter";

export type ContextQuestion = {
  id: string;
  label: string;
  kind: QuestionKind;
  options: string[];
  allowSurpriseMe: boolean;
  freeTextPlaceholder?: string;
};

export type ContextAnswers = Record<string, string>;

export type TranscriptEntry = {
  role: "user" | "agent";
  text: string;
};

export type ScorecardItem = {
  label: string;
  score: number;
  note: string;
};

export type FeedbackResponse = {
  overallAssessment: string;
  whatWorked: string[];
  whatToImprove: string[];
  bestMoment: string;
  missedOpportunity: string;
  suggestedReplacementLines: string[];
  scorecard: ScorecardItem[];
  retryStrategy: string;
};
