import type {
  ContextAnswers,
  FeedbackResponse,
  Scenario,
  TranscriptEntry,
} from "./types";

export function buildMarkdownDownload({
  scenario,
  answers,
  feedback,
  transcript,
}: {
  scenario: Scenario;
  answers: ContextAnswers;
  feedback: FeedbackResponse;
  transcript: TranscriptEntry[];
}) {
  const scorecard = feedback.scorecard
    .map((item) => `- ${item.label}: ${item.score}/5 - ${item.note}`)
    .join("\n");

  const answerLines = Object.entries(answers)
    .filter(([, value]) => value.trim().length > 0)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");

  const transcriptLines = transcript
    .map((entry) => `**${entry.role === "agent" ? "Agent" : "User"}:** ${entry.text}`)
    .join("\n\n");

  return `# Negoshiate Report: ${scenario.title}

Generated: ${new Date().toLocaleString()}

## Context

${answerLines || "No context answers captured."}

## Overall Assessment

${feedback.overallAssessment}

## What Worked

${feedback.whatWorked.map((item) => `- ${item}`).join("\n")}

## What To Improve

${feedback.whatToImprove.map((item) => `- ${item}`).join("\n")}

## Best Moment

${feedback.bestMoment}

## Missed Opportunity

${feedback.missedOpportunity}

## Suggested Replacement Lines

${feedback.suggestedReplacementLines.map((item) => `- ${item}`).join("\n")}

## Scorecard

${scorecard}

## Recommended Retry Strategy

${feedback.retryStrategy}

## Transcript

${transcriptLines || "No transcript captured."}
`;
}

export function downloadMarkdown(filename: string, markdown: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
