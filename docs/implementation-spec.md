# Negoshiate MVP Implementation Spec

## Objective

Build a demo-ready web app where a user selects a conversation scenario, answers a short setup questionnaire, practices with an ElevenLabs voice agent, then receives a transcript and structured feedback report for download.

Keep the implementation simple: no auth, no database, no saved history, no payments.

## Stack

- Web app: Next.js + TypeScript
- Voice: ElevenLabs Agents via `@elevenlabs/react`
- Personalization: ElevenLabs dynamic variables
- Feedback: server-side LLM call after the session, using Vertex AI by default
- Storage: browser memory only
- Export: client-generated Markdown download

## Screens

1. Scenario picker
2. Context questionnaire
3. Live voice simulation
4. Feedback + transcript

## Core Flow

```text
Select scenario
  -> answer up to 5 questions
  -> start ElevenLabs voice session
  -> collect transcript in browser state
  -> end after 5 minutes or 12 user turns
  -> generate feedback
  -> download transcript + feedback
```

## Proposed Files

```text
app/
  page.tsx
  api/
    elevenlabs-signed-url/route.ts
    feedback/route.ts
components/
  ScenarioPicker.tsx
  ContextQuestionnaire.tsx
  VoiceSimulation.tsx
  FeedbackReport.tsx
lib/
  scenarios.ts
  questions.ts
  downloads.ts
scenarios/
  salary-negotiation.md
  networking-introduction.md
  behavioral-interview-star.md
```

## Environment Variables

```text
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=
GOOGLE_APPLICATION_CREDENTIALS=
FEEDBACK_MODEL=
```

Use one ElevenLabs Agent for the MVP. Pass the selected scenario and run-specific context through dynamic variables.

`GOOGLE_APPLICATION_CREDENTIALS` is optional if the app runs in a Google Cloud environment with workload identity or default service account credentials.

## Scenario Files

Each scenario markdown file should contain only immutable scenario information:

- Scenario definition
- User objective
- Success criteria
- Required evaluation dimensions
- Static framework references, such as STAR for interviews

Do not include tone, counterparty personality, role variant, or exact probing questions. Those are generated or selected per run.

## Questionnaire

For the first build, hardcode question templates in `lib/questions.ts`. This is more predictable for a demo than AI-generated questionnaires.

Rules:

- Max 5 questions per scenario.
- Questions are either `user_fact` or `agent_parameter`.
- `Surprise me` is allowed only for `agent_parameter`.
- `Surprise me` is not allowed for user facts like main leverage, background, target role, or real counterparty.

Minimal shape:

```ts
type ContextQuestion = {
  id: string;
  label: string;
  kind: "user_fact" | "agent_parameter";
  options: string[];
  allowSurpriseMe: boolean;
};
```

## ElevenLabs Session

Use `@elevenlabs/react` for the live conversation.

Session input should include dynamic variables like:

```ts
{
  scenario_id: "salary-negotiation",
  scenario_markdown: "...",
  user_context_json: "...",
  agent_parameters_json: "...",
  conversation_start_mode: "agent_initialized",
  agent_opening_question: "...",
  conversation_guidance: "...",
  max_duration_minutes: "5",
  max_user_turns: "12"
}
```

If the ElevenLabs Agent is private, add `GET /api/elevenlabs-signed-url` to request a signed URL server-side using `ELEVENLABS_API_KEY`.

The React voice component should:

- Start the session.
- End the session manually or automatically.
- Capture agent and user transcript messages.
- Count user turns.
- Track elapsed time.

## Session Limits

Use both limits:

- 5 minutes maximum
- 12 user turns maximum

At 4 minutes or 10 user turns, show a visible wrapping-up state. At the hard limit, call `endSession()`.

## Feedback

Create `POST /api/feedback`.

Input:

```ts
{
  scenarioId: string;
  contextAnswers: Record<string, string>;
  transcript: { role: "user" | "agent"; text: string }[];
}
```

Output:

```ts
{
  overallAssessment: string;
  whatWorked: string[];
  whatToImprove: string[];
  bestMoment: string;
  missedOpportunity: string;
  suggestedReplacementLines: string[];
  scorecard: { label: string; score: number; note: string }[];
  retryStrategy: string;
}
```

Feedback should use the scenario success criteria and relevant *Never Split the Difference* principles: tactical empathy, mirroring, labeling, calibrated questions, objection handling, summarizing, and clear asks.

Use Vertex AI Gemini for the default implementation. Request structured JSON output matching the feedback response shape so the UI can render the report without fragile parsing.

## Download

Generate one Markdown file in the browser:

```text
negoshiate-{scenario-id}-{date}.md
```

Include:

- Scenario
- Context answers
- Feedback report
- Transcript

## Build Phases

### Phase 1: App Shell

- Create Next.js app.
- Add scenario picker.
- Add hardcoded scenario metadata.
- Add static scenario markdown files.
- Add questionnaire UI.

### Phase 2: Voice Simulation

- Install and wire `@elevenlabs/react`.
- Configure one ElevenLabs Agent.
- Pass dynamic variables into the session.
- Capture transcript.
- Add timer and turn limits.

### Phase 3: Feedback And Export

- Add `/api/feedback`.
- Render structured feedback.
- Add transcript display.
- Add Markdown download.

### Phase 4: Demo Polish

- Add loading, empty, and error states.
- Add microphone permission handling.
- Add restart flow.
- Test all three scenarios end to end.

## Demo Acceptance Checklist

- User can select each scenario.
- User can complete the questionnaire.
- `Surprise me` appears only for agent behavior parameters.
- Voice session starts and ends.
- Session auto-stops at 5 minutes or 12 user turns.
- Transcript appears.
- Feedback appears.
- Combined Markdown download works.

## Open Decisions

- Public ElevenLabs Agent vs private Agent with signed URL.
- Hardcoded questionnaire only vs optional AI-generated questionnaire.
- Exact Vertex AI Gemini model for feedback generation.

## Current Defaults

- One private ElevenLabs Agent.
- Signed URL route.
- Hardcoded questionnaires for demo reliability.
- Vertex AI Gemini for feedback generation.
- No persistence.
- 5-minute / 12-user-turn session limit.

## References

- ElevenLabs React SDK: https://elevenlabs.io/docs/conversational-ai/libraries/react
- ElevenLabs Next.js quickstart: https://elevenlabs.io/docs/agents-platform/guides/quickstarts/next-js
- ElevenLabs dynamic variables: https://elevenlabs.io/docs/eleven-agents/customization/personalization/dynamic-variables
- ElevenLabs signed URL endpoint: https://elevenlabs.io/docs/api-reference/conversations/get-signed-url
- Vertex AI Gemini content generation: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference
- Vertex AI structured output: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/control-generated-output
