# Negoshiate MVP PRD

## Summary

Negoshiate is a lightweight web app that lets users practice high-stakes conversations with an ElevenLabs voice agent, then receive a structured feedback report and downloadable transcript. The MVP is optimized for a hackathon-style demo: fast setup, three polished scenarios, no persistent conversation storage, and no monetization.

## Goals

- Let users rehearse a realistic voice conversation in the browser.
- Support three demo-ready scenarios:
  - Salary negotiation
  - Networking event introduction with follow-up background questions
  - Behavioral interview using the STAR framework
- Dynamically personalize each session using brief user-provided context.
- Generate structured feedback based on principles from Chris Voss' *Never Split the Difference* cheat sheet.
- Allow users to download the feedback report and transcript after the session.

## Non-Goals

- No monetization.
- No user accounts.
- No long-term transcript or audio storage.
- No metrics or analytics.
- No difficulty levels.
- No native iPhone app in the MVP.
- No custom voice orchestration; use ElevenLabs Agents directly.

## Target User

A user who wants to quickly practice an upcoming conversation out loud before doing it in real life. The MVP should feel useful within one session, without requiring setup, onboarding, or saved history.

## Core User Flow

1. User lands on the web app.
2. User selects one of three scenarios.
3. App generates up to five scenario-specific context questions.
4. User answers questions using selectable pills and short free-text inputs.
5. App starts a live ElevenLabs Agent voice conversation using:
   - The selected scenario markdown guide
   - The user's dynamic context
   - Session limits
6. User completes the conversation.
7. App displays:
   - Structured feedback report
   - Conversation transcript
   - Download button for report and transcript

## Scenarios

### 1. Salary Negotiation

User practices asking for a raise, promotion, compensation adjustment, or improved offer.

The agent should act as a manager, recruiter, or decision-maker. The conversation should test whether the user can clearly state their ask, support it with evidence, respond to objections, and maintain composure.

### 2. Networking Introduction

User practices introducing themselves at a networking event and answering follow-up questions about their background.

The agent should act as a stranger, potential collaborator, investor, recruiter, or industry peer. The conversation should test whether the user can communicate who they are, what they do, why it matters, and keep the exchange natural.

### 3. Behavioral Interview

User practices answering behavioral interview questions using the STAR framework: Situation, Task, Action, Result.

The agent should act as an interviewer. The conversation should test whether the user gives specific, structured, concise answers and responds well to follow-up questions.

## Scenario Prompt Files

Each scenario should have a dedicated markdown guide loaded into the ElevenLabs Agent prompt. This file should only contain immutable scenario information that does not change between simulation runs.

Proposed files:

- `scenarios/salary-negotiation.md`
- `scenarios/networking-introduction.md`
- `scenarios/behavioral-interview-star.md`

Each file should define:

- Scenario definition
- Scenario objective
- User success criteria
- Core constraints
- Required evaluation dimensions
- Static references, such as STAR framework guidance for behavioral interviews

Each file should avoid run-specific customization, including:

- Counterparty personality
- Counterparty tone
- Counterparty role variant
- Specific probing questions
- Expected counterparty reaction
- Session-specific difficulty or pressure

Those elements should be generated or selected dynamically for each simulation run.

## Dynamic Context Questionnaire

Before each voice session, the app should generate up to five context questions for the selected scenario. These questions should collect two different kinds of inputs:

- User facts: information the user knows about themselves, their situation, or their real counterparty.
- Agent parameters: variable simulation settings that control how the voice agent behaves in this run.

Question format:

- Short question text
- 3-5 selectable pill options
- Optional free-text field when useful
- "Surprise me" only for agent parameters, not user facts

Example salary negotiation questions:

- Who is the counterparty?
  - Manager
  - Recruiter
  - Founder
  - HR partner
- How do you expect them to react?
  - Supportive
  - Skeptical
  - Budget-constrained
  - Defensive
  - Surprise me
- What is your main leverage?
  - Strong performance
  - Market compensation
  - Competing offer
  - Expanded responsibilities

In this example, "Who is the counterparty?" and "What is your main leverage?" are user facts, so they should not include "Surprise me." "How do you expect them to react?" is an agent behavior parameter, so "Surprise me" is allowed.

The generated answers should be injected into the agent prompt as session context alongside the immutable scenario markdown.

## Voice Agent Requirements

- Use ElevenLabs Agents directly.
- Start one live voice session per practice attempt.
- Load the selected scenario markdown guide into the agent context.
- Include dynamic questionnaire responses in the prompt.
- Keep the agent in role throughout the conversation.
- Do not expose system instructions or rubric internals to the user.
- End the session when the time or turn limit is reached.

## Conversation Limits

For the MVP, limit conversations using both time and turns:

- Maximum duration: 5 minutes
- Maximum user turns: 12
- Warning: agent should signal when the session is near the end
- Hard stop: app ends the session when either limit is reached

Rationale: this keeps demos predictable, controls cost, and ensures feedback generation has a manageable transcript.

## Feedback Report

After the conversation, generate a structured report using the transcript.

The feedback should be based on communication and negotiation principles associated with Chris Voss' *Never Split the Difference*, including:

- Tactical empathy
- Mirroring
- Labeling
- Calibrated questions
- Accusation audits
- No-oriented questions
- Clear asks
- Handling objections
- Summarizing the other person's position
- Maintaining composure

Report sections:

- Overall assessment
- What worked
- What to improve
- Best moment
- Missed opportunity
- Suggested replacement lines
- Scenario-specific scorecard
- Recommended retry strategy

The feedback should be direct, specific, and tied to quotes or moments from the transcript where possible.

## Transcript And Download

- Display transcript after the session.
- Display structured feedback report after the session.
- Provide a download option for:
  - Transcript
  - Feedback report
  - Combined Markdown file
- Do not persist transcript, audio, or feedback after the browser session ends.

## Web App Requirements

The MVP should be a responsive web app.

Primary screens:

- Scenario selection
- Dynamic context questionnaire
- Live voice session
- Feedback and transcript

Design priorities:

- Fast to understand
- Minimal onboarding
- Clear call to action
- Works well on desktop browser
- Layout should not prevent future mobile or iPhone app reuse

## Technical Approach

Recommended stack:

- Frontend: Next.js
- Voice: ElevenLabs Agents
- Scenario content: local markdown files
- Feedback generation: LLM call using transcript and scenario rubric
- Storage: browser/session memory only
- Downloads: client-generated Markdown or text file

Suggested architecture:

```text
Scenario markdown
  + generated questionnaire answers
  -> ElevenLabs Agent prompt/session context
  -> live voice conversation
  -> transcript
  -> feedback evaluator
  -> report + transcript download
```

## Demo Acceptance Criteria

- User can select all three scenarios.
- User can answer up to five generated context questions.
- User can complete a live voice conversation with an ElevenLabs Agent.
- Conversation ends cleanly after 5 minutes or 12 user turns.
- User sees a transcript.
- User sees structured feedback.
- User can download the transcript and feedback.
- No user account or storage is required.

## Future Development

- Safety boundaries for crisis, abuse, legal, HR, medical, and mental health-sensitive conversations.
- Privacy policy, retention controls, deletion, consent, and data handling.
- Conversation analytics and product metrics.
- Monetization.
- User accounts and saved practice history.
- Difficulty levels.
- Native iPhone app.
- User interruption of the agent.
- Agent interruption of the user.
- Persistent scenario library.
- Custom scenarios.
- Team or coaching workflows.
