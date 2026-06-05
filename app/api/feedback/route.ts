import { NextResponse } from "next/server";
import { getScenarioMarkdown } from "@/lib/scenario-files";
import { getScenario, isScenarioId } from "@/lib/scenarios";
import type { FeedbackResponse, TranscriptEntry } from "@/lib/types";

type FeedbackRequest = {
  scenarioId: string;
  contextAnswers: Record<string, string>;
  transcript: TranscriptEntry[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as FeedbackRequest;

  if (!isScenarioId(body.scenarioId)) {
    return NextResponse.json({ error: "Unknown scenario." }, { status: 400 });
  }

  const scenario = getScenario(body.scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Unknown scenario." }, { status: 400 });
  }

  const scenarioMarkdown = getScenarioMarkdown(body.scenarioId);

  try {
    const vertexFeedback = await generateVertexFeedback({
      scenarioTitle: scenario.title,
      scenarioMarkdown,
      contextAnswers: body.contextAnswers,
      transcript: body.transcript,
    });

    return NextResponse.json(vertexFeedback);
  } catch {
    return NextResponse.json(
      buildFallbackFeedback(scenario.title, body.transcript),
    );
  }
}

async function generateVertexFeedback({
  scenarioTitle,
  scenarioMarkdown,
  contextAnswers,
  transcript,
}: {
  scenarioTitle: string;
  scenarioMarkdown: string;
  contextAnswers: Record<string, string>;
  transcript: TranscriptEntry[];
}): Promise<FeedbackResponse> {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";
  const model = process.env.FEEDBACK_MODEL ?? "gemini-1.5-pro";

  if (!project) {
    throw new Error("Vertex AI is not configured.");
  }

  const vertexModule = (await import("@google-cloud/vertexai")) as typeof import("@google-cloud/vertexai");
  const vertex = new vertexModule.VertexAI({ project, location });
  const generativeModel = vertex.getGenerativeModel({
    model,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.25,
    },
  });

  const prompt = `You are evaluating a practice conversation for Negoshiate.

Return only JSON matching this shape:
{
  "overallAssessment": "string",
  "whatWorked": ["string"],
  "whatToImprove": ["string"],
  "bestMoment": "string",
  "missedOpportunity": "string",
  "suggestedReplacementLines": ["string"],
  "scorecard": [{"label": "string", "score": 1, "note": "string"}],
  "retryStrategy": "string"
}

Scenario: ${scenarioTitle}

Scenario guide:
${scenarioMarkdown}

Context answers:
${JSON.stringify(contextAnswers, null, 2)}

Transcript:
${transcript
  .map((entry) => `${entry.role === "agent" ? "Agent" : "User"}: ${entry.text}`)
  .join("\n")}

Base feedback on tactical empathy, mirroring, labeling, calibrated questions, accusation audits, no-oriented questions, clear asks, handling objections, summarizing the other person's position, and composure. Keep it direct, specific, and tied to the transcript.`;

  const result = await generativeModel.generateContent(prompt);
  const text = result.response.candidates?.[0]?.content?.parts
    ?.map((part) => ("text" in part ? part.text : ""))
    .join("");

  if (!text) throw new Error("No Vertex AI response.");
  return JSON.parse(text) as FeedbackResponse;
}

function buildFallbackFeedback(
  scenarioTitle: string,
  transcript: TranscriptEntry[],
): FeedbackResponse {
  const userTurns = transcript.filter((entry) => entry.role === "user");
  const hasQuestion = userTurns.some((entry) => entry.text.includes("?"));
  const hasClearAsk = userTurns.some((entry) =>
    /\b(ask|want|request|looking for|next step|approve|offer)\b/i.test(entry.text),
  );
  const bestUserLine = userTurns[0]?.text ?? "No user response was captured.";

  return {
    overallAssessment: `This ${scenarioTitle} practice run shows a workable foundation. The strongest next improvement is to make the ask more concrete, then use calibrated questions to uncover the counterparty's constraint instead of filling the silence.`,
    whatWorked: [
      "You established context early enough for the counterparty to respond.",
      hasClearAsk
        ? "You gave the conversation a direction with an explicit ask or desired next step."
        : "You kept the exchange professional and composed.",
      "You avoided sounding combative when the agent challenged you.",
    ],
    whatToImprove: [
      "Make the ask measurable and time-bound so the counterparty knows what decision is being requested.",
      hasQuestion
        ? "Use more calibrated questions that begin with how or what."
        : "Add at least one calibrated question to surface the other person's concern.",
      "Summarize the counterparty's position before moving to your next point.",
    ],
    bestMoment: bestUserLine,
    missedOpportunity:
      "When the counterparty pushed for specificity, you could have labeled the concern first, then asked what information would make the decision easier.",
    suggestedReplacementLines: [
      "It sounds like budget and timing are the main concerns. What would need to be true for this to be approved next cycle?",
      "I am asking for a concrete next step: can we agree on the decision criteria and date for review?",
      "Before I add more detail, how are you thinking about the tradeoff between scope, impact, and compensation here?",
    ],
    scorecard: [
      {
        label: "Tactical empathy",
        score: 3,
        note: "Professional tone was present, but labels and summaries can be sharper.",
      },
      {
        label: "Clear ask",
        score: hasClearAsk ? 4 : 2,
        note: hasClearAsk
          ? "The ask was visible, but it can be made more measurable."
          : "The counterparty still needs a more explicit decision request.",
      },
      {
        label: "Calibrated questions",
        score: hasQuestion ? 3 : 2,
        note: "Use questions to uncover constraints rather than only explaining your side.",
      },
      {
        label: "Composure",
        score: 4,
        note: "The response stayed calm under pressure.",
      },
    ],
    retryStrategy:
      "Retry with a one-sentence ask, one proof point, one label of the counterparty's likely concern, and one calibrated question that starts with 'what' or 'how'.",
  };
}
